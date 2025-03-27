import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import Loader from "../components/Loader";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [score, setScore] = useState(0);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearched, setIsSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isPlaceholderVisible, setIsPlaceholderVisible] = useState(true);

  const handleSearch = async (e) => {
    e.preventDefault(); // Prevent form default submission
    if (!searchQuery.trim()) return;

    console.log("Search Query:", searchQuery);
    setLoading(true);
    setIsSearched(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await response.json();
      console.log("Search Results:", data);

      setSearchResults(data.results);
      setScore(data.score);
      setQuery(data.query);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`bg-[#FFEBCD] flex flex-col items-center min-h-[calc(100vh-75px)] ${
        isSearched ? "pt-10" : "justify-center"
      }`}
    >
      {!isSearched && (
        <div className="text-center mb-10">
          <h1 className="text-6xl font-bold text-black mb-4">
            AiRA
            <span className="text-4xl font-light text-gray-700 block mt-2">
              AI Research Assistant
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 px-4">
            Discover breakthrough insights with graph-based recommendations.
            Leverage AI to transform your research workflow and uncover hidden
            connections.
          </p>
        </div>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="w-full max-w-[600px] px-4">
        <div className="relative">
          <div
            className="p-[3px] rounded-full"
            style={{
              background: "linear-gradient(to right, blue, yellow)",
            }}
          >
            <div className="bg-white rounded-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsPlaceholderVisible(false)}
                onBlur={() => setIsPlaceholderVisible(searchQuery === "")}
                placeholder={isPlaceholderVisible ? "Search papers..." : ""}
                className="w-full py-3 pl-12 pr-4 text-xl text-black placeholder-gray-500 bg-transparent rounded-full outline-none font-medium"
                style={{
                  boxShadow:
                    "rgba(240, 46, 170, 0.4) -5px 5px, rgba(240, 46, 170, 0.3) -10px 10px, rgba(240, 46, 170, 0.2) -15px 15px, rgba(240, 46, 170, 0.1) -20px 20px, rgba(240, 46, 170, 0.05) -25px 25px",
                }}
              />
              <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl" />
            </div>
          </div>
        </div>
      </form>

      {/* Search Results */}
      {loading ? (
        <Loader />
      ) : (
        isSearched && (
          <div className="w-full max-w-4xl mt-8 px-4">
            <div>
              <p>Score: {score}</p>
              <p>Query: {query}</p>
            </div>
            <h2 className="text-2xl font-bold mb-6">✨Discoveries</h2>
            {searchResults.length > 0 ? (
              searchResults.map((result, index) => (
                <div key={index} className="custom-box p-6 mb-6">
                  <h3 className="text-xl font-semibold text-black mb-2">
                    {result.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{result.abstract}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Citations: {result.citationCount}
                    </span>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Read Paper
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-lg">No results found.</p>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default Search;
