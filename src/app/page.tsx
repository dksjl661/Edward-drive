"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { FileGrid } from "@/components/FileGrid";
import { api } from "@/lib/api";
import { FileType } from "@/types";
import { ChevronRight } from "lucide-react";

export default function Home() {
  const [files, setFiles] = useState<FileType[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<FileType[]>([]);
  const [view, setView] = useState<string>("files"); // files, recent, starred, trash, search, shared
  const [searchQuery, setSearchQuery] = useState<string>("");

  const loadFiles = async () => {
    try {
      let filter = undefined;
      if (view === "recent") filter = "recent";
      if (view === "starred") filter = "starred";
      if (view === "trash") filter = "trash";

      // If searching, ignore folder structure usually, or implement search inside folder
      // For now, search is global
      const query = view === "search" ? searchQuery : undefined;

      const data = await api.getFiles(currentFolderId, filter, query);
      setFiles(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadBreadcrumbs = async (id: string | null) => {
    if (!id) {
      setBreadcrumbs([]);
      return;
    }
    try {
      const data = await api.getBreadcrumbs(id);
      setBreadcrumbs(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadFiles();
    if (view === "files") {
      loadBreadcrumbs(currentFolderId);
    } else {
      setBreadcrumbs([]); // Clear breadcrumbs for other views
    }
  }, [currentFolderId, view, searchQuery]);

  const handleUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await api.uploadFile(file, currentFolderId);
        loadFiles();
      }
    };
    input.click();
  };

  const handleCreateFolder = async () => {
    const name = prompt("Folder name:");
    if (name) {
      await api.createFolder(name, currentFolderId);
      loadFiles();
    }
  };

  const handleFileAction = async (action: string, file: FileType) => {
    if (action === "delete") {
      // If it's already trashed, delete permanently
      if (file.isTrashed) {
        if (confirm("Delete forever? This cannot be undone.")) {
          await api.deleteFile(file.id);
        }
      } else {
        // Move to trash
        await api.updateFile(file.id, { isTrashed: true });
      }
    } else if (action === "restore") {
      await api.updateFile(file.id, { isTrashed: false });
    } else if (action === "star") {
      await api.updateFile(file.id, { isStarred: !file.isStarred });
    } else if (action === "download") {
      if (file.type === "file" && file.path) {
        const link = document.createElement("a");
        link.href = `http://127.0.0.1:3001/uploads/${file.path}`;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
    loadFiles();
  };

  const handleSearch = (q: string) => {
    if (q) {
      setSearchQuery(q);
      setView("search");
    } else {
      setSearchQuery("");
      setView("files");
    }
  };

  const handleChangeView = (newView: string) => {
    setView(newView);
    if (newView !== "search") setSearchQuery("");
    if (newView !== "files") setCurrentFolderId(null);
  };

  const getTitle = () => {
    switch (view) {
      case "recent":
        return "Recent";
      case "starred":
        return "Starred";
      case "trash":
        return "Trash";
      case "search":
        return "Search Results";
      case "shared":
        return "Shared with me";
      case "computers":
        return "Computers";
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white text-slate-900">
      <Header onSearch={handleSearch} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          onUpload={handleUpload}
          onCreateFolder={handleCreateFolder}
          currentView={view}
          onChangeView={handleChangeView}
        />
        <main className="flex-1 overflow-auto bg-[#fff] mt-0 relative">
          {/* Breadcrumbs or Title */}
          <div className="p-4 pb-2 flex items-center text-lg text-gray-700">
            {view === "files" ? (
              <>
                <span
                  className={`cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors ${
                    !currentFolderId
                      ? "font-medium text-black"
                      : "text-gray-600"
                  }`}
                  onClick={() => setCurrentFolderId(null)}
                >
                  My Drive
                </span>
                {breadcrumbs.map((crumb) => (
                  <React.Fragment key={crumb.id}>
                    <ChevronRight size={16} className="mx-1 text-gray-400" />
                    <span
                      className={`cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors ${
                        crumb.id === currentFolderId
                          ? "font-medium text-black"
                          : "text-gray-600"
                      }`}
                      onClick={() => setCurrentFolderId(crumb.id)}
                    >
                      {crumb.name}
                    </span>
                  </React.Fragment>
                ))}
              </>
            ) : (
              <span className="font-medium text-black px-2 py-1">
                {getTitle()}
              </span>
            )}
          </div>

          <FileGrid
            files={files}
            onNavigate={(id) => {
              if (view === "files" || view === "search") {
                setCurrentFolderId(id);
                setView("files");
              }
            }}
            onAction={handleFileAction}
          />
        </main>
      </div>
    </div>
  );
}
