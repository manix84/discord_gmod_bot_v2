import app from "../app";
import supertest from "supertest";

const MOCK_SERVER_ID = 1234567890;
const MOCK_CHANNEL_ID = 1234567890;

jest.mock("../middleware/Discord", () => {
  return {
    init: jest.fn()
  };
});

jest.mock("../middleware/Database", () => {
  return jest.fn().mockImplementation(() => ({
    getServerID: jest.fn(() => MOCK_SERVER_ID)
  }));
});

describe("Test \"/\" (root)", () => {
  // GET / -> 203
  test("GET /", async () => {
    await supertest(app)
      .get("/")
      .expect(203)
      .then((response) => {
        expect(response.text).toBeUndefined;
      });
  });
});

describe("Test \"/invite\"", () => {
  // GET /invite -> 200
  test("GET /invite", async () => {
    await supertest(app)
      .get("/invite")
      .expect(200);
  });
});

describe("Test \"/servers\"", () => {
  // GET /servers/:serverID -> 200 | 404 | 5XX
  test("GET /servers/:serverID", async () => {
    await supertest(app)
      .get(`/servers/${MOCK_SERVER_ID}`)
      .expect(200);
  });
});
describe("Test \"/servers\"", () => {
  // GET /servers/:serverID -> 200 | 404 | 5XX
  test("GET /servers/:serverID/channels", async () => {
    await supertest(app)
      .get(`/servers/${MOCK_SERVER_ID}`)
      .expect(200);
  });
});

describe("Test \"/servers/:serverID/channels/:channelID/users\"", () => {
  // GET /servers/:serverID/channels/:channelID/users 200 | 403 | 404
  test("GET /servers/:serverID/channels/:channelID/users", async () => {
    await supertest(app)
      .get(`/servers/${MOCK_SERVER_ID}/channels/${MOCK_CHANNEL_ID}/users`)
      .expect(200);
  });

  // GET /servers/:serverID/channels/:channelID/users/:userID 200 | 403 | 404
  test("GET /servers/:serverID/channels/:channelID/users/:userID", async () => {
    await supertest(app)
      .get(`/servers/${MOCK_SERVER_ID}/channels/${MOCK_CHANNEL_ID}/users/1`)
      .expect(200);
  });
});

describe("Test \"/servers/:serverID/channels/:channelID/users/:userID\" Authorised", () => {
  const token = "abcdefgHIJKLMN1234567";

  // POST /servers/:serverID/channels/:channelID/users/:userID/mute 200 | 403 | 404
  test("POST /servers/:serverID/channels/:channelID/users/:userID/mute", async () => {
    await supertest(app)
      .post(`/servers/${MOCK_SERVER_ID}/channels/${MOCK_CHANNEL_ID}/users/1/mute`)
      .set({ authorization: `BASIC ${token}` })
      .send({})
      .expect(200)
      .then((response) => response.body.command === "mute");
  });
  test("POST /servers/:serverID/channels/:channelID/users/:userID/unmute", async () => {
    await supertest(app)
      .post(`/servers/${MOCK_SERVER_ID}/channels/${MOCK_CHANNEL_ID}/users/1/unmute`)
      .set({ authorization: `BASIC ${token}` })
      .send({})
      .expect(200)
      .then((response) => response.body.command === "unmute");
  });
  test("POST /servers/:serverID/channels/:channelID/users/:userID/deafen", async () => {
    await supertest(app)
      .post(`/servers/${MOCK_SERVER_ID}/channels/${MOCK_CHANNEL_ID}/users/1/deafen`)
      .set({ authorization: `BASIC ${token}` })
      .send({})
      .expect(200)
      .then((response) => response.body.command === "deafen");
  });
  test("POST /servers/:serverID/channels/:channelID/users/:userID/undeafen", async () => {
    await supertest(app)
      .post(`/servers/${MOCK_SERVER_ID}/channels/${MOCK_CHANNEL_ID}/users/1/undeafen`)
      .set({ authorization: `BASIC ${token}` })
      .send({})
      .expect(200)
      .then((response) => response.body.command === "undeafen");
  });
  test("POST /servers/:serverID/channels/:channelID/users/:userID/invalid", async () => {
    await supertest(app)
      .post(`/servers/${MOCK_SERVER_ID}/channels/${MOCK_CHANNEL_ID}/users/1/invalid`)
      .set({ authorization: `BASIC ${token}` })
      .send({})
      .expect(404);
  });
});


describe("Test \"/servers/:serverID/channels/:channelID/users/:userID\" Unauthorised", () => {
  // POST /servers/:serverID/channels/:channelID/users/:userID/mute 200 | 403 | 404
  test("POST /servers/:serverID/channels/:channelID/users/:userID/mute", async () => {
    await supertest(app)
      .post(`/servers/${MOCK_SERVER_ID}/channels/${MOCK_CHANNEL_ID}/users/1/mute`)
      .send({})
      .expect(403)
      .then((response) => response.body.command === "mute");
  });
  test("POST /servers/:serverID/channels/:channelID/users/:userID/unmute", async () => {
    await supertest(app)
      .post(`/servers/${MOCK_SERVER_ID}/channels/${MOCK_CHANNEL_ID}/users/1/unmute`)
      .send({})
      .expect(403)
      .then((response) => response.body.command === "unmute");
  });
  test("POST /servers/:serverID/channels/:channelID/users/:userID/deafen", async () => {
    await supertest(app)
      .post(`/servers/${MOCK_SERVER_ID}/channels/${MOCK_CHANNEL_ID}/users/1/deafen`)
      .send({})
      .expect(403)
      .then((response) => response.body.command === "deafen");
  });
  test("POST /servers/:serverID/channels/:channelID/users/:userID/undeafen", async () => {
    await supertest(app)
      .post(`/servers/${MOCK_SERVER_ID}/channels/${MOCK_CHANNEL_ID}/users/1/undeafen`)
      .send({})
      .expect(403)
      .then((response) => response.body.command === "undeafen");
  });
  test("POST /servers/:serverID/channels/:channelID/users/:userID/invalid", async () => {
    await supertest(app)
      .post(`/servers/${MOCK_SERVER_ID}/channels/${MOCK_CHANNEL_ID}/users/1/invalid`)
      .send({})
      .expect(404);
  });
});
