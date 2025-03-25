function SourcesPanel() {
    return (
      <div className="w-1/4 bg-[#FFEBCD] shadow-md p-4 border-r border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Sources</h2>
  
        <button className="w-full bg-blue-500 text-white py-2 rounded-lg mb-4">
          + Add source
        </button>
  
        <div className="flex items-center space-x-2 mb-2">
          <input type="checkbox" checked className="w-4 h-4" />
          <span className="text-sm">DMFDDI.pdf</span>
        </div>
      </div>
    );
  }
  
  export default SourcesPanel;
  