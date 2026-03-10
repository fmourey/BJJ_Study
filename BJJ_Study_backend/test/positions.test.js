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

describe("API positions (Positions)", () => {
  beforeEach(async () => {
    await db.sequelize.sync({ force: true });

    await db.Position.create({
      name: "delariva"
    });

    await db.Position.create({
      name: "spider guard"
    });

    await db.Position.create({
      name: "armbar"
    });
  });

  afterEach(async () => {
    await db.sequelize.sync({ force: true });
  });

  it("GET /api/positions retourne toutes les positions", async () => {
    const res = await request(app).get("/api/positions");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3);
    expect(res.body[0].name).toBe("armbar");
    expect(res.body[1].name).toBe("delariva");
    expect(res.body[2].name).toBe("spider guard");
  });

  it("GET /api/positions retourne les positions en ordre alphabétique", async () => {
    const res = await request(app).get("/api/positions");

    expect(res.status).toBe(200);
    const names = res.body.map(p => p.name);
    const sortedNames = [...names].sort();
    expect(names).toEqual(sortedNames);
  });

  it("POST /api/positions crée une nouvelle position", async () => {
    const res = await request(app)
      .post("/api/positions")
      .set("Authorization", "Bearer fake-token")
      .send({
        name: "Lasso Guard"
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("lasso guard");

    // Vérifier que la position est bien créée
    const allPos = await request(app).get("/api/positions");
    expect(allPos.body.length).toBe(4);
  });

  it("POST /api/positions normalise le nom en minuscules", async () => {
    const res = await request(app)
      .post("/api/positions")
      .set("Authorization", "Bearer fake-token")
      .send({
        name: "X Guard"
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("x guard");
  });

  it("POST /api/positions sans nom retourne une erreur", async () => {
    const res = await request(app)
      .post("/api/positions")
      .set("Authorization", "Bearer fake-token")
      .send({
        name: ""
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Nom requis");
  });

  it("POST /api/positions avec une position existante retourne un code 200", async () => {
    const res = await request(app)
      .post("/api/positions")
      .set("Authorization", "Bearer fake-token")
      .send({
        name: "delariva"
      });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("delariva");
  });

  it("POST /api/positions avec espaces superflus les supprime", async () => {
    const res = await request(app)
      .post("/api/positions")
      .set("Authorization", "Bearer fake-token")
      .send({
        name: "  Butterfly Hook  "
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("butterfly hook");
  });

  it("GET /api/positions ne retourne que les attributs 'name'", async () => {
    const res = await request(app).get("/api/positions");

    expect(res.status).toBe(200);
    expect(Object.keys(res.body[0])).toContain("name");
  });
});
