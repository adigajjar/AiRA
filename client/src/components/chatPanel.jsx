import { useState } from "react";

function ChatPanel({ messages, sendMessage, generateMindMap }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() !== "") {
      sendMessage(input);
      setInput("");
    }
  };

  const handleGenerateMindMap = () => {
    generateMindMap();
  };

  return (
    <div className="flex-1 p-4 bg-[#FFEBCD] shadow-md overflow-y-auto  flex flex-col space-y-4">

      <div className="h-110 flex flex-col justify-between border-b border-gray-300 pb-4">
  
        <div className="h-1/2 flex-1 overflow-y-auto mb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="bg-gray-100 p-3 rounded-lg mb-2 shadow-md"
            >
              {msg.text}
            </div>
          ))}
        </div>


        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Start typing..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500 bg-transparent rounded-full outline-none font-medium"
            style={{
              boxShadow:
                "rgba(240, 46, 170, 0.4) -5px 5px, rgba(240, 46, 170, 0.3) -10px 10px, rgba(240, 46, 170, 0.2) -15px 15px, rgba(240, 46, 170, 0.1) -20px 20px, rgba(240, 46, 170, 0.05) -25px 25px",
            }}
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            style={{
              background: "linear-gradient(90deg, #4facfe, #00f2fe)",
              boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
            }}
          >
            Send
          </button>
        </div>
      </div>
      <br></br>
      <div className="flex justify-center items-center h-1/2">
  <div
    className="w-400 shadow-md p-6 rounded-lg flex flex-col items-center justify-center"
    style={{
      background: "linear-gradient(135deg, #fff5e1, #fceabb)",
      boxShadow:"rgba(240, 46, 170, 0.4) -5px 5px, rgba(240, 46, 170, 0.3) -10px 10px, rgba(240, 46, 170, 0.2) -15px 15px, rgba(240, 46, 170, 0.1) -20px 20px, rgba(240, 46, 170, 0.05) -25px 25px",
    }}
  >
    <h1 className="text-xl font-medium mb-4 text-black placeholder-gray-500">Generate Mind Map</h1>
    <button
      onClick={handleGenerateMindMap}
      className="text-white px-6 py-3 rounded-lg hover:opacity-90 transition"
      style={{
        background: "linear-gradient(90deg, #4facfe, #00f2fe)", 
        boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
      }}
    >
      Generate
    </button>
  </div>
</div>

    </div>
  );
}

export default ChatPanel;
