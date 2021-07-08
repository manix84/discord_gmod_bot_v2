import parseCommand, { getPrefix, isCommand } from "../parseCommand";

const testPrefix = "!muter";

describe("getPrefix", () => {

  test("valid", () => {
    const prefix = getPrefix(testPrefix);
    expect(prefix).toBe(testPrefix);
  });

  test("cleaned", () => {
    const prefix = getPrefix(`   ${testPrefix}   `);
    expect(prefix).toBe(testPrefix);
  });

});

describe("isCommand", () => {

  test("valid", () => {
    const isCommandAnswer = isCommand(`${testPrefix} someCommand`, testPrefix);
    expect(isCommandAnswer).toBeTruthy();
  });

  test("invalid", () => {
    const isCommandAnswer = isCommand(`!bot? someCommand`, testPrefix);
    expect(isCommandAnswer).toBeFalsy();
  });

});

describe("parseCommand", () => {

  test("valid", () => {
    const messageFromUser = `${testPrefix} someCommand`;
    const command = parseCommand(messageFromUser, testPrefix);
    expect(command).toBe("someCommand");
  });

  test("wrong prefix", () => {
    const messageFromUser = `!bot? someCommand`;
    const command = parseCommand(messageFromUser);
    expect(command).toBeFalsy();
  });

  test("missing command", () => {
    const messageFromUser = `${testPrefix} `;
    const command = parseCommand(messageFromUser, testPrefix);
    expect(command).toBeFalsy();
  });

});
