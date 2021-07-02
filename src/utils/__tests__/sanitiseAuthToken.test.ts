import { nanoid } from "nanoid";
import sanitiseAuthToken from "../sanitiseAuthToken";

describe("Sanitise AuthToken", () => {

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
