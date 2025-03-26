import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import SourcesPanel from "../components/SourcesPanel";
import ChatPanel from "../components/chatPanel";
import StudioPanel from "../components/StudioPanel";

const Synthesis = () => {
    const [sources, setSources] = useState([
        { id: 1, name: 'DMFDDI.pdf', selected: true }
      ]);
      const [messages, setMessages] = useState([]);
    
      // Add new source dynamically
      const addSource = (sourceName) => {
        const newSource = {
          id: sources.length + 1,
          name: sourceName,
          selected: true
        };
        setSources([...sources, newSource]);
      };
    
      // Toggle source selection
      const toggleSource = (id) => {
        const updatedSources = sources.map((source) =>
          source.id === id ? { ...source, selected: !source.selected } : source
        );
        setSources(updatedSources);
      };
    
      // Handle sending messages dynamically
      const sendMessage = (message) => {
        if (message.trim() !== '') {
          setMessages([...messages, { id: messages.length + 1, text: message }]);
        }
      };
    
      return (
        <div className="flex h-screen bg-[#FFEBCD]">
          {/* Left Sidebar */}
          <SourcesPanel sources={sources} addSource={addSource} toggleSource={toggleSource} />
    
          {/* Main Chat Section */}
          <div className="flex-1 overflow-hidden">
            <ChatPanel messages={messages} sendMessage={sendMessage} />
          </div>
    
        
        </div>
      );
    }
export default Synthesis;
