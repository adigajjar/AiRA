from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import spacy
import string
import google.generativeai as genai
from spacy.lang.en.stop_words import STOP_WORDS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import language_tool_python
from flask_cors import CORS
import pickle
import networkx as nx
import requests
import fitz
from PIL import Image
import chromadb
from bs4 import BeautifulSoup
from langchain.embeddings.sentence_transformer import SentenceTransformerEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain.text_splitter import RecursiveCharacterTextSplitter

app = Flask(__name__)
CORS(app)
tool = language_tool_python.LanguageTool("en-US")
# Load dataset
df = pd.read_csv(r"D:\AiRA\server\data\research_papers.csv")

# Load NLP model
nlp = spacy.load("en_core_web_sm")

# Precomputed storage
tfidf_vectorizer = None
tfidf_matrix = None


def evaluate_query(query):
    """Evaluates the query based on length and grammar correctness."""
    matches = tool.check(query)
    errors = len(matches)
    length_score = min(10, len(query.split()) / 2)
    grammar_score = max(0, 10 - errors)
    total_score = (length_score + grammar_score) / 2
    return total_score


def optimize_query_with_gemini(query):
    """Uses Gemini AI to optimize the query by improving grammar and clarity."""
    genai.configure(api_key="AIzaSyC51bN6_qy4zn3jzU3gHmalTWGwzIlOePc")
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(
        f"Extract key technical terms from the following research query and generate a list of related scholarly terms. "
        f"Do NOT include any labels, introductions, explanations, or extra formatting. "
        f"Only output a comma-separated list of related technical terms. "
        f"Query: {query}"
    )

    return response.text.strip()


def transform_text_spacy(text):
    """Preprocess text using SpaCy for tokenization and lemmatization."""
    text = text.lower()
    doc = nlp(text)

    tokens = [
        token.lemma_
        for token in doc
        if token.is_alpha
        and token.text not in STOP_WORDS
        and token.text not in string.punctuation
    ]

    return " ".join(tokens)


def precompute_tfidf():
    """Precompute TF-IDF vectors for all research papers."""
    global tfidf_vectorizer, tfidf_matrix

    df["processed_text"] = (df["title"] + " " + df["abstract"]).apply(
        transform_text_spacy
    )

    # Initialize and fit the vectorizer
    tfidf_vectorizer = TfidfVectorizer()
    tfidf_matrix = tfidf_vectorizer.fit_transform(df["processed_text"])

    # Save precomputed results for later reuse
    with open("tfidf_vectorizer.pkl", "wb") as f:
        pickle.dump(tfidf_vectorizer, f)
    with open("tfidf_matrix.pkl", "wb") as f:
        pickle.dump(tfidf_matrix, f)


def load_precomputed_tfidf():
    """Load precomputed TF-IDF vectors from file."""
    global tfidf_vectorizer, tfidf_matrix

    try:
        with open("tfidf_vectorizer.pkl", "rb") as f:
            tfidf_vectorizer = pickle.load(f)
        with open("tfidf_matrix.pkl", "rb") as f:
            tfidf_matrix = pickle.load(f)
    except FileNotFoundError:
        print("Precomputed TF-IDF data not found. Computing from scratch...")
        precompute_tfidf()


def search_papers(query, top_n=5):
    query = transform_text_spacy(query)

    query_vec = tfidf_vectorizer.transform([query])

    cosine_similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()

    df_copy = df.copy()
    df_copy["similarity"] = cosine_similarities

    # Get top N matching paperIds
    paper_ids = (
        df_copy.sort_values(by="similarity", ascending=False)
        .head(top_n)["paperId"]
        .tolist()
    )

    return paper_ids


graph_file = "research_paper_graph.graphml"
G = nx.read_graphml(graph_file)


