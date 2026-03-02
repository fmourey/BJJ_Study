import dotenv from "dotenv";
import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import cors from "cors";
import cookieParser from "cookie-parser";

import { auth } from "express-oauth2-jwt-bearer";

dotenv.config();

const app = express();
const PORT = 1025;
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

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
        profile_photo TEXT,
        bjj_club TEXT,
        bjj_belt TEXT,
        bjj_city TEXT,
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

    CREATE TABLE IF NOT EXISTS video_likes (
        id INTEGER PRIMARY KEY,
        user_auth0_id TEXT NOT NULL,
        video_id INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE(user_auth0_id, video_id),
        FOREIGN KEY (user_auth0_id)
            REFERENCES users(auth0_id)
            ON DELETE CASCADE,
        FOREIGN KEY (video_id)
            REFERENCES videos(id)
            ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS positions (
        id INTEGER PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY,
        user_auth0_id TEXT NOT NULL,
        video_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_auth0_id)
            REFERENCES users(auth0_id)
            ON DELETE CASCADE,
        FOREIGN KEY (video_id)
            REFERENCES videos(id)
            ON DELETE CASCADE
    );
  `);

  
  const defaultPositions = [
    "delariva",
    "reverse delariva",
    "kguard",
    "kneeshield",
    "octopus guard",
    "coyotte guard",
    "deephalfguard",
    "dogfight",
    "zguard",
    "lasso guard",
    "spider guard",
    "false reap",
    "top mount",
    "side control",
    "back control",
    "closed guard",
    "3/4 mount",
    "50/50",
    "butterfly ashigarami",
    "saddle",
    "single leg x",
    "xguard",
    "outside ashigarami",
    "inside ashigarami",
    "armbar",
    "triangle",
    "calfslicer",
    "reverse closed guard",
    "headquarters",
    "kneecut"
    ];

    for (const pos of defaultPositions) {
      await db.run(
        `INSERT OR IGNORE INTO positions (name) VALUES (?)`,
        [pos.toLowerCase()]
      );
    }

  return db;
}

// 1) Pose  cookie
app.get("/api/cookies/set", (req, res) => {
  res.cookie("bjjstudy_session", "test123", {
    httpOnly: true,
    sameSite: "Lax",
    secure: false, // en local http
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ ok: true });
});

// 2) Lit  cookies reçus
app.get("/api/cookies/me", (req, res) => {
  res.json({ cookies: req.cookies });
});


app.get("/api/videos/:id", async (req, res) => {
    const { id } = req.params;
    const video = await db.get("SELECT * FROM videos WHERE id = ?", [id]);
    if (!video) return res.status(404).json({ error: "Vidéo non trouvée" });
    res.json(video);
});

// Get video author info
app.get("/api/videos/:id/author", async (req, res) => {
  try {
    const { id } = req.params;
    
    const video = await db.get(
      "SELECT owner_auth0_id FROM videos WHERE id = ?",
      [id]
    );
    
    if (!video) {
      return res.status(404).json({ error: "Vidéo non trouvée" });
    }
    
    const author = await db.get(
      "SELECT id, name, surname, pseudo, profile_photo, bjj_belt FROM users WHERE auth0_id = ?",
      [video.owner_auth0_id]
    );
    
    if (!author) {
      return res.status(404).json({ error: "Auteur non trouvé" });
    }
    
    res.json(author);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'auteur:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Get video likes count
app.get("/api/videos/:id/likes-count", async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.get(
      "SELECT COUNT(*) as count FROM video_likes WHERE video_id = ?",
      [id]
    );
    
    res.json({ likesCount: result.count || 0 });
  } catch (error) {
    console.error("Erreur lors de la récupération des likes:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
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
            conditions.push("LOWER(position) = LOWER(?)");
            params.push(position.trim());
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
    const { name, surname, pseudo, birthdate, profile_photo, bjj_club, bjj_belt, bjj_city, email: bodyEmail } = req.body;

    const auth0_id = req.auth.payload.sub;
    const email = bodyEmail || req.auth.payload.email;

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
         SET name = ?, surname = ?, pseudo = ?, birthdate = ?, profile_photo = ?, bjj_club = ?, bjj_belt = ?, bjj_city = ?, updated_at = datetime('now')
         WHERE auth0_id = ?`,
        [name, surname || "", pseudo || "", birthdate || "", profile_photo || "", bjj_club || "", bjj_belt || "", bjj_city || "", auth0_id]
      );

      const updatedUser = await db.get(
        "SELECT * FROM users WHERE auth0_id = ?",
        [auth0_id]
      );

      return res.json(updatedUser);
    }

    const result = await db.run(
      `INSERT INTO users (auth0_id, email, name, surname, pseudo, birthdate, profile_photo, bjj_club, bjj_belt, bjj_city)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [auth0_id, email, name, surname || "", pseudo || "", birthdate || "", profile_photo || "", bjj_club || "", bjj_belt || "", bjj_city || ""]
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
    const { name, surname, pseudo, birthdate, profile_photo, bjj_club, bjj_belt, bjj_city, email: bodyEmail } = req.body
    const auth0_id = req.auth.payload.sub
    const email = bodyEmail || req.auth.payload.email

    if (!name) {
      return res.status(400).json({ error: "Le prénom est requis" })
    }

    const existingUser = await db.get(
      "SELECT * FROM users WHERE auth0_id = ?",
      [auth0_id]
    )

    if (existingUser) {
      // update - incluons aussi l'email pour s'assurer qu'il est à jour
      await db.run(
        `UPDATE users
         SET name = ?, surname = ?, pseudo = ?, birthdate = ?, profile_photo = ?, bjj_club = ?, bjj_belt = ?, bjj_city = ?, email = ?, updated_at = datetime('now')
         WHERE auth0_id = ?`,
        [name, surname || null, pseudo || null, birthdate || null, profile_photo || null, bjj_club || null, bjj_belt || null, bjj_city || null, email || null, auth0_id]
      )
    } else {
      // create
      await db.run(
        `INSERT INTO users (auth0_id, email, name, surname, pseudo, birthdate, profile_photo, bjj_club, bjj_belt, bjj_city)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [auth0_id, email || null, name, surname || null, pseudo || null, birthdate || null, profile_photo || null, bjj_club || null, bjj_belt || null, bjj_city || null]
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

app.get("/api/users/videos/published", checkJwt, async (req, res) => {
  try {
    const auth0_id = req.auth.payload.sub;

    const videos = await db.all(
      "SELECT * FROM videos WHERE owner_auth0_id = ? ORDER BY created_at DESC",
      [auth0_id]
    );

    res.json(videos);
  } catch (error) {
    console.error("Erreur lors de la récupération des vidéos:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get("/api/users/videos/liked", checkJwt, async (req, res) => {
  try {
    const auth0_id = req.auth.payload.sub;

    const videos = await db.all(
      `SELECT v.* FROM videos v 
       INNER JOIN video_likes vl ON v.id = vl.video_id 
       WHERE vl.user_auth0_id = ? 
       ORDER BY vl.created_at DESC`,
      [auth0_id]
    );

    res.json(videos);
  } catch (error) {
    console.error("Erreur lors de la récupération des vidéos likées:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post("/api/videos/:id/like", checkJwt, async (req, res) => {
  try {
    const { id } = req.params;
    const auth0_id = req.auth.payload.sub;

    const video = await db.get("SELECT * FROM videos WHERE id = ?", [id]);
    if (!video) {
      return res.status(404).json({ error: "Vidéo non trouvée" });
    }

    try {
      await db.run(
        "INSERT INTO video_likes (user_auth0_id, video_id) VALUES (?, ?)",
        [auth0_id, id]
      );
      res.status(201).json({ ok: true });
    } catch (error) {
      if (error.message.includes("UNIQUE constraint failed")) {
        return res.status(409).json({ error: "Vidéo déjà likée" });
      }
      throw error;
    }
  } catch (error) {
    console.error("Erreur lors du like:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.delete("/api/videos/:id/like", checkJwt, async (req, res) => {
  try {
    const { id } = req.params;
    const auth0_id = req.auth.payload.sub;

    const result = await db.run(
      "DELETE FROM video_likes WHERE user_auth0_id = ? AND video_id = ?",
      [auth0_id, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Like non trouvé" });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Erreur lors du unlike:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get("/api/videos/:id/is-liked", checkJwt, async (req, res) => {
  try {
    const { id } = req.params;
    const auth0_id = req.auth.payload.sub;

    const like = await db.get(
      "SELECT * FROM video_likes WHERE user_auth0_id = ? AND video_id = ?",
      [auth0_id, id]
    );

    res.json({ isLiked: !!like });
  } catch (error) {
    console.error("Erreur lors de la vérification du like:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get("/api/videos/:id/comments", async (req, res) => {
  try {
    const { id } = req.params;
    
    const comments = await db.all(
      `SELECT c.*, u.name, u.surname, u.pseudo, u.profile_photo, u.bjj_belt 
       FROM comments c
       INNER JOIN users u ON c.user_auth0_id = u.auth0_id
       WHERE c.video_id = ?
       ORDER BY c.created_at DESC`,
      [id]
    );
    
    res.json(comments);
  } catch (error) {
    console.error("Erreur lors de la récupération des commentaires:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post("/api/videos/:id/comments", checkJwt, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user_auth0_id = req.auth.payload.sub;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Le commentaire ne peut pas être vide" });
    }

    const video = await db.get("SELECT * FROM videos WHERE id = ?", [id]);
    if (!video) {
      return res.status(404).json({ error: "Vidéo non trouvée" });
    }

    const result = await db.run(
      `INSERT INTO comments (user_auth0_id, video_id, content)
       VALUES (?, ?, ?)`,
      [user_auth0_id, id, content.trim()]
    );

    const comment = await db.get(
      `SELECT c.*, u.name, u.surname, u.pseudo, u.profile_photo, u.bjj_belt 
       FROM comments c
       INNER JOIN users u ON c.user_auth0_id = u.auth0_id
       WHERE c.id = ?`,
      [result.lastID]
    );

    res.status(201).json(comment);
  } catch (error) {
    console.error("Erreur lors de l'ajout du commentaire:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.delete("/api/comments/:commentId", checkJwt, async (req, res) => {
  try {
    const { commentId } = req.params;
    const user_auth0_id = req.auth.payload.sub;

    const comment = await db.get(
      "SELECT * FROM comments WHERE id = ?",
      [commentId]
    );

    if (!comment) {
      return res.status(404).json({ error: "Commentaire non trouvé" });
    }

    if (comment.user_auth0_id !== user_auth0_id) {
      return res.status(403).json({ error: "Vous n'avez pas la permission de supprimer ce commentaire" });
    }

    await db.run(
      "DELETE FROM comments WHERE id = ?",
      [commentId]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error("Erreur lors de la suppression du commentaire:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get("/api/positions", async (req, res) => {
  const positions = await db.all(
    "SELECT name FROM positions ORDER BY name ASC"
  );
  res.json(positions);
});

app.post("/api/positions", checkJwt, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Nom requis" });
    }

    const normalized = name.trim().toLowerCase();

    await db.run(
      "INSERT OR IGNORE INTO positions (name) VALUES (?)",
      [normalized]
    );

    res.status(201).json({ name: normalized });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
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