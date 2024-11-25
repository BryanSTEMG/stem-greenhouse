// src/pages/Home/Home.tsx

import React from 'react';
import { motion } from 'framer-motion';

function Home(): JSX.Element {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/images/background2.jpg)`,
        }}
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-60 z-0"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-white">
        {/* Logo */}
        <motion.img
          src={`${process.env.PUBLIC_URL}/images/whitelogo.png`}
          alt="STEM Greenhouse Logo"
          className="w-24 h-24 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        />

        {/* Heading */}
        <motion.h1
          className="text-5xl font-bold mb-4 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Internal Tools Dashboard
        </motion.h1>

        {/* Subheading */}
        <motion.h2
          className="text-2xl font-semibold mb-6 text-center max-w-2xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Enhancing efficiency and automating processes for our team
        </motion.h2>

        {/* Description */}
        <motion.p
          className="text-lg text-center max-w-3xl mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          Welcome to the STEM Greenhouse internal tools dashboard. This platform is designed to streamline our workflows and automate routine tasks, allowing our team to focus on what matters most—empowering the next generation in STEM.
        </motion.p>

        {/* Documentation Button */}
        <motion.div
          className="mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.8 }}
        >
          <button
            className="px-6 py-3 bg-[#83b786] text-white font-semibold rounded-md hover:bg-[#72a376] transition-colors duration-200"
            onClick={() => {
              // Placeholder for future documentation page navigation
              alert('Documentation page coming soon!');
            }}
          >
            View Documentation
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default Home;
