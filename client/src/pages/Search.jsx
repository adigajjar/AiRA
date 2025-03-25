import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import axios from "axios";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearched, setIsSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/search", {
        query: searchQuery,
      });
      setSearchResults(response.data.results);
      setIsSearched(true);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  return (
    <div
      className={`bg-[#FFEBCD] flex flex-col items-center ${
        isSearched ? "pt-10" : "justify-center h-[90.1vh]"
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

      {/* Search Bar - Always Visible */}
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
                placeholder="Search papers..."
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
      {isSearched && (
        <div className="w-full max-w-4xl mt-8 px-4">
          <h2 className="text-2xl font-bold mb-6">Search Results</h2>
          {searchResults.map((result, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-black mb-2">
                {result.title}
              </h3>
              <p className="text-gray-600 mb-4">{result.abstract}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Authors: {result.authors}
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
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
