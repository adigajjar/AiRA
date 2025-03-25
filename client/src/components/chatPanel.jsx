function ChatPanel() {
    return (
      <div className="flex-1 p-4 overflow-y-auto bg-[#FFEBCD] shadow-md">
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <h3 className="text-xl font-bold mb-1">
            📄 DMFDDI: Deep Multimodal Fusion for Drug-Drug Interaction Prediction
          </h3>
          <p className="text-sm text-gray-500">1 source</p>
          <p className="mt-2 text-sm text-gray-700">
            The provided text is a research paper introducing <b>DMFDDI</b>, a novel deep learning framework for predicting drug-drug interactions (DDIs).
          </p>
        </div>
  
        <input
          type="text"
          placeholder="Start typing..."
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
  }
  
  export default ChatPanel;
  