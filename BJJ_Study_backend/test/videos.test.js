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

describe("API vidéos", () => {
  beforeEach(async () => {
    await db.sequelize.sync({ force: true });

    await db.User.create({
    auth0_id: "test-user",
    email: "test@test.com",
    name: "Test",
    surname: "User",
    pseudo: "testuser",
    bjj_belt: "white",
    bjj_club: "",
    bjj_city: ""
  });

    await db.Video.create({
      title: "Best Kimura Tutorial",
      youtube_url: "https://www.youtube.com/watch?v=abc123",
      position: "Guard",
      tags: "kimura",
      start_time: "0:10",
      end_time: "1:10",
      description: "Kimura depuis la garde",
      owner_auth0_id: "test-user"
    });

    await db.Video.create({
      title: "Best Triangle Tutorial",
      youtube_url: "https://www.youtube.com/watch?v=m6V48jZq7vM",
      position: "Triangle",
      tags: "jimenez",
      start_time: "3:10",
      end_time: "3:20",
      description: "Triangle depuis la garde fermée",
      owner_auth0_id: "test-user"
    });
  });

  afterEach(async () => {
    await db.sequelize.sync({ force: true });
  });

  it("GET /api/videos retourne toutes les vidéos", async () => {
    const res = await request(app).get("/api/videos");
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].title).toBe("Best Kimura Tutorial");
    expect(res.body[1].title).toBe("Best Triangle Tutorial");
  });

  it("GET /api/videos/:id retourne une vidéo existante", async () => {
    const all = await request(app).get("/api/videos");
    const id = all.body[0].id;
    const res = await request(app).get(`/api/videos/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Best Kimura Tutorial");
  });

  it("GET /api/videos/:id retourne 404 si la vidéo n'existe pas", async () => {
    const res = await request(app).get("/api/videos/999999");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Vidéo non trouvée");
  });

  it("GET /api/search filtre les vidéos", async () => {
    const res = await request(app).get("/api/search");
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].tags).toContain("kimura");
  });

  it("GET /api/search?tags=Guard retourne la vidéo filtrée", async () => {
    const res = await request(app).get("/api/search").query({ position: "guard" });
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].position).toBe("Guard");
  });

  it("GET /api/search?position=kimura retourne la vidéo filtrée", async () => {
    const res = await request(app).get("/api/search").query({ tags: "kimura" });
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].tags).toContain("kimura");
  });

  it("GET /api/search?maxVideoLength=20 retourne la vidéo filtrée", async () => {
    const res = await request(app).get("/api/search").query({ maxVideoLength: 20 });
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].position).toBe("Triangle");
  });

  it("GET /api/search avec une erreur 500", async () => {
    const original = db.Video.findAll;
    db.Video.findAll = () => { throw new Error("DB error"); };
    const res = await request(app).get("/api/search");
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Search failed");
    db.Video.findAll = original;
  });

  it("POST /api/videos ajoute une nouvelle vidéo", async () => {
    const newVideo = {
      title: "Best Armbar Tutorial",
      youtube_url: "https://www.youtube.com/watch?v=def456",
      position: "Armbar",
      tags: ["armbar", "butterfly guard"],
      start_time: "2:50",
      end_time: "3:00",
      description: "Armbar depuis la garde papillon",
    };
    const res = await request(app)
      .post("/api/videos")
      .set("Authorization", "Bearer fake-token")
      .send(newVideo);

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Best Armbar Tutorial");
    expect(res.body.position).toBe("Armbar");
    expect(res.body.tags).toBe("armbar, butterfly guard");
    expect(res.body.start_time).toBe("2:50");
    expect(res.body.end_time).toBe("3:00");
    expect(res.body.description).toBe("Armbar depuis la garde papillon");

    const getRes = await request(app).get("/api/videos");
    expect(getRes.body.length).toBe(3);
  });

  it("POST /api/videos sans titre retourne une erreur", async () => {
    const res = await request(app)
      .post("/api/videos")
      .set("Authorization", "Bearer fake-token")
      .send({
        youtube_url: "https://www.youtube.com/watch?v=def456",
        position: "Armbar",
        tags: "armbar",
        start_time: "2:50",
        end_time: "3:00",
        description: "Armbar depuis la garde papillon",
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Le titre est requis");
  });

  it("POST /api/videos avec une erreur 500", async () => {
    const original = db.Video.create;
    db.Video.create = () => { throw new Error("DB error"); };
    const res = await request(app)
      .post("/api/videos")
      .set("Authorization", "Bearer fake-token")
      .send({
        title: "Best Armbar Tutorial",
        youtube_url: "https://www.youtube.com/watch?v=def456",
        position: "Armbar",
        tags: "armbar",
        start_time: "2:50",
        end_time: "3:00",
        description: "Armbar depuis la garde papillon",
      });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Erreur serveur");
    db.Video.create = original;
  });
});
