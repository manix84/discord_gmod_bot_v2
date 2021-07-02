import { nanoid } from "nanoid";
import authenticate, {sanitiseAuthToken} from "../authentication";

const MOCK_SERVER_ID = 1234567890;

jest.mock("../../middleware/Database", () => {
  return jest.fn().mockImplementation(() => ({
    getServerID: jest.fn(() => MOCK_SERVER_ID)
  }));
});

describe("SanitiseAuthToken", () => {

  test("Token: valid", () => {
    const token = nanoid();
    const result = sanitiseAuthToken(`BASIC ${token}`);
    expect(result).toBe(token);
  });

  test("Token: Too long", () => {
    const token = nanoid() + "abc";
    const result = sanitiseAuthToken(`BASIC ${token}`);
    expect(result).toBeFalsy();
  });

  test("Token: Too short", () => {
    const token = nanoid().substring(0,20);
    const result = sanitiseAuthToken(`BASIC ${token}`);
    expect(result).toBeFalsy();
  });

  test("Token: Has invalid characters", () => {
    const token = nanoid().substring(0,20) + "*";
    const result = sanitiseAuthToken(`BASIC ${token}`);
    expect(result).toBeFalsy();
  });

});

describe("Authenticate", () => {

  test("valid", () => {
    const token = nanoid();
    const isAuthed = authenticate(`BASIC ${token}`, String(MOCK_SERVER_ID));
    expect(isAuthed).toBeTruthy();
  });

  test("missing serverID", () => {
    const token = nanoid();
    const isAuthed = authenticate(`BASIC ${token}`);
    expect(isAuthed).toBeFalsy();
  });

  test("missing token", () => {
    const isAuthed = authenticate(undefined, String(MOCK_SERVER_ID));
    expect(isAuthed).toBeFalsy();
  });

  test("invalid token, valid serverID", () => {
    const token = nanoid();
    const isAuthed = authenticate(token, String(MOCK_SERVER_ID));
    expect(isAuthed).toBeFalsy();
  });

  test("valid token, incorrect serverID", () => {
    const token = nanoid();
    const isAuthed = authenticate(`BASIC ${token}`, String(MOCK_SERVER_ID).substring(0, String(MOCK_SERVER_ID).length / 2));
    expect(isAuthed).toBeFalsy();
  });

  test("missing token and serverID", () => {
    const isAuthed = authenticate();
    expect(isAuthed).toBeFalsy();
  });

});
