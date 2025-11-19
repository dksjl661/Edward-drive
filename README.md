# Drive Clone

A full-stack Google Drive clone using **Next.js** (Frontend) and **Elysia.js** (Backend).

## Features
- File Upload
- Folder Creation
- File Listing (Grid View)
- Breadcrumb Navigation
- File Deletion
- Image Previews

## Tech Stack
- **Frontend**: Next.js 15, React, TailwindCSS, Lucide Icons
- **Backend**: Elysia.js, Bun, SQLite (bun:sqlite)

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (for Backend)
- Node.js (for Frontend)

### 1. Start the Backend
The backend runs on port 3001.

```bash
cd backend
bun install
bun index.ts
```

### 2. Start the Frontend
The frontend runs on port 3000.

```bash
# In the root directory
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.
