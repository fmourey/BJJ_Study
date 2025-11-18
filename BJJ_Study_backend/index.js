import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let db;
(async () => {
    db = await open({
        filename: "./videos.db",
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

    await db.run(`
    INSERT INTO videos (title, youtube_url, position, tags, start_time, end_time, description)
    VALUES
    ('Armbar depuis la garde fermée', 'https://www.youtube.com/watch?v=23enzBqgkhs', 'Closed Guard', 'submission, armbar, fundamentals', '00:08', '00:11', 'Démonstration détaillée du armbar depuis la garde fermée, avec mise en place de la hanche et contrôle du bras.'),
    ('Passage de garde knee cut', 'https://www.youtube.com/watch?v=f5AlDfzItGE', 'Guard Pass', 'control, knee-cut, passing', '02:36', '02:42', 'Un passage de garde classique en knee cut, avec explication du contrôle de la hanche et du genou opposé.'),
    ('Sweep en butterfly guard', 'https://www.youtube.com/watch?v=9wAGX1JH5yo', 'Butterfly Guard', 'sweep, guard, garcia', '03:31', '03:34', 'Variation du sweep en butterfly guard utilisant un levier avec le crochet et une poussée du bras opposé.');
    `);


})();


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
        const { whereClause, params } = req.query;
        
        if (!whereClause) {
            return res.status(400).json({ error: "whereClause is required" });
        }

        const query = `SELECT * FROM videos WHERE ${whereClause}`;
        const parsedParams = params ? JSON.parse(params) : [];
        const videos = await db.all(query, parsedParams);
        res.json(videos);
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ error: "Search failed", details: error.message });
    }
});


app.listen(PORT, () => console.log(`✅ Serveur démarré sur http://localhost:${PORT}`));
