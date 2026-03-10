import request from "supertest";
import { describe, it, beforeEach, afterEach, vi, expect } from "vitest";
import app from "../index.js";
import db from "../models/index.js";

vi.mock("express-oauth2-jwt-bearer", () => ({
  auth: () => (req, res, next) => {
    req.auth = { payload: { sub: "test-user" } };
    next();
  },
}));

describe("API commentaires (Comments)", () => {
  beforeEach(async () => {
    await db.sequelize.sync({ force: true });

    await db.User.create({
      auth0_id: "test-user",
      email: "test@test.com",
      name: "Test",
      surname: "User",
      pseudo: "testuser",
      bjj_belt: "white"
    });

    await db.User.create({
      auth0_id: "other-user",
      email: "other@test.com",
      name: "Other",
      surname: "User",
      pseudo: "otheruser",
      bjj_belt: "blue"
    });

    await db.Video.create({
      title: "Test Video",
      youtube_url: "https://www.youtube.com/watch?v=abc123",
      position: "Guard",
      tags: "test",
      start_time: "0:10",
      end_time: "1:10",
      description: "Test video",
      owner_auth0_id: "test-user"
    });
  });

  afterEach(async () => {
    await db.sequelize.sync({ force: true });
  });

  it("POST /api/videos/:id/comments crée un commentaire", async () => {
    const videos = await db.Video.findAll();
    const videoId = videos[0].id;

    const res = await request(app)
      .post(`/api/videos/${videoId}/comments`)
      .set("Authorization", "Bearer fake-token")
      .send({
        content: "Super technique!"
      });

    expect(res.status).toBe(201);
    expect(res.body.content).toBe("Super technique!");
    expect(res.body.user_auth0_id).toBe("test-user");
    expect(res.body.video_id).toBe(videoId);
    expect(res.body.User).toBeDefined();
  });

  it("POST /api/videos/:id/comments avec contenu vide retourne une erreur", async () => {
    const videos = await db.Video.findAll();
    const videoId = videos[0].id;

    const res = await request(app)
      .post(`/api/videos/${videoId}/comments`)
      .set("Authorization", "Bearer fake-token")
      .send({
        content: ""
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Le commentaire ne peut pas être vide");
  });

  it("POST /api/videos/:id/comments sur une vidéo inexistante retourne 404", async () => {
    const res = await request(app)
      .post("/api/videos/999999/comments")
      .set("Authorization", "Bearer fake-token")
      .send({
        content: "Super technique!"
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Vidéo non trouvée");
  });

  it("GET /api/videos/:id/comments retourne tous les commentaires d'une vidéo", async () => {
    const videos = await db.Video.findAll();
    const videoId = videos[0].id;

    // Créer plusieurs commentaires
    await db.Comment.create({
      user_auth0_id: "test-user",
      video_id: videoId,
      content: "Premier commentaire"
    });

    await db.Comment.create({
      user_auth0_id: "other-user",
      video_id: videoId,
      content: "Deuxième commentaire"
    });

    const res = await request(app).get(`/api/videos/${videoId}/comments`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].content).toBe("Deuxième commentaire");// Ordre DESC
    expect(res.body[0].User).toBeDefined();
    expect(res.body[0].User.name).toBe("Other");
    expect(res.body[1].content).toBe("Premier commentaire");
    expect(res.body[1].User).toBeDefined();
    expect(res.body[1].User.name).toBe("Test");
  });

  it("GET /api/videos/:id/comments retourne un tableau vide si pas de commentaires", async () => {
    const videos = await db.Video.findAll();
    const videoId = videos[0].id;

    const res = await request(app).get(`/api/videos/${videoId}/comments`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0);
  });

  it("DELETE /api/comments/:commentId supprime un commentaire", async () => {
    const videos = await db.Video.findAll();
    const videoId = videos[0].id;

    const comment = await db.Comment.create({
      user_auth0_id: "test-user",
      video_id: videoId,
      content: "À supprimer"
    });

    const res = await request(app)
      .delete(`/api/comments/${comment.id}`)
      .set("Authorization", "Bearer fake-token");

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    // Vérifier que le commentaire est supprimé
    const checks = await db.Comment.findByPk(comment.id);
    expect(checks).toBeNull();
  });

  it("DELETE /api/comments/:commentId retourne 404 si le commentaire n'existe pas", async () => {
    const res = await request(app)
      .delete("/api/comments/999999")
      .set("Authorization", "Bearer fake-token");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Commentaire non trouvé");
  });

  it("DELETE /api/comments/:commentId retourne 403 si ce n'est pas l'auteur", async () => {
    const videos = await db.Video.findAll();
    const videoId = videos[0].id;

    const comment = await db.Comment.create({
      user_auth0_id: "other-user",
      video_id: videoId,
      content: "Commentaire d'un autre utilisateur"
    });

    const res = await request(app)
      .delete(`/api/comments/${comment.id}`)
      .set("Authorization", "Bearer fake-token");

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Vous n'avez pas la permission de supprimer ce commentaire");
  });

  it("GET /api/videos/:id/comments inclut les infos de l'auteur", async () => {
    const videos = await db.Video.findAll();
    const videoId = videos[0].id;

    await db.Comment.create({
      user_auth0_id: "test-user",
      video_id: videoId,
      content: "Test commentaire avec infos utilisateur"
    });

    const res = await request(app).get(`/api/videos/${videoId}/comments`);

    expect(res.status).toBe(200);
    expect(res.body[0].User.auth0_id).toBe("test-user");
    expect(res.body[0].User.name).toBe("Test");
    expect(res.body[0].User.pseudo).toBe("testuser");
    expect(res.body[0].User.bjj_belt).toBe("white");
    expect(res.body[0].User.profile_photo).toBeDefined();
  });
});
