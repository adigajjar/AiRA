import { useState } from 'react';

function SourcesPanel({ sources, addSource, toggleSource }) {
  const [newSource, setNewSource] = useState('');

  // Add source dynamically
  const handleAddSource = () => {
    if (newSource.trim() !== '') {
      addSource(newSource);
      setNewSource('');
    }
  };

  return (
    <div className="w-1/5 bg-[#FFEBCD] shadow-md p-4 border-r border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Sources</h2>

      {/* Add Source Input */}
      <div className="flex mb-4 space-x-2">
        <input
          type="text"
          placeholder="Add source name..."
          value={newSource}
          onChange={(e) => setNewSource(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none"
        />
        <button
          onClick={handleAddSource}
          className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600"
        >
          Add
        </button>
      </div>

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
              className={`text-sm ${source.selected ? 'text-black' : 'text-gray-500'}`}
            >
              {source.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SourcesPanel;
