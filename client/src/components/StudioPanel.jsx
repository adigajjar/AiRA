function StudioPanel() {
    return (
      <div className="w-1/4 bg-[#FFEBCD] shadow-md p-4 border-l border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Studio</h2>
  
        {/* Audio Overview Section */}
        <div className="bg-gray-100 p-3 rounded-lg mb-4">
          <h4 className="text-sm font-medium mb-2">🎙️ Deep Dive conversation</h4>
          <div className="flex space-x-2">
            <button className="bg-gray-200 px-3 py-1 text-xs rounded-lg">Customize</button>
            <button className="bg-blue-500 text-white px-3 py-1 text-xs rounded-lg">Generate</button>
          </div>
        </div>
  
        {/* Notes Section */}
        <div>
          <h4 className="text-sm font-medium mb-2">Notes</h4>
          <button className="w-full bg-gray-200 text-xs py-2 rounded-lg mb-2">+ Add note</button>
  
          <div className="flex space-x-2">
            <button className="bg-gray-200 text-xs px-2 py-1 rounded-lg">Study guide</button>
            <button className="bg-gray-200 text-xs px-2 py-1 rounded-lg">Briefing doc</button>
          </div>
        </div>
      </div>
    );
  }
  
  export default StudioPanel;
  