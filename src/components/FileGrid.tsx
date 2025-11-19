import React, { useState } from "react";
import { FileType } from "@/types";
import {
  Folder,
  FileText,
  MoreVertical,
  Star,
  Trash2,
  RotateCcw,
  Download,
} from "lucide-react";

const ContextMenu = ({
  file,
  onClose,
  onAction,
}: {
  file: FileType;
  onClose: () => void;
  onAction: (action: string, file: FileType) => void;
}) => {
  return (
    <div
      className="absolute right-2 top-8 bg-white shadow-lg rounded-lg py-1 w-40 z-50 border border-gray-100"
      onClick={(e) => e.stopPropagation()}
    >
      {file.isTrashed ? (
        <div
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 text-sm text-gray-700"
          onClick={() => onAction("restore", file)}
        >
          <RotateCcw size={16} /> Restore
        </div>
      ) : (
        <>
          <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 text-sm text-gray-700"
            onClick={() => onAction("star", file)}
          >
            <Star
              size={16}
              className={
                file.isStarred ? "fill-yellow-400 text-yellow-400" : ""
              }
            />{" "}
            {file.isStarred ? "Remove star" : "Add to starred"}
          </div>
          <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 text-sm text-gray-700"
            onClick={() => onAction("download", file)}
          >
            <Download size={16} /> Download
          </div>
        </>
      )}

      <hr className="my-1" />
      <div
        className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 text-sm text-red-600"
        onClick={() => onAction("delete", file)}
      >
        <Trash2 size={16} />{" "}
        {file.isTrashed ? "Delete forever" : "Move to trash"}
      </div>
    </div>
  );
};

export const FileGrid = ({
  files,
  onNavigate,
  onAction,
}: {
  files: FileType[];
  onNavigate: (id: string) => void;
  onAction: (action: string, file: FileType) => void;
}) => {
  const folders = files.filter((f) => f.type === "folder");
  const fileList = files.filter((f) => f.type === "file");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Click outside to close menu
  React.useEffect(() => {
    const handleClick = () => setActiveMenu(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="p-4">
      {folders.length > 0 && (
        <>
          <h2 className="text-sm font-medium text-gray-600 mb-4">Folders</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
            {folders.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between bg-[#f8fafd] p-3 rounded-xl border border-gray-200 hover:bg-gray-100 cursor-pointer relative"
                onDoubleClick={() => onNavigate(file.id)}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Folder
                    className="text-gray-600 fill-gray-400 flex-shrink-0"
                    size={20}
                  />
                  <span className="truncate text-sm text-gray-700 font-medium">
                    {file.name}
                  </span>
                </div>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(activeMenu === file.id ? null : file.id);
                    }}
                    className="p-1 hover:bg-gray-200 rounded-full text-gray-500"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {activeMenu === file.id && (
                    <ContextMenu
                      file={file}
                      onClose={() => setActiveMenu(null)}
                      onAction={onAction}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="text-sm font-medium text-gray-600 mb-4">Files</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {fileList.map((file) => (
          <div
            key={file.id}
            className="flex flex-col bg-[#f8fafd] rounded-xl border border-gray-200 hover:bg-gray-100 cursor-pointer group relative"
          >
            <div className="h-32 bg-white rounded-t-xl flex items-center justify-center border-b border-gray-100 relative overflow-hidden">
              {file.mimeType?.startsWith("image/") && file.path ? (
                <img
                  src={`http://127.0.0.1:3001/uploads/${file.path}`}
                  className="h-full w-full object-cover"
                  alt={file.name}
                />
              ) : (
                <FileText size={48} className="text-blue-500" />
              )}
              {file.isStarred === 1 && (
                <Star
                  size={16}
                  className="absolute top-2 right-2 fill-yellow-400 text-yellow-400"
                />
              )}
            </div>
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="bg-blue-500 p-0.5 rounded flex-shrink-0">
                  <FileText size={12} className="text-white" />
                </div>
                <span className="truncate text-sm text-gray-700 font-medium">
                  {file.name}
                </span>
              </div>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(activeMenu === file.id ? null : file.id);
                  }}
                  className={`p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-opacity ${
                    activeMenu === file.id
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <MoreVertical size={16} />
                </button>
                {activeMenu === file.id && (
                  <ContextMenu
                    file={file}
                    onClose={() => setActiveMenu(null)}
                    onAction={onAction}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
