export type FileType = {
  id: string;
  name: string;
  type: "file" | "folder";
  parentId: string | null;
  mimeType: string | null;
  size: number | null;
  createdAt: string;
  path: string | null;
  isStarred?: number; // sqlite returns number 0/1
  isTrashed?: number;
};
