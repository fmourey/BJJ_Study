import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { auth } from "express-oauth2-jwt-bearer";
import { Op } from "sequelize";
import db from "./models/index.js";

await db.sequelize.sync({ force: true });

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

// Initialize database
async function initDB() {
  try {
    await db.sequelize.sync();
    
    // Seed default positions
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
      await db.Position.findOrCreate({
        where: { name: pos.toLowerCase() },
        defaults: { name: pos.toLowerCase() }
      });
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

// 1) Set cookie
app.get("/api/cookies/set", (req, res) => {
  res.cookie("bjjstudy_session", "test123", {
    httpOnly: true,
    sameSite: "Lax",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ ok: true });
});

// 2) List received cookies
app.get("/api/cookies/me", (req, res) => {
  res.json({ cookies: req.cookies });
});

// Get video by ID
app.get("/api/videos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const video = await db.Video.findByPk(id);
    
    if (!video) {
      return res.status(404).json({ error: "Vidéo non trouvée" });
    }
    
    res.json(video);
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Get video author info
app.get("/api/videos/:id/author", async (req, res) => {
  try {
    const { id } = req.params;
    
    const video = await db.Video.findByPk(id);
    
    if (!video) {
      return res.status(404).json({ error: "Vidéo non trouvée" });
    }
    
    const author = await db.User.findOne({
      where: { auth0_id: video.owner_auth0_id },
      attributes: ['auth0_id', 'id', 'name', 'surname', 'pseudo', 'profile_photo', 'bjj_belt']
    });
    
    if (!author) {
      return res.status(404).json({ error: "Auteur non trouvé" });
    }
    
    res.json(author);
  } catch (error) {
    console.error("Error fetching author:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Get video likes count
app.get("/api/videos/:id/likes-count", async (req, res) => {
  try {
    const { id } = req.params;
    
    const count = await db.VideoLike.count({
      where: { video_id: id }
    });
    
    res.json({ likesCount: count });
  } catch (error) {
    console.error("Error fetching likes count:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Get all videos
app.get("/api/videos", async (req, res) => {
  try {
    const videos = await db.Video.findAll();
    res.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Search videos
app.get("/api/search", async (req, res) => {
  try {
    const { tags, position, maxVideoLength } = req.query;
    
    const where = {};
    
    if (tags) {
      const tagList = Array.isArray(tags) ? tags : [tags];
      if (tagList.length > 0) {
        where[Op.or] = tagList.map(tag => ({
          tags: { [Op.like]: `%${tag}%` }
        }));
      }
    }
    
    if (position) {
      where.position = db.sequelize.where(
        db.sequelize.fn('LOWER', db.sequelize.col('position')),
        Op.eq,
        position.trim().toLowerCase()
      );
    }
    
    let videos = await db.Video.findAll({ where });
    
    // Filter by maxVideoLength if provided
    if (maxVideoLength) {
      const maxLength = parseInt(maxVideoLength, 10);
      if (!isNaN(maxLength) && maxLength > 0) {
        videos = videos.filter(video => {
          if (!video.start_time || !video.end_time) return true;
          
          const [startMin, startSec] = video.start_time.split(':').map(Number);
          const [endMin, endSec] = video.end_time.split(':').map(Number);
          
          const startTotalSec = startMin * 60 + startSec;
          const endTotalSec = endMin * 60 + endSec;
          const duration = endTotalSec - startTotalSec;
          
          return duration <= maxLength;
        });
      }
    }
    
    res.json(videos);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed", details: error.message });
  }
});

// Create video
app.post("/api/videos", checkJwt, async (req, res) => {
  try {
    const { title, youtube_url, position, tags, start_time, end_time, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Le titre est requis" });
    }

    const owner_auth0_id = req.auth.payload.sub;
    const tagsString = Array.isArray(tags) ? tags.join(", ") : tags || "";

    const video = await db.Video.create({
      title,
      youtube_url: youtube_url || "",
      position: position || "",
      tags: tagsString,
      start_time: start_time || "0:00",
      end_time: end_time || "0:00",
      description: description || "",
      owner_auth0_id,
    });

    res.status(201).json(video);
  } catch (error) {
    console.error("Error creating video:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Create/Update user profile
app.post("/api/users/profile", checkJwt, async (req, res) => {
  try {
    const { name, surname, pseudo, birthdate, profile_photo, bjj_club, bjj_belt, bjj_city, email: bodyEmail } = req.body;

    const auth0_id = req.auth.payload.sub;
    const email = bodyEmail || req.auth.payload.email;

    if (!name) {
      return res.status(400).json({ error: "Le prénom est requis" });
    }

    const [user, created] = await db.User.findOrCreate({
      where: { auth0_id },
      defaults: {
        auth0_id,
        email,
        name,
        surname: surname || "",
        pseudo: pseudo || "",
        birthdate: birthdate || "",
        profile_photo: profile_photo || "",
        bjj_club: bjj_club || "",
        bjj_belt: bjj_belt || "",
        bjj_city: bjj_city || ""
      }
    });

    if (!created) {
      await user.update({
        name,
        surname: surname || "",
        pseudo: pseudo || "",
        birthdate: birthdate || "",
        profile_photo: profile_photo || "",
        bjj_club: bjj_club || "",
        bjj_belt: bjj_belt || "",
        bjj_city: bjj_city || ""
      });
    }

    res.status(created ? 201 : 200).json(user);
  } catch (error) {
    console.error("Error creating/updating profile:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Get user profile
app.get("/api/users/profile", checkJwt, async (req, res) => {
  try {
    const auth0_id = req.auth.payload.sub;

    const user = await db.User.findOne({
      where: { auth0_id }
    });

    if (!user) {
      return res.status(404).json({
        error: "Profil non trouvé. Veuillez compléter votre profil.",
      });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Update user profile
app.put("/api/users/profile", checkJwt, async (req, res) => {
  try {
    const { name, surname, pseudo, birthdate, profile_photo, bjj_club, bjj_belt, bjj_city, email: bodyEmail } = req.body;
    const auth0_id = req.auth.payload.sub;
    const email = bodyEmail || req.auth.payload.email;

    if (req.body.auth0_id && req.body.auth0_id !== auth0_id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (!name) {
      return res.status(400).json({ error: "The name is required" });
    }

    const [user, created] = await db.User.findOrCreate({
      where: { auth0_id },
      defaults: {
        auth0_id,
        email,
        name,
        surname: surname || null,
        pseudo: pseudo || null,
        birthdate: birthdate || null,
        profile_photo: profile_photo || null,
        bjj_club: bjj_club || null,
        bjj_belt: bjj_belt || null,
        bjj_city: bjj_city || null
      }
    });

    if (!created) {
      await user.update({
        name,
        surname: surname || null,
        pseudo: pseudo || null,
        birthdate: birthdate || null,
        profile_photo: profile_photo || null,
        bjj_club: bjj_club || null,
        bjj_belt: bjj_belt || null,
        bjj_city: bjj_city || null,
        email: email || null
      });
    }

    res.json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Get user's published videos
app.get("/api/users/videos/published", checkJwt, async (req, res) => {
  try {
    const auth0_id = req.auth.payload.sub;

    const videos = await db.Video.findAll({
      where: { owner_auth0_id: auth0_id },
      order: [['created_at', 'DESC']]
    });

    res.json(videos);
  } catch (error) {
    console.error("Error fetching user videos:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Get user's liked videos
app.get("/api/users/videos/liked", checkJwt, async (req, res) => {
  try {
    const auth0_id = req.auth.payload.sub;

    const videos = await db.Video.findAll({
      include: {
        model: db.VideoLike,
        where: { user_auth0_id: auth0_id },
        attributes: []
      },
      order: [[db.VideoLike, 'created_at', 'DESC']]
    });

    res.json(videos);
  } catch (error) {
    console.error("Error fetching liked videos:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Get user by auth0_id
app.get("/api/users/:auth0_id", async (req, res) => {
  try {
    const { auth0_id } = req.params;

    const user = await db.User.findOne({
      where: { auth0_id },
      attributes: ['auth0_id', 'name', 'surname', 'pseudo', 'birthdate', 'profile_photo', 'bjj_club', 'bjj_belt', 'bjj_city']
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Like a video
app.post("/api/videos/:id/like", checkJwt, async (req, res) => {
  try {
    const { id } = req.params;
    const auth0_id = req.auth.payload.sub;

    const video = await db.Video.findByPk(id);
    if (!video) {
      return res.status(404).json({ error: "Vidéo non trouvée" });
    }

    const [like, created] = await db.VideoLike.findOrCreate({
      where: { user_auth0_id: auth0_id, video_id: id },
      defaults: { user_auth0_id: auth0_id, video_id: id }
    });

    if (!created) {
      return res.status(409).json({ error: "Vidéo déjà likée" });
    }

    res.status(201).json({ ok: true });
  } catch (error) {
    console.error("Error liking video:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Unlike a video
app.delete("/api/videos/:id/like", checkJwt, async (req, res) => {
  try {
    const { id } = req.params;
    const auth0_id = req.auth.payload.sub;

    const result = await db.VideoLike.destroy({
      where: { user_auth0_id: auth0_id, video_id: id }
    });

    if (result === 0) {
      return res.status(404).json({ error: "Like non trouvé" });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Error unliking video:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Check if video is liked
app.get("/api/videos/:id/is-liked", checkJwt, async (req, res) => {
  try {
    const { id } = req.params;
    const auth0_id = req.auth.payload.sub;

    const like = await db.VideoLike.findOne({
      where: { user_auth0_id: auth0_id, video_id: id }
    });

    res.json({ isLiked: !!like });
  } catch (error) {
    console.error("Error checking like status:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Get video comments
app.get("/api/videos/:id/comments", async (req, res) => {
  try {
    const { id } = req.params;

    const comments = await db.Comment.findAll({
      where: { video_id: id },
      include: {
        model: db.User,
        attributes: ['auth0_id', 'name', 'surname', 'pseudo', 'profile_photo', 'bjj_belt'],
        required: true
      },
      order: [['created_at', 'DESC']]
    });

    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Create comment
app.post("/api/videos/:id/comments", checkJwt, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user_auth0_id = req.auth.payload.sub;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Le commentaire ne peut pas être vide" });
    }

    const video = await db.Video.findByPk(id);
    if (!video) {
      return res.status(404).json({ error: "Vidéo non trouvée" });
    }

    const comment = await db.Comment.create({
      user_auth0_id,
      video_id: id,
      content: content.trim()
    });

    const commentWithUser = await db.Comment.findByPk(comment.id, {
      include: {
        model: db.User,
        attributes: ['auth0_id', 'name', 'surname', 'pseudo', 'profile_photo', 'bjj_belt'],
        required: true
      }
    });

    res.status(201).json(commentWithUser);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Delete comment
app.delete("/api/comments/:commentId", checkJwt, async (req, res) => {
  try {
    const { commentId } = req.params;
    const user_auth0_id = req.auth.payload.sub;

    const comment = await db.Comment.findByPk(commentId);

    if (!comment) {
      return res.status(404).json({ error: "Commentaire non trouvé" });
    }

    if (comment.user_auth0_id !== user_auth0_id) {
      return res.status(403).json({ error: "Vous n'avez pas la permission de supprimer ce commentaire" });
    }

    await comment.destroy();

    res.json({ ok: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Get positions
app.get("/api/positions", async (req, res) => {
  try {
    const positions = await db.Position.findAll({
      attributes: ['name'],
      order: [['name', 'ASC']]
    });
    
    res.json(positions);
  } catch (error) {
    console.error("Error fetching positions:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Create position
app.post("/api/positions", checkJwt, async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Nom requis" });
    }

    const normalized = name.trim().toLowerCase();

    const [position, created] = await db.Position.findOrCreate({
      where: { name: normalized },
      defaults: { name: normalized }
    });

    res.status(created ? 201 : 200).json({ name: normalized });
  } catch (error) {
    console.error("Error creating position:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Initialize database and start server
if (!process.env.VITEST) {
  initDB().then(() => {
    app.listen(PORT, () =>
      console.log(`✅ Serveur démarré sur http://localhost:${PORT}`)
    );
  }).catch(error => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  });
}

export default app;
