import request from "supertest";
import { describe, it, beforeEach, expect } from "vitest";
import app, { initDB, db } from "./index.js";

describe("API vidéos", () => {
    beforeEach(async () => {
        await initDB(":memory:");

        await db.run(
        `
        INSERT INTO videos (title, youtube_url, position, tags, start_time, end_time, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            "Best Kimura Tutorial",
            "https://www.youtube.com/watch?v=abc123",
            "Guard",
            "kimura",
            "0:10",
            "1:10",
            "Kimura depuis la garde"
        ]
        );
        await db.run(
        `
        INSERT INTO videos (title, youtube_url, position, tags, start_time, end_time, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            "Best Triangle Tutorial",
            "https://www.youtube.com/watch?v=m6V48jZq7vM&t=301s",
            "Triangle",
            "jimenez",
            "3:10",
            "3:20",
            "Triangle depuis la garde fermée"
        ]
        );
    });

    it("GET /api/videos retourne toutes les vidéos", async () => {
        const res = await request(app).get("/api/videos");

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0].title).toBe("Best Kimura Tutorial");
        expect(res.body[1].title).toBe("Best Triangle Tutorial");
    });

    it("GET /api/videos/:id retourne une vidéo existante", async () => {
        const res = await request(app).get("/api/videos/1");

        expect(res.status).toBe(200);
        expect(res.body.title).toBe("Best Kimura Tutorial");
    });

    it("GET /api/videos/:id retourne 404 si la vidéo n'existe pas", async () => {
        const res = await request(app).get("/api/videos/999");

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
        const res = await request(app).get("/api/search").query({ position: "Guard" });

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
});