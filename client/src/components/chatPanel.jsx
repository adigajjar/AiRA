import { useState } from "react";

function ChatPanel({ messages, sendMessage, generateMindMap }) {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState(null);
  const [mindMap, setMindMap] = useState(null);

 
  const handleSend = async () => {
    if (input.trim() !== "") {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/ask_question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: input }),
        });

        if (res.ok) {
          const data = await res.json();
          setResponse(data.answer);
        } else {
          const errorData = await res.json();
          alert(`Error: ${errorData.error}`);
        }
      } catch (error) {
        console.error("Error while asking question:", error);
        alert("Failed to ask question. Please try again.");
      }
      setInput(""); 
    }
  };


  const handleGenerateMindMap = async () => {
    try {
      const res = await fetch("/generate_mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Generate mind map content" }),
      });

      if (res.ok) {
        const data = await res.json();
        setMindMap(data.mindmap);
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error while generating mind map:", error);
      alert("Failed to generate mind map. Please try again.");
    }
  };

  const parseResponse = (response) => {
    if (!response) return null;
  
    // Define regex to match bold section titles
    const sectionRegex = /\*\*(.*?)\*\*/g;
    let parts = response.split(sectionRegex); // Split at bold markers
  
    let parsedContent = [];
  
    for (let i = 0; i < parts.length; i++) {
      let text = parts[i].trim();
  
      if (text === "") continue;
  
      if (i % 2 === 1) {
        // Bold section title
        parsedContent.push(
          <h3 key={i} className="font-semibold text-lg mt-3 text-black">{text}</h3>
        );
      } else {
        // Normal text, handle bullet points
        const lines = text.split("\n").map((line, index) => {
          if (line.startsWith("* ") || line.startsWith("- ")) {
            return (
              <li key={index} className="ml-6 text-gray-800">{line.substring(2)}</li>
            );
          } else if (line.match(/^\d+\./)) {
            return (
              <li key={index} className="ml-6 text-gray-800">{line}</li>
            );
          } else {
            return <p key={index} className="text-gray-700">{line}</p>;
          }
        });
  
        parsedContent.push(<div key={i}>{lines}</div>);
      }
    }
  
    return <div className="bg-green-100 p-4 rounded-lg shadow-md">{parsedContent}</div>;
  };

  return (
    <div className="flex-1 p-4 bg-[#FFEBCD] shadow-md overflow-y-auto flex flex-col space-y-4">

      <div className="h-110 flex flex-col justify-between border-b border-gray-300 pb-4">
        <div className="h-1/2 flex-1 overflow-y-auto mb-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className="bg-gray-100 p-3 rounded-lg mb-2 shadow-md"
            >
              {msg.text}
            </div>
          ))}
          {response && (
            <div className="bg-green-100 p-3 rounded-lg mb-2 shadow-md">
              <strong>Response:</strong>
              <div>{parseResponse(response)}</div>
            </div>
          )}
        </div>

  
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask a question..."
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

 
      <div className="flex justify-center items-center h-1/2">
        <div
          className="w-[400px] shadow-md p-6 rounded-lg flex flex-col items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #fff5e1, #fceabb)",
            boxShadow:
              "rgba(240, 46, 170, 0.4) -5px 5px, rgba(240, 46, 170, 0.3) -10px 10px, rgba(240, 46, 170, 0.2) -15px 15px, rgba(240, 46, 170, 0.1) -20px 20px, rgba(240, 46, 170, 0.05) -25px 25px",
          }}
        >
          <h1 className="text-xl font-medium mb-4 text-black placeholder-gray-500">
            Generate Mind Map
          </h1>
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

          {mindMap && (
            <div className="bg-yellow-100 p-3 rounded-lg mt-4 shadow-md w-full text-sm">
              <strong>Mind Map:</strong>
              <pre className="whitespace-pre-wrap">{mindMap}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPanel;
