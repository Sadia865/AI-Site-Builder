import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-gray-800 bg-[#020617] mt-20">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* Copyright */}
        <p className="text-sm text-gray-400 font-medium">
          © 2025 AI Builder Platform — Crafted by <span className="text-indigo-400">Sadia</span>
        </p>

        {/* Tech Stack Tagline */}
        <p className="text-xs text-gray-500 tracking-wide">
          AI-powered website generation built on PERN, React & Neon Postgres
        </p>

      </div>

    
    </footer>
  );
};

export default Footer;
