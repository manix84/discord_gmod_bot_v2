import app from "../app";
import supertest from "supertest";

jest.mock("../middleware/discord", () => {
  return {
    init: jest.fn()
  };
});

describe("Test basic endpoints", () => {
  // GET / -> 200 (HELLO WORLD)
  test("GET /", async () => {
    await supertest(app)
      .get("/")
      .expect(200)
      .then((response) => {
        expect(response.text).toBe("Hello World!");
      });
  });

  // GET /invite -> 200
  test("GET /invite", async () => {
    await supertest(app)
      .get("/invite")
      .expect(200);
  });

  // GET /servers/:serverID -> 200 | 404 | 5XX
  test("GET /servers/:serverID", async () => {
    await supertest(app)
      .get("/servers/1")
      .expect(200);
  });

  // GET /servers/:serverID/users 200 | 403 | 404
  test("GET /servers/:serverID/users", async () => {
    await supertest(app)
      .get("/servers/1/users")
      .expect(200);
  });

  // GET /servers/:serverID/users/:userID 200 | 403 | 404
  test("GET /servers/:serverID/users/:userID", async () => {
    await supertest(app)
      .get("/servers/1/users/1")
      .expect(200);
  });

  // POST /servers/:serverID/users/:userID/mute 200 | 403 | 404
  test("POST /servers/:serverID/users/:userID/mute", async () => {
    await supertest(app)
      .post("/servers/1/users/1/mute")
      .send({})
      .expect(200)
      .then((response) => response.body.command === "mute");
  });
  test("POST /servers/:serverID/users/:userID/unmute", async () => {
    await supertest(app)
      .post("/servers/1/users/1/unmute")
      .send({})
      .expect(200)
      .then((response) => response.body.command === "unmute");
  });
  test("POST /servers/:serverID/users/:userID/deafen", async () => {
    await supertest(app)
      .post("/servers/1/users/1/deafen")
      .send({})
      .expect(200)
      .then((response) => response.body.command === "deafen");
  });
  test("POST /servers/:serverID/users/:userID/undeafen", async () => {
    await supertest(app)
      .post("/servers/1/users/1/undeafen")
      .send({})
      .expect(200)
      .then((response) => response.body.command === "undeafen");
  });
  test("POST /servers/:serverID/users/:userID/invalid", async () => {
    await supertest(app)
      .post("/servers/1/users/1/invalid")
      .send({})
      .expect(404);
  });
});
