import { useState } from 'react';

function SourcesPanel({ sources, addSource, toggleSource }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Open Modal
  const openModal = () => setShowModal(true);

  // Close Modal
  const closeModal = () => setShowModal(false);

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  // Add selected files to sources list
// Correctly add multiple sources at once
const handleAddSources = () => {
  const newSources = selectedFiles.map((file) => ({
    id: file.name, // Using file name as id
    name: file.name,
    selected: false,
  }));


  addSource(newSources);

  
  setSelectedFiles([]);
  closeModal();
};


  return (
    <div className="w-1/5 bg-[#FFEBCD] shadow-md p-4 border-r border-gray-200"
    style={{
      background: "linear-gradient(135deg, #fff5e1, #fceabb)", 
      boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
      borderWidth: "3px", 
      borderStyle: "solid",
      borderImage: "linear-gradient(to right, blue, yellow)",
      borderRightWidth: "5px", 
    }}>
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
                source.selected ? 'text-black' : 'text-gray-500'
              }`}
            >
              {source.name}
            </span>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray bg-opacity-0 flex justify-center backdrop-blur-md items-center">
          <div className="bg-white p-5 rounded-lg shadow-lg w-xl">
            <h2 className="text-lg font-semibold mb-4">Select Files</h2>
            
            {/* File Input */}
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none mb-4"
            />
            
            {/* Selected Files List */}
            <ul className="mb-4">
              {selectedFiles.map((file) => (
                <li key={file.name} className="text-sm text-gray-600">
                  📄 {file.name}
                </li>
              ))}
            </ul>

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
