import dotenv from "dotenv";
import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import cors from "cors";
import { auth } from "express-oauth2-jwt-bearer";

dotenv.config();

const app = express();
const PORT = 1025;

app.use(cors());
app.use(express.json());

const checkJwt = auth({
  audience: process.env.VITE_AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.VITE_AUTH0_DOMAIN}/`, 
  tokenSigningAlg: "RS256",
});


export let db;
export async function initDB(filename = "./videos.db") {
  db = await open({
    filename,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        auth0_id TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE,
        name TEXT NOT NULL,
        surname TEXT,
        pseudo TEXT,
        birthdate TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS videos (
        id INTEGER PRIMARY KEY,
        owner_auth0_id TEXT NOT NULL,
        title TEXT NOT NULL,
        youtube_url TEXT,
        local_file TEXT,
        position TEXT,
        tags TEXT,
        start_time TEXT,
        end_time TEXT,
        description TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (owner_auth0_id)
            REFERENCES users(auth0_id)
            ON DELETE CASCADE
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

app.post("/api/videos", checkJwt, async (req, res) => {
  try {
    const { title, youtube_url, position, tags, start_time, end_time, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Le titre est requis" });
    }

    const owner_auth0_id = req.auth.payload.sub;
    const tagsString = Array.isArray(tags) ? tags.join(", ") : tags || "";

    const result = await db.run(
      `INSERT INTO videos 
       (title, youtube_url, position, tags, start_time, end_time, description, owner_auth0_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        youtube_url || "",
        position || "",
        tagsString,
        start_time || "0:00",
        end_time || "0:00",
        description || "",
        owner_auth0_id,
      ]
    );

    const video = await db.get(
      "SELECT * FROM videos WHERE id = ?",
      [result.lastID]
    );

    res.status(201).json(video);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post("/api/users/profile", checkJwt, async (req, res) => {
  try {
    const { name, surname, pseudo, birthdate } = req.body;

    const auth0_id = req.auth.payload.sub;
    const email = req.auth.payload.email;

    console.log("POST /api/users/profile called with auth0_id:", auth0_id);

    if (!name) {
      return res.status(400).json({ error: "Le prénom est requis" });
    }

    const existingUser = await db.get(
      "SELECT * FROM users WHERE auth0_id = ?",
      [auth0_id]
    );

    if (existingUser) {
      await db.run(
        `UPDATE users 
         SET name = ?, surname = ?, pseudo = ?, birthdate = ?, updated_at = datetime('now')
         WHERE auth0_id = ?`,
        [name, surname || "", pseudo || "", birthdate || "", auth0_id]
      );

      const updatedUser = await db.get(
        "SELECT * FROM users WHERE auth0_id = ?",
        [auth0_id]
      );

      return res.json(updatedUser);
    }

    const result = await db.run(
      `INSERT INTO users (auth0_id, email, name, surname, pseudo, birthdate)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [auth0_id, email, name, surname || "", pseudo || "", birthdate || ""]
    );

    const newUser = await db.get(
      "SELECT * FROM users WHERE id = ?",
      [result.lastID]
    );

    res.status(201).json(newUser);
  } catch (error) {
    console.error("Erreur lors de la création/mise à jour du profil:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


app.get("/api/users/profile", checkJwt, async (req, res) => {
  try {
    const auth0_id = req.auth.payload.sub;

    console.log("GET /api/users/profile called with auth0_id:", auth0_id);

    const user = await db.get(
      "SELECT * FROM users WHERE auth0_id = ?",
      [auth0_id]
    );

    if (!user) {
      return res.status(404).json({
        error: "Profil non trouvé. Veuillez compléter votre profil.",
      });
    }

    res.json(user);
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.put("/api/users/profile", checkJwt, async (req, res) => {
  try {
    const { name, surname, pseudo, birthdate } = req.body
    const auth0_id = req.auth.payload.sub
    const email = req.auth.payload.email

    if (!name) {
      return res.status(400).json({ error: "Le prénom est requis" })
    }

    const existingUser = await db.get(
      "SELECT * FROM users WHERE auth0_id = ?",
      [auth0_id]
    )

    if (existingUser) {
      // update
      await db.run(
        `UPDATE users
         SET name = ?, surname = ?, pseudo = ?, birthdate = ?, updated_at = datetime('now')
         WHERE auth0_id = ?`,
        [name, surname || "", pseudo || "", birthdate || "", auth0_id]
      )
    } else {
      // create
      await db.run(
        `INSERT INTO users (auth0_id, email, name, surname, pseudo, birthdate)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [auth0_id, email, name, surname || "", pseudo || "", birthdate || ""]
      )
    }

    const user = await db.get(
      "SELECT * FROM users WHERE auth0_id = ?",
      [auth0_id]
    )

    res.json(user)
  } catch (error) {
    console.error("Erreur profil:", error)
    res.status(500).json({ error: "Erreur serveur" })
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