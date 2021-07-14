import authenticate, { sanitiseAuthToken, generateAuthToken } from "../authentication";

const MOCK_SERVER_ID = 1234567890;

jest.mock("../../middleware/Database", () => {
  return jest.fn().mockImplementation(() => ({
    getServerID: jest.fn(() => MOCK_SERVER_ID)
  }));
});

describe("GenerateAuthToken", () => {

  test("Token: valid", () => {
    const token = generateAuthToken();
    expect(token).toMatch(/^([A-Za-z0-9_-]{21})$/);
  });

});


describe("SanitiseAuthToken", () => {

  test("Token: valid", () => {
    const token = generateAuthToken();
    const result = sanitiseAuthToken(`BEARER ${token}`);
    expect(result).toBe(token);
  });

  test("Token: Too long", () => {
    const token = generateAuthToken() + "abc";
    const result = sanitiseAuthToken(`BEARER ${token}`);
    expect(result).toBeFalsy();
  });

  test("Token: Too short", () => {
    let token = generateAuthToken();
    token = token.substring(0, token.length - 1);
    const result = sanitiseAuthToken(`BEARER ${token}`);
    expect(result).toBeFalsy();
  });

  test("Token: Has invalid characters", () => {
    let token = generateAuthToken();
    token = token.substring(0, token.length - 1) + "*";
    const result = sanitiseAuthToken(`BEARER ${token}`);
    expect(result).toBeFalsy();
  });

});

describe("Authenticate", () => {

  test("valid", () => {
    const token = generateAuthToken();
    const isAuthed = authenticate(`BEARER ${token}`, String(MOCK_SERVER_ID));
    expect(isAuthed).toBeTruthy();
  });

  test("missing serverID", () => {
    const token = generateAuthToken();
    const isAuthed = authenticate(`BEARER ${token}`);
    expect(isAuthed).toBeFalsy();
  });

  test("missing token", () => {
    const isAuthed = authenticate(undefined, String(MOCK_SERVER_ID));
    expect(isAuthed).toBeFalsy();
  });

  test("invalid token, valid serverID", () => {
    const token = generateAuthToken();
    const isAuthed = authenticate(token, String(MOCK_SERVER_ID));
    expect(isAuthed).toBeFalsy();
  });

  test("valid token, incorrect serverID", () => {
    const token = generateAuthToken();
    const isAuthed = authenticate(`BEARER ${token}`, String(MOCK_SERVER_ID).substring(0, String(MOCK_SERVER_ID).length / 2));
    expect(isAuthed).toBeFalsy();
  });

  test("missing token and serverID", () => {
    const isAuthed = authenticate();
    expect(isAuthed).toBeFalsy();
  });

});
