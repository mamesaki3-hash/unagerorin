import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
  onTitleClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMenuOpen, onTitleClick }) => {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 flex justify-between items-center px-4 md:px-6 h-16">
      <div className="flex items-center gap-2 md:gap-8">
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-2 md:hidden text-outline hover:text-primary transition-colors"
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <h1 id="page-title">
          <button
            onClick={onTitleClick}
            className="text-lg md:text-xl font-black tracking-tighter flex items-center hover:opacity-75 transition-opacity"
          >
            <span className="text-[#1DE9FD]">うな</span>
            <span className="text-[#0FF10A]">げろ</span>
            <span className="text-[#FF8A11]">りん</span>
            <span className="text-[#F208D1]">！！</span>
            <span className="text-[#000000] ml-2 text-sm font-bold">エピソード検索</span>
          </button>
        </h1>
      </div>
    </header>
  );
};
