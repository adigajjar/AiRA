import { useState } from "react";

function SourcesPanel({ toggleSource }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [url, setUrl] = useState("");
  const [sources, setSources] = useState([]);

  const addSource = (newSources) => {
    setSources((prevSources) => {
      const existingIds = new Set(prevSources.map((source) => source.id));
      const filteredSources = newSources.filter((source) => !existingIds.has(source.id));
      return [...prevSources, ...filteredSources];
    });
  };
  
  // Open Modal
  const openModal = () => setShowModal(true);
  // Close Modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedFiles([]);
    setUrl("");
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // File size validation (max 15MB per file)
    const validFiles = files.filter((file) => {
      if (file.size > 15 * 1024 * 1024) {
        alert(`${file.name} is too large. Max size is 15MB.`);
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);
  };

  const handleAddSources = async () => {
    if (selectedFiles.length === 0 && !url) {
      alert("Please select at least one file or enter a URL.");
      return;
    }

    const formData = new FormData();

    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    if (url) {
      formData.append("url", url);
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/process_documents",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Prepare new sources list
        const newSources = [
          ...selectedFiles.map((file) => ({
            id: `${file.name}-${file.lastModified}`, // Unique ID for file
            name: file.name,
            selected: false,
          })),
          ...(url
            ? [
                {
                  id: `url-${Date.now()}`,
                  name: url,
                  selected: false,
                },
              ]
            : []),
        ];

        // Add new sources to the panel
        addSource(newSources);
        alert(data.message);
        closeModal();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error while processing documents:", error);
      alert("Failed to process documents. Please try again.");
    }
  };

  return (
    <div
      className="w-1/5 shadow-md p-4 border-r border-gray-200"
      style={{
        background: "linear-gradient(135deg, #fff5e1, #fceabb)",
        boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
        borderWidth: "3px",
        borderStyle: "solid",
        borderImage: "linear-gradient(to right, blue, yellow)",
        borderRightWidth: "5px",
      }}
    >
      <h2 className="text-lg font-semibold mb-4">Sources</h2>

      {/* Add Source Button */}
      <button
        onClick={openModal}
        className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 w-full mb-4"
      >
        + Add Source
      </button>

      {/* List of Sources */}
      <div className="space-y-2">
        {sources.map((source) => (
          <div key={source.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={source.selected}
              onChange={() => toggleSource(source.id)}
              className="w-4 h-4"
            />
            <span
              className={`text-sm ${
                source.selected ? "text-black" : "text-gray-500"
              }`}
            >
              {source.name}
            </span>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 flex opacity-96 justify-center items-center backdrop-blur-md">
          <div className="bg-white p-5 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Select Files</h2>

            {/* File Input */}
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              accept=".pdf, .docx, .txt"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none mb-4"
            />

            {/* Selected Files List */}
            <ul className="mb-4">
              {selectedFiles.map((file) => (
                <li
                  key={`${file.name}-${file.lastModified}`}
                  className="text-sm text-gray-600"
                >
                  📄 {file.name}
                </li>
              ))}
            </ul>

            {/* URL Input */}
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none mb-4"
              placeholder="Enter URL"
            />

            {/* Modal Buttons */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeModal}
                className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSources}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SourcesPanel;
