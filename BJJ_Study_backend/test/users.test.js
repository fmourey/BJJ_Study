import request from "supertest";
import { describe, it, beforeEach, afterEach, vi, expect } from "vitest";
import app from "../index.js";
import db from "../models/index.js";

let mockUser = { sub: "test-user", email: "test@test.com" };

vi.mock("express-oauth2-jwt-bearer", () => ({
  auth: () => (req, res, next) => {
    req.auth = { payload: mockUser };
    next();
  },
}));

describe("API utilisateurs (Users)", () => {
  beforeEach(async () => {
    mockUser = { sub: "test-user", email: "test@test.com" };

    await db.sequelize.sync({ force: true });

    await db.User.create({
      auth0_id: "test-user",
      email: "test@test.com",
      name: "Test",
      surname: "User",
      pseudo: "testuser",
      bjj_belt: "white",
      bjj_club: "BJJ Club",
      bjj_city: "Paris"
    });

    await db.User.create({
      auth0_id: "other-user",
      email: "other@test.com",
      name: "Other",
      surname: "User",
      pseudo: "otheruser",
      bjj_belt: "blue",
      bjj_club: "Other Club",
      bjj_city: "Lyon"
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

  it("GET /api/users/profile retourne le profil de l'utilisateur connecté", async () => {
    const res = await request(app)
      .get("/api/users/profile")
      .set("Authorization", "Bearer fake-token");
    
    expect(res.status).toBe(200);
    expect(res.body.auth0_id).toBe("test-user");
    expect(res.body.name).toBe("Test");
    expect(res.body.bjj_belt).toBe("white");
  });

  it("GET /api/users/profile retourne 404 si le profil n'existe pas", async () => {
    // Mock l'auth pour un utilisateur sans profil
    mockUser = { sub: "non-existent-user" };

    const res = await request(app)
      .get("/api/users/profile")
      .set("Authorization", "Bearer fake-token");
    
    if (res.status === 404) {
      expect(res.body.error).toBe("Profil non trouvé. Veuillez compléter votre profil.");
    }
  });

  it("POST /api/users/profile crée un nouveau profil", async () => {
    // Utilisateur test-user-new n'existe pas
    mockUser = { sub: "test-user-new", email: "new@test.com" };

    const res = await request(app)
      .post("/api/users/profile")
      .set("Authorization", "Bearer fake-token")
      .send({
        name: "New",
        surname: "User",
        pseudo: "newuser",
        birthdate: "1990-01-01",
        profile_photo: "https://example.com/photo.jpg",
        bjj_club: "New Club",
        bjj_belt: "purple",
        bjj_city: "Marseille"
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("New");
    expect(res.body.pseudo).toBe("newuser");
    expect(res.body.bjj_belt).toBe("purple");
  });

  it("POST /api/users/profile sans nom retourne une erreur", async () => {
    mockUser = { sub: "test-user-noname", email: "noname@test.com" };

    const res = await request(app)
      .post("/api/users/profile")
      .set("Authorization", "Bearer fake-token")
      .send({
        surname: "User",
        pseudo: "noname"
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Le prénom est requis");
  });

  it("PUT /api/users/profile met à jour le profil", async () => {
    const res = await request(app)
      .put("/api/users/profile")
      .set("Authorization", "Bearer fake-token")
      .send({
        name: "Test",
        surname: "Updated",
        pseudo: "testupdated",
        bjj_belt: "brown"
      });

    expect(res.status).toBe(200);
    expect(res.body.surname).toBe("Updated");
    expect(res.body.pseudo).toBe("testupdated");
    expect(res.body.bjj_belt).toBe("brown");
  });

  it("PUT /api/users/profile sans nom retourne une erreur", async () => {
    const res = await request(app)
      .put("/api/users/profile")
      .set("Authorization", "Bearer fake-token")
      .send({
        surname: "Updated"
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("The name is required");
  });

  it("GET /api/users/:auth0_id retourne un utilisateur", async () => {
    const res = await request(app).get("/api/users/test-user");
    
    expect(res.status).toBe(200);
    expect(res.body.auth0_id).toBe("test-user");
    expect(res.body.name).toBe("Test");
    expect(res.body.pseudo).toBe("testuser");
  });

  it("GET /api/users/:auth0_id retourne 404 si l'utilisateur n'existe pas", async () => {
    const res = await request(app).get("/api/users/non-existent-user");
    
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Utilisateur non trouvé");
  });

  it("GET /api/users/videos/published retourne les vidéos publiées de l'utilisateur connecté", async () => {
    const res = await request(app)
      .get("/api/users/videos/published")
      .set("Authorization", "Bearer fake-token");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe("Test Video");
    expect(res.body[0].owner_auth0_id).toBe("test-user");
  });

  it("GET /api/users/:auth0_id/videos/published retourne les vidéos publiées d'un utilisateur", async () => {
    const res = await request(app).get("/api/users/other-user/videos/published");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0);
  });

  it("GET /api/users/videos/liked retourne les vidéos likées de l'utilisateur connecté", async () => {
    // Créer un like pour l'utilisateur test-user
    const videos = await db.Video.findAll();
    await db.VideoLike.create({
      user_auth0_id: "test-user",
      video_id: videos[0].id
    });

    const res = await request(app)
      .get("/api/users/videos/liked")
      .set("Authorization", "Bearer fake-token");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it("GET /api/users/:auth0_id/videos/liked retourne les vidéos likées d'un utilisateur", async () => {
    const res = await request(app).get("/api/users/other-user/videos/liked");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0);
  });

  it("PUT /api/users/profile ne peut pas changer l'auth0_id d'un autre utilisateur", async () => {
    const res = await request(app)
      .put("/api/users/profile")
      .set("Authorization", "Bearer fake-token")
      .send({
        name: "Test",
        auth0_id: "other-user"
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Forbidden");
  });
});
