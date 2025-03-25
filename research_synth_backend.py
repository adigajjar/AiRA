from flask import Flask, request, jsonify
from flask_cors import CORS
import fitz  # PyMuPDF for PDFs
import pytesseract
from PIL import Image
import google.generativeai as genai
import chromadb
import requests
from bs4 import BeautifulSoup
from langchain.embeddings.sentence_transformer import SentenceTransformerEmbeddings
from langchain.text_splitter import CharacterTextSplitter

# 🔹 Initialize Flask app
app = Flask(__name__)
CORS(app)

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
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        return soup.get_text()
    except Exception as e:
        return str(e)

### 📌 DOCUMENT STORAGE IN CHROMADB
def store_documents_in_chromadb(text_list):
    """Store document chunks into ChromaDB."""
    text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=100)
    all_chunks = []

    for text in text_list:
        chunks = text_splitter.split_text(text)
        all_chunks.extend(chunks)

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
    response = model.generate_content(f"Context: {context}\nQuestion: {query}\nProvide a well-structured answer.")
    return response.text if response.text else "No response from AI."

### 📌 MINDMAP GENERATION
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

### 📌 API ROUTES

@app.route("/process_documents", methods=["POST"])
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
            store_documents_in_chromadb(text_list)
            return jsonify({"message": "Documents processed and stored successfully!"}), 200
        else:
            return jsonify({"error": "No valid documents provided."}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/ask_question", methods=["POST"])
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
    app.run(debug=True)