def get_paper_details(paper_id):
    """Fetch title, abstract, year, and citationCount from dataset or Semantic Scholar API."""

    # Check if paper exists in the dataset
    paper_data = df.loc[
        df["paperId"] == paper_id, ["title", "abstract", "year", "citationCount"]
    ]

    if not paper_data.empty:
        return {
            "title": paper_data.iloc[0]["title"],
            "abstract": paper_data.iloc[0]["abstract"],
            "year": int(paper_data.iloc[0]["year"]),
            "citationCount": int(paper_data.iloc[0]["citationCount"]),
        }

    # If not found, fetch from Semantic Scholar
    url = f"https://api.semanticscholar.org/v1/paper/{paper_id}"
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            return {
                "title": data.get("title", "Unknown Title"),
                "abstract": data.get("abstract", "Abstract not available"),
                "year": data.get("year", "Year not available"),
                "citationCount": data.get(
                    "citationCount", 0
                ),  # Default to 0 if missing
            }
    except requests.exceptions.RequestException:
        pass

    # Return default values if both sources fail
    return {
        "title": "Unknown Title",
        "abstract": "Abstract not available",
        "year": "Year not available",
        "citationCount": 0,
    }


def get_rwr_recommendations(
    G, seed_paper, restart_prob=0.15, max_iter=100, tol=1e-6, min_score_threshold=0.01
):
    """Performs Random Walk with Restart (RWR) on the graph for a given seed paper."""

    if not G.has_node(seed_paper):
        raise ValueError(f"Seed paper {seed_paper} not found in graph.")

    # Get subgraph of the connected component
    component = nx.node_connected_component(G, seed_paper)
    G_sub = G.subgraph(component).copy()
    nodes = list(G_sub.nodes())
    num_nodes = len(nodes)

    # Index mapping
    node_idx = {node: i for i, node in enumerate(nodes)}

    # Create normalized adjacency matrix
    adj_matrix = nx.to_numpy_array(G_sub, nodelist=nodes, weight="weight")
    row_sums = adj_matrix.sum(axis=1, keepdims=True)
    row_sums[row_sums == 0] = 1  # Avoid division by zero
    transition_matrix = adj_matrix / row_sums

    # Initialize probability distribution
    p = np.zeros(num_nodes)
    p[node_idx[seed_paper]] = 1.0

    # Perform power iteration
    for _ in range(max_iter):
        new_p = (1 - restart_prob) * np.dot(transition_matrix.T, p) + restart_prob * p
        if np.linalg.norm(new_p - p, 1) < tol:
            break
        p = new_p

    # Convert results to dictionary
    scores = {nodes[i]: p[i] for i in range(num_nodes)}

    # Filter by threshold
    filtered_recommendations = {
        paper: score for paper, score in scores.items() if score > min_score_threshold
    }

    # Sort recommendations by score
    sorted_recommendations = dict(
        sorted(filtered_recommendations.items(), key=lambda item: item[1], reverse=True)
    )

    return sorted_recommendations


def generate_recommendations(query, top_n=5):

    # Step 1: Get top search results (paper IDs)
    seed_paper_ids = search_papers(query, top_n)

    # Step 2: Run RWR for each seed paper
    all_recommendations = {}  # Use dictionary to maintain unique papers

    for seed_paper in seed_paper_ids:
        try:
            rwr_results = get_rwr_recommendations(G, seed_paper)
            recommended_papers = list(rwr_results.keys())[:10]

            # Add seed paper details
            seed_paper_details = get_paper_details(seed_paper)
            all_recommendations[seed_paper] = seed_paper_details

            # Add recommended papers
            for paper in recommended_papers:
                if paper not in all_recommendations:
                    all_recommendations[paper] = get_paper_details(paper)

        except ValueError as e:
            print(f"Skipping {seed_paper} - {e}")

    return list(all_recommendations.values())  # Convert dictionary to list


@app.route("/api/search", methods=["POST"])
def search():
    """API endpoint for searching research papers."""
    data = request.get_json()
    query = data.get("query", "")

    if not query:
        return jsonify({"error": "Query parameter is missing"}), 400

    score = evaluate_query(query)

    optimized_query = optimize_query_with_gemini(query)
    query = query + " " + optimized_query

    results = generate_recommendations(query)
    return jsonify({"query": query, "score": score, "results": results})


GEMINI_API_KEY = "AIzaSyDb0vxQem0gOAaRFJIpwRT7MPaxjWCHWYw"
genai.configure(api_key=GEMINI_API_KEY)

chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(name="document_embeddings")


### 📌 TEXT EXTRACTION FUNCTIONS
def extract_text_from_pdf(pdf_file):
    """Extract text from a PDF file."""
    text = ""
    try:
        with fitz.open(stream=pdf_file, filetype="pdf") as doc:
            for page in doc:
                text += page.get_text("text") + "\n"
    except Exception as e:
        return str(e)
    return text.strip()


def extract_text_from_url(url):
    """Extract text from a web page using BeautifulSoup."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.google.com/",
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        return soup.get_text()
    except Exception as e:
        return str(e)


### 📌 DOCUMENT STORAGE IN CHROMADB


def store_documents_in_chromadb(text_list):
    """Store document chunks into ChromaDB."""
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
    all_chunks = []

    for text in text_list:
        chunks = text_splitter.split_text(text)

        # Ensure chunks are within the size limit
        for chunk in chunks:
            if len(chunk) > 500:
                chunk = chunk[:500]  # Truncate if necessary
            all_chunks.append(chunk)

    embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
    vectors = embeddings.embed_documents(all_chunks)

    for i, (chunk, vector) in enumerate(zip(all_chunks, vectors)):
        collection.add(ids=[str(i)], embeddings=[vector], metadatas=[{"text": chunk}])


### 📌 AI RESPONSE GENERATION
def retrieve_context(query):
    """Retrieve relevant text chunks from stored documents."""
    embedding = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
    query_vector = embedding.embed_query(query)
    results = collection.query(query_embeddings=[query_vector], n_results=3)
    return [res["text"] for res in results["metadatas"][0]]


def answer_question(query, context):
    """Generate an AI-powered answer with Gemini."""
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(
        f"""Context: {context}  
Question: {query}  

Instructions:  
- Provide a concise and well-structured answer based strictly on the given context.  
- Provide a paragraph that is **factually accurate, simple, and to the point**.
- For bullet points use a '-' or '*'.
- Dont include any formulae or equations.
- Do **not** add any information outside the provided context.  
- Keep responses **factually accurate, simple, and to the point**.  
- If the context does not contain enough information, explicitly state: "Insufficient data in the provided text."
"""
    )
    return response.text if response.text else "No response from AI."


def create_mindmap_markdown(text):
    """Generate a hierarchical markdown mindmap using Gemini AI."""
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        prompt = f"""
        Create a markdown mindmap from this text:
        {text}
        Respond only with the markdown mindmap.
        """
        response = model.generate_content(prompt)
        return response.text.strip() if response.text else None
    except Exception as e:
        return str(e)


@app.route("/api/process_documents", methods=["POST"])
def process_documents():
    """Endpoint to process uploaded PDFs, images, or web URLs."""
    try:
        files = request.files.getlist("files")
        url = request.form.get("url")
        text_list = []

        for file in files:
            if file.content_type == "application/pdf":
                text_list.append(extract_text_from_pdf(file.read()))

        if url:
            text_list.append(extract_text_from_url(url))

        if text_list:
            print(text_list)
            store_documents_in_chromadb(text_list)
            return (
                jsonify({"message": "Documents processed and stored successfully!"}),
                200,
            )
        else:
            return jsonify({"error": "No valid documents provided."}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/ask_question", methods=["POST"])
def ask_question():
    """Endpoint to answer questions using AI and document retrieval."""
    try:
        data = request.get_json()
        query = data.get("query")

        if not query:
            return jsonify({"error": "Query is required"}), 400

        context = retrieve_context(query)
        answer = answer_question(query, "\n".join(context))
        return jsonify({"question": query, "answer": answer}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/generate_mindmap", methods=["POST"])
def generate_mindmap():
    """Endpoint to generate a mindmap from processed documents."""
    try:
        data = request.get_json()
        text = data.get("text")

        if not text:
            return jsonify({"error": "Text is required"}), 400

        mindmap_md = create_mindmap_markdown(text)
        return jsonify({"mindmap": mindmap_md}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    load_precomputed_tfidf()
    app.run(debug=True, use_reloader=False)
