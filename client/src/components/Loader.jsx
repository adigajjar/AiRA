import { motion } from "framer-motion";
import React from "react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center h-[50vh] space-x-2">
      {[...Array(3)].map((_, index) => (
        <motion.div
          key={index}
          className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
          animate={{
            y: [0, -10, 0], // Bouncing effect
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"], // Gradient animation
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.2, // Staggered animation for each dot
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default Loader;
