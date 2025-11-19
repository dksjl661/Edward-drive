import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { staticPlugin } from "@elysiajs/static";
import { Database } from "bun:sqlite";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

const UPLOADS_DIR = join(import.meta.dir, "uploads");
if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR);
}

// Database Setup
const db = new Database("drive.sqlite");

// Migration to add new columns if they don't exist
try {
  db.query("ALTER TABLE files ADD COLUMN isStarred INTEGER DEFAULT 0").run();
} catch (e) {}
try {
  db.query("ALTER TABLE files ADD COLUMN isTrashed INTEGER DEFAULT 0").run();
} catch (e) {}

db.query(
  `
  CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('file', 'folder')),
    parentId TEXT,
    mimeType TEXT,
    size INTEGER,
    createdAt TEXT NOT NULL,
    path TEXT,
    isStarred INTEGER DEFAULT 0,
    isTrashed INTEGER DEFAULT 0,
    FOREIGN KEY(parentId) REFERENCES files(id)
  )
`
).run();

// Types
type FileType = {
  id: string;
  name: string;
  type: "file" | "folder";
  parentId: string | null;
  mimeType: string | null;
  size: number | null;
  createdAt: string;
  path: string | null;
  isStarred: number;
  isTrashed: number;
};

const app = new Elysia()
  .use(cors())
  .use(swagger())
  .use(
    staticPlugin({
      assets: "uploads",
      prefix: "/uploads",
    })
  )
  .decorate("db", db)

  // Get all files (flat or by parent) with filters
  .get(
    "/files",
    ({ db, query }) => {
      const { parentId, filter, q } = query;
      let sql = "SELECT * FROM files WHERE 1=1";
      let params: any[] = [];

      if (q) {
        sql += " AND name LIKE ?";
        params.push(`%${q}%`);
        // Search ignores parentId usually, but respects trash status unless searching in trash (not implemented)
        sql += " AND isTrashed = 0";
      } else if (filter === "starred") {
        sql += " AND isStarred = 1 AND isTrashed = 0";
      } else if (filter === "trash") {
        sql += " AND isTrashed = 1";
      } else if (filter === "recent") {
        sql += " AND isTrashed = 0 ORDER BY createdAt DESC LIMIT 50";
        return db.query(sql).all() as FileType[];
      } else {
        // Default browse mode
        if (parentId) {
          sql += " AND parentId = ?";
          params.push(parentId);
        } else {
          sql += " AND parentId IS NULL";
        }
        sql += " AND isTrashed = 0";
      }

      sql += " ORDER BY type DESC, name ASC";
      return db.query(sql).all(...params) as FileType[];
    },
    {
      query: t.Object({
        parentId: t.Optional(t.String()),
        filter: t.Optional(t.String()),
        q: t.Optional(t.String()),
      }),
    }
  )

  // Create folder
  .post(
    "/folders",
    ({ db, body }) => {
      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      const { name, parentId } = body;

      db.query(
        `
      INSERT INTO files (id, name, type, parentId, createdAt, isStarred, isTrashed)
      VALUES (?, ?, 'folder', ?, ?, 0, 0)
    `
      ).run(id, name, parentId || null, createdAt);

      return db.query("SELECT * FROM files WHERE id = ?").get(id);
    },
    {
      body: t.Object({
        name: t.String(),
        parentId: t.Optional(t.String()),
      }),
    }
  )

  // Upload file
  .post(
    "/files",
    async ({ db, body }) => {
      const { file, parentId } = body;
      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();

      const fileName = `${id}-${file.name}`;
      const filePath = join(UPLOADS_DIR, fileName);

      await Bun.write(filePath, file);

      db.query(
        `
      INSERT INTO files (id, name, type, parentId, mimeType, size, createdAt, path, isStarred, isTrashed)
      VALUES (?, ?, 'file', ?, ?, ?, ?, ?, 0, 0)
    `
      ).run(
        id,
        file.name,
        parentId || null,
        file.type,
        file.size,
        createdAt,
        fileName
      );

      return db.query("SELECT * FROM files WHERE id = ?").get(id);
    },
    {
      body: t.Object({
        file: t.File(),
        parentId: t.Optional(t.String()),
      }),
    }
  )

  // Update file (Star, Trash, Rename)
  .patch(
    "/files/:id",
    ({ db, params, body }) => {
      const { id } = params;
      const { isStarred, isTrashed, name } = body;

      let updates = [];
      let values = [];

      if (isStarred !== undefined) {
        updates.push("isStarred = ?");
        values.push(isStarred ? 1 : 0);
      }
      if (isTrashed !== undefined) {
        updates.push("isTrashed = ?");
        values.push(isTrashed ? 1 : 0);
      }
      if (name !== undefined) {
        updates.push("name = ?");
        values.push(name);
      }

      if (updates.length === 0) return { success: true };

      values.push(id);
      db.query(`UPDATE files SET ${updates.join(", ")} WHERE id = ?`).run(
        ...values
      );

      return db.query("SELECT * FROM files WHERE id = ?").get(id);
    },
    {
      body: t.Object({
        isStarred: t.Optional(t.Boolean()),
        isTrashed: t.Optional(t.Boolean()),
        name: t.Optional(t.String()),
      }),
    }
  )

  // Delete file/folder (Permanent)
  .delete("/files/:id", ({ db, params }) => {
    const { id } = params;
    const file = db.query("SELECT * FROM files WHERE id = ?").get(id) as
      | FileType
      | undefined;
    if (!file) return { error: "Not found" };

    // If it's not trashed yet, soft delete it (client should use PATCH for this usually, but let's support DELETE as soft delete if not trashed)
    // Wait, standard pattern: DELETE -> Trash, DELETE from Trash -> Permanent.

    if (file.isTrashed === 0) {
      db.query("UPDATE files SET isTrashed = 1 WHERE id = ?").run(id);
      return { success: true, id, status: "trashed" };
    }

    // Permanent delete
    // TODO: clean up file from disk if it's a file
    db.query("DELETE FROM files WHERE id = ?").run(id);
    return { success: true, id, status: "deleted" };
  })

  // Get Breadcrumbs
  .get("/files/:id/breadcrumbs", ({ db, params }) => {
    const { id } = params;
    const breadcrumbs = [];
    let currentId: string | null = id;

    while (currentId) {
      const file = db
        .query("SELECT * FROM files WHERE id = ?")
        .get(currentId) as FileType | undefined;
      if (file) {
        breadcrumbs.unshift(file);
        currentId = file.parentId;
      } else {
        break;
      }
    }
    return breadcrumbs;
  })

  // Storage Stats
  .get("/storage", ({ db }) => {
    const result = db
      .query("SELECT SUM(size) as totalSize FROM files WHERE type = 'file'")
      .get() as { totalSize: number };
    return { used: result.totalSize || 0, total: 15 * 1024 * 1024 * 1024 }; // 15GB limit
  })

  .listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
