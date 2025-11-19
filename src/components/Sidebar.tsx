import React, { useEffect, useState } from "react";
import {
  Plus,
  HardDrive,
  Monitor,
  Users,
  Clock,
  Star,
  Trash2,
  Cloud,
} from "lucide-react";
import { api } from "@/lib/api";

export const Sidebar = ({
  onUpload,
  onCreateFolder,
  currentView,
  onChangeView,
}: {
  onUpload: () => void;
  onCreateFolder: () => void;
  currentView: string;
  onChangeView: (view: string) => void;
}) => {
  const [storage, setStorage] = useState({ used: 0, total: 0 });

  useEffect(() => {
    api.getStorage().then(setStorage);
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const percent = Math.min(100, (storage.used / storage.total) * 100);

  return (
    <div className="w-64 h-screen bg-[#f8fafd] p-4 flex flex-col border-r border-gray-200">
      <div className="mb-6">
        <div className="dropdown dropdown-bottom">
          <button
            className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl shadow hover:shadow-md transition-shadow cursor-pointer"
            onClick={(e) => {
              const el = e.currentTarget.nextElementSibling;
              el?.classList.toggle("hidden");
            }}
            onBlur={(e) => {
              // Simple hack to close dropdown when clicking outside (needs care not to close when clicking items)
              const trigger = e.currentTarget;
              // setTimeout to allow item click to register
              setTimeout(() => {
                const el = trigger.nextElementSibling;
                el?.classList.add("hidden");
              }, 200);
            }}
          >
            <Plus size={24} className="text-blue-600" />
            <span className="font-medium text-gray-700">New</span>
          </button>
          {/* Dropdown Menu Mock */}
          <div className="hidden absolute mt-1 bg-white shadow-lg rounded-lg py-2 w-48 z-50 border border-gray-100">
            <div
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
              onMouseDown={() => onCreateFolder()} // use onMouseDown to fire before onBlur
            >
              <FolderIcon size={16} /> New folder
            </div>
            <hr className="my-1" />
            <div
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
              onMouseDown={() => onUpload()}
            >
              <FileUp size={16} /> File upload
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1">
        <NavItem
          icon={<HardDrive size={18} />}
          label="My Drive"
          active={currentView === "files"}
          onClick={() => onChangeView("files")}
        />
        <NavItem
          icon={<Monitor size={18} />}
          label="Computers"
          active={currentView === "computers"}
          onClick={() => onChangeView("computers")}
        />
        <NavItem
          icon={<Users size={18} />}
          label="Shared with me"
          active={currentView === "shared"}
          onClick={() => onChangeView("shared")}
        />
        <NavItem
          icon={<Clock size={18} />}
          label="Recent"
          active={currentView === "recent"}
          onClick={() => onChangeView("recent")}
        />
        <NavItem
          icon={<Star size={18} />}
          label="Starred"
          active={currentView === "starred"}
          onClick={() => onChangeView("starred")}
        />
        <NavItem
          icon={<Trash2 size={18} />}
          label="Trash"
          active={currentView === "trash"}
          onClick={() => onChangeView("trash")}
        />
      </nav>

      <div className="mt-auto">
        <div className="flex items-center gap-2 text-gray-600 mb-2">
          <Cloud size={18} />
          <span className="text-sm">Storage</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500">
          {formatSize(storage.used)} of {formatSize(storage.total)} used
        </p>
      </div>
    </div>
  );
};

const NavItem = ({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2 rounded-r-full text-sm cursor-pointer mb-1 ${
        active
          ? "bg-blue-100 text-blue-700 font-medium"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
};

import { Folder as FolderIcon, FileUp } from "lucide-react";
