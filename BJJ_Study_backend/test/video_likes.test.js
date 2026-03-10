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

describe("API likes vidéos (VideoLikes)", () => {
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
      title: "Video 1",
      youtube_url: "https://www.youtube.com/watch?v=abc123",
      position: "Guard",
      tags: "test",
      start_time: "0:10",
      end_time: "1:10",
      description: "Test video 1",
      owner_auth0_id: "test-user"
    });

    await db.Video.create({
      title: "Video 2",
      youtube_url: "https://www.youtube.com/watch?v=def456",
      position: "Mount",
      tags: "test",
      start_time: "0:10",
      end_time: "1:10",
      description: "Test video 2",
      owner_auth0_id: "other-user"
    });
  });

  afterEach(async () => {
    await db.sequelize.sync({ force: true });
  });

  it("POST /api/videos/:id/like like une vidéo", async () => {
    const videos = await db.Video.findAll();
    const videoId = videos[0].id;

    const res = await request(app)
      .post(`/api/videos/${videoId}/like`)
      .set("Authorization", "Bearer fake-token");

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);

    // Vérifier que le like est créé
    const likes = await db.VideoLike.findAll({
      where: { video_id: videoId }
    });
    expect(likes.length).toBe(1);
  });

  it("POST /api/videos/:id/like sur une vidéo inexistante retourne 404", async () => {
    const res = await request(app)
      .post("/api/videos/999999/like")
      .set("Authorization", "Bearer fake-token");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Vidéo non trouvée");
  });

  it("POST /api/videos/:id/like sur une vidéo déjà likée retourne 409", async () => {
    const videos = await db.Video.findAll();
    const videoId = videos[0].id;

    // Créer le premier like
    await request(app)
      .post(`/api/videos/${videoId}/like`)
      .set("Authorization", "Bearer fake-token");

    // Essayer de liker à nouveau
    const res = await request(app)
      .post(`/api/videos/${videoId}/like`)
      .set("Authorization", "Bearer fake-token");

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("Vidéo déjà likée");
  });

  it("DELETE /api/videos/:id/like supprime un like", async () => {
    const videos = await db.Video.findAll();
    const videoId = videos[0].id;

    // Créer un like
    await request(app)
      .post(`/api/videos/${videoId}/like`)
      .set("Authorization", "Bearer fake-token");

    // Supprimer le like
    const res = await request(app)
      .delete(`/api/videos/${videoId}/like`)
      .set("Authorization", "Bearer fake-token");

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    // Vérifier que le like est supprimé
    const likes = await db.VideoLike.findAll({
      where: { video_id: videoId }
    });
    expect(likes.length).toBe(0);
  });

  it("DELETE /api/videos/:id/like retourne 404 si le like n'existe pas", async () => {
    const videos = await db.Video.findAll();
    const videoId = videos[0].id;

    const res = await request(app)
      .delete(`/api/videos/${videoId}/like`)
      .set("Authorization", "Bearer fake-token");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Like non trouvé");
  });

  it("GET /api/videos/:id/is-liked retourne true si vidéo est likée", async () => {
    const videos = await db.Video.findAll();
    const videoId = videos[0].id;

    // Liker la vidéo
    await request(app)
      .post(`/api/videos/${videoId}/like`)
      .set("Authorization", "Bearer fake-token");

    // Vérifier le statut
    const res = await request(app)
      .get(`/api/videos/${videoId}/is-liked`)
      .set("Authorization", "Bearer fake-token");

    expect(res.status).toBe(200);
    expect(res.body.isLiked).toBe(true);
  });

  it("GET /api/videos/:id/is-liked retourne false si vidéo n'est pas likée", async () => {
    const videos = await db.Video.findAll();
    const videoId = videos[0].id;

    const res = await request(app)
      .get(`/api/videos/${videoId}/is-liked`)
      .set("Authorization", "Bearer fake-token");

    expect(res.status).toBe(200);
    expect(res.body.isLiked).toBe(false);
  });

  it("GET /api/videos/:id/likes-count retourne le nombre de likes", async () => {
    const videos = await db.Video.findAll();
    const videoId = videos[0].id;

    // Ajouter plusieurs likes
    await db.VideoLike.create({
      user_auth0_id: "test-user",
      video_id: videoId
    });

    await db.VideoLike.create({
      user_auth0_id: "other-user",
      video_id: videoId
    });

    const res = await request(app).get(`/api/videos/${videoId}/likes-count`);

    expect(res.status).toBe(200);
    expect(res.body.likesCount).toBe(2);
  });

  it("GET /api/videos/:id/likes-count retourne 0 si pas de likes", async () => {
    const videos = await db.Video.findAll();
    const videoId = videos[0].id;

    const res = await request(app).get(`/api/videos/${videoId}/likes-count`);

    expect(res.status).toBe(200);
    expect(res.body.likesCount).toBe(0);
  });

  it("Plusieurs utilisateurs peuvent liker la même vidéo", async () => {
    const videos = await db.Video.findAll();
    const videoId = videos[0].id;

    // test-user like
    await request(app)
      .post(`/api/videos/${videoId}/like`)
      .set("Authorization", "Bearer fake-token");

    // Créer un mock pour other-user
    const mockLike = await db.VideoLike.create({
      user_auth0_id: "other-user",
      video_id: videoId
    });

    const res = await request(app).get(`/api/videos/${videoId}/likes-count`);

    expect(res.status).toBe(200);
    expect(res.body.likesCount).toBe(2);
  });

  it("Un utilisateur ne peut liker qu'une seule fois par vidéo", async () => {
    const videos = await db.Video.findAll();
    const videoId = videos[0].id;

    // Créer un like
    await request(app)
      .post(`/api/videos/${videoId}/like`)
      .set("Authorization", "Bearer fake-token");

    // Vérifier qu'il y a 1 like
    let count = await db.VideoLike.count({
      where: { user_auth0_id: "test-user", video_id: videoId }
    });
    expect(count).toBe(1);

    // Essayer de créer un autre like - devrait échouer
    const resSecond = await request(app)
      .post(`/api/videos/${videoId}/like`)
      .set("Authorization", "Bearer fake-token");
    expect(resSecond.status).toBe(409);

    // Vérifier toujours 1 like
    count = await db.VideoLike.count({
      where: { user_auth0_id: "test-user", video_id: videoId }
    });
    expect(count).toBe(1);
  });
});
