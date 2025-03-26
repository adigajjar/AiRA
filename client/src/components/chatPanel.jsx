import { useState } from 'react';

function ChatPanel({ messages, sendMessage }) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-[#FFEBCD] shadow-md flex flex-col justify-between">
      {/* Display Messages */}
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="bg-gray-100 p-3 rounded-lg mb-2 shadow-md"
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Start typing..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatPanel;
