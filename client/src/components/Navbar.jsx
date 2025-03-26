import React, { useState } from "react";
import { Menu, X, Search } from "lucide-react";
import electron from "../assets/electron.png";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-[#FFEBCD] shadow-lg p-4 font-poppins backdrop-blur-md bg-opacity-90">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <div className="flex items-center">
            <img src={electron} alt="Ai" className="h-10" />
          </div>
          <div className="text-2xl font-thin text-black tracking-wide">
            AiRA
          </div>
        </div>
        <ul className="hidden md:flex space-x-6 mx-10">
          <Link to="/">
            <li className="text-black text-lg font-thin hover:text-gray-700 transition">
              Home
            </li>
          </Link>
          <Link to="/search">
            <li className="text-black text-lg font-thin hover:text-gray-700 transition">
              Search
            </li>
          </Link>
          <li className="text-black text-lg font-thin hover:text-gray-700 transition">
            Synthesis
          </li>
          <li className="text-black text-lg font-thin hover:text-gray-700 transition">
            Analyzer
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
