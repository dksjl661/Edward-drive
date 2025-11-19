import React, { useState } from "react";
import { Search, Settings, HelpCircle, Grip, User, X } from "lucide-react";

export const Header = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    onSearch(val);
  };

  const clearSearch = () => {
    setSearch("");
    onSearch("");
  };

  return (
    <header className="h-16 bg-white px-4 flex items-center justify-between border-b border-gray-200">
      <div className="flex items-center gap-2 min-w-[240px]">
        <div className="w-10 h-10 flex items-center justify-center">
          {/* Placeholder for Drive Logo - using text/icon for now if svg not perfect */}
          <svg
            viewBox="0 0 87.3 78"
            className="w-8 h-8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.6 66.85l25.3-43.8H83.1l-25.3 43.8H6.6z"
              fill="#0066DA"
            />
            <path d="M21.6 23.05L6.6 66.85H60L75 23.05H21.6z" fill="#00AC47" />
            <path d="M60 66.85L83.1 23.05H53.7L29.9 66.85H60z" fill="#EA4335" />
            <path
              d="M21.6 23.05l24.5-42.2h26.6L48.2 23.05H21.6z"
              fill="#00832D"
            />
            <path d="M6.6 66.85L29.9 23.05 53.7 66.85H6.6z" fill="#2684FC" />
            <path
              d="M46.1 6.05L21.6 48.25 6.6 23.05 31.1 6.05h15z"
              fill="#FFBA00"
            />
          </svg>
        </div>
        <span className="text-xl text-gray-500 font-medium">Drive</span>
      </div>

      <div className="flex-1 max-w-3xl px-4">
        <div className="bg-[#edf2fc] rounded-full px-4 py-2.5 flex items-center gap-3 focus-within:bg-white focus-within:shadow-md transition-all">
          <Search size={20} className="text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search in Drive"
            className="bg-transparent border-none outline-none flex-1 text-gray-700 placeholder-gray-500"
          />
          {search && (
            <X
              size={20}
              className="text-gray-500 cursor-pointer hover:text-gray-700"
              onClick={clearSearch}
            />
          )}
          <Settings size={20} className="text-gray-500 cursor-pointer" />
        </div>
      </div>

      <div className="flex items-center gap-2 min-w-[200px] justify-end">
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <HelpCircle size={22} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <Settings size={22} />
          </button>
        </div>
        <div className="pl-2">
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <Grip size={22} />
          </button>
        </div>
        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium cursor-pointer ml-2">
          Z
        </div>
      </div>
    </header>
  );
};
