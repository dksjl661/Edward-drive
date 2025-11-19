import { FileType } from "@/types";

const API_URL = "http://127.0.0.1:3001";

export const api = {
  getFiles: async (
    parentId: string | null = null,
    filter?: string,
    search?: string
  ): Promise<FileType[]> => {
    let url = `${API_URL}/files?`;
    if (parentId) url += `parentId=${parentId}&`;
    if (filter) url += `filter=${filter}&`;
    if (search) url += `q=${search}&`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch files");
    return res.json();
  },

  createFolder: async (
    name: string,
    parentId: string | null = null
  ): Promise<FileType> => {
    const res = await fetch(`${API_URL}/folders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, parentId }),
    });
    if (!res.ok) throw new Error("Failed to create folder");
    return res.json();
  },

  uploadFile: async (
    file: File,
    parentId: string | null = null
  ): Promise<FileType> => {
    const formData = new FormData();
    formData.append("file", file);
    if (parentId) formData.append("parentId", parentId);

    const res = await fetch(`${API_URL}/files`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload file");
    return res.json();
  },

  deleteFile: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/files/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete file");
  },

  updateFile: async (
    id: string,
    updates: { isStarred?: boolean; isTrashed?: boolean; name?: string }
  ): Promise<FileType> => {
    const res = await fetch(`${API_URL}/files/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update file");
    return res.json();
  },

  getBreadcrumbs: async (id: string): Promise<FileType[]> => {
    const res = await fetch(`${API_URL}/files/${id}/breadcrumbs`);
    if (!res.ok) throw new Error("Failed to fetch breadcrumbs");
    return res.json();
  },

  getStorage: async (): Promise<{ used: number; total: number }> => {
    const res = await fetch(`${API_URL}/storage`);
    if (!res.ok) return { used: 0, total: 15 * 1024 * 1024 * 1024 };
    return res.json();
  },
};
