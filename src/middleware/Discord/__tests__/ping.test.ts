import chalk from "chalk";
import { Message, TextChannel, Client, Guild } from "discord.js";
import ping from "../ping";

jest.mock("discord.js", () => ({
  Client: jest.fn(),
  Guild: jest.fn(),
  TextChannel: jest.fn(),
  Message: jest.fn().mockImplementation(() => ({
    channel: {
      send: jest.fn(() => "Hello World"),
    },
  })),
}));

let client: Client;
let guild: Guild;
let channel: TextChannel;

describe("Discord::On ping", () => {
  beforeEach(() => {
    client = new Client();
    guild = new Guild(client, {});
    channel = new TextChannel(guild);
  });

  test("ping", () => {
    console.info = jest.fn();
    const message = new Message(client, {}, channel);
    message.content = "test";
    ping(message);

    expect(console.info).toBeCalledTimes(1);
    expect(console.info).toBeCalledWith(chalk.blue("test"));
  });

});
