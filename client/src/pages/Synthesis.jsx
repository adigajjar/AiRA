import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import SourcesPanel from "../components/SourcesPanel";
import ChatPanel from "../components/chatPanel";
import StudioPanel from "../components/StudioPanel";

const Synthesis = () => {
  return (
    <div className="bg-[#FFEBCD] flex flex-col items-center">
      <div className="flex h-screen bg-[#FFEBCD]">
        {/* Left Sidebar */}
        <SourcesPanel />

        {/* Main Chat Section */}
        <div className="flex-1 overflow-hidden">
          <ChatPanel />
        </div>

       
      </div>
    </div>
  );
};

export default Synthesis;
