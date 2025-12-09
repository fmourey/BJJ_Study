import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

export let db;
export async function initDB(filename = "./videos.db") {
  db = await open({
    filename,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      youtube_url TEXT NOT NULL,
      position TEXT,
      tags TEXT,
      start_time TEXT,
      end_time TEXT,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  return db;
}


app.get("/api/videos/:id", async (req, res) => {
    const { id } = req.params;
    const video = await db.get("SELECT * FROM videos WHERE id = ?", [id]);
    if (!video) return res.status(404).json({ error: "Vidéo non trouvée" });
    res.json(video);
});


app.get("/api/videos", async (req, res) => {
    const videos = await db.all("SELECT * FROM videos");
    res.json(videos);
});

app.get("/api/search", async (req, res) => {
    try {
        const { tags, position, maxVideoLength } = req.query;
        
        const conditions = [];
        const params = [];

        if (tags) {
            const tagList = Array.isArray(tags) ? tags : [tags];
            if (tagList.length > 0) {
                const tagConditions = tagList.map(() => "tags LIKE ?");
                conditions.push(`(${tagConditions.join(' OR ')})`);
                tagList.forEach(tag => {
                    params.push(`%${tag}%`);
                });
            }
        }

        if (position) {
            conditions.push("position = ?");
            params.push(position);
        }

        if (maxVideoLength) {
            const maxLength = parseInt(maxVideoLength, 10);
            if (!isNaN(maxLength) && maxLength > 0) {
                // Convert MM:SS format to seconds: (substr(start, 0, pos(':')) * 60) + substr(start, pos(':')+1)
                // For end_time: minutes * 60 + seconds, minus same for start_time
                conditions.push(
                    "((CAST(substr(end_time, 1, instr(end_time, ':') - 1) AS INTEGER) * 60 + CAST(substr(end_time, instr(end_time, ':') + 1) AS INTEGER)) - (CAST(substr(start_time, 1, instr(start_time, ':') - 1) AS INTEGER) * 60 + CAST(substr(start_time, instr(start_time, ':') + 1) AS INTEGER))) <= ?"
                );
                params.push(maxLength);
            }
        }
        const whereClause = conditions.length > 0 ? conditions.join(' AND ') : '1=1';
        const query = `SELECT * FROM videos WHERE ${whereClause}`;
        
        const videos = await db.all(query, params);
        res.json(videos);
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ error: "Search failed", details: error.message });
    }
});


if (!process.env.VITEST) {
  initDB().then(() => {
    app.listen(PORT, () =>
      console.log(`✅ Serveur démarré sur http://localhost:${PORT}`)
    );
  });
}

export default app;