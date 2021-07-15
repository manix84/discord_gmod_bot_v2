import { Message, Client, Guild } from "discord.js";
import parseCommand from "../utils/parseCommand";
import { success, info, error, br } from "../utils/log";
import ping from "./Discord/ping";
import setup from "./Discord/setup";

const bot = new Client();

bot.on("ready", () => {
  info(`Logged in as ${bot.user?.tag}!`);
  br();
});

bot.on("message", (message: Message) => {
  if (message.author.bot) return; // Ignore bot messages.

  if (message.channel.type !== "dm") {
    switch (parseCommand(message.content)) {
      case "setup":
        setup(message);
        break;
      case "re-setup":
        setup(message, true);
        break;
      case "ping":
        ping(message);
        break;
    }
  } else {
    message.author.send("Sorry, I've no DM'able commands right now.").catch(error);
  }
});

export class DiscordMiddleware {
  guild: Promise<Guild>;

  constructor(serverID: string) {
    if (!serverID) return;
    this.guild = bot.guilds.fetch(serverID);
  }

  mutePlayer = (discordMemberID: string, reason?: string): void => {
    this.guild.then(discordGuild => {
      discordGuild.members.fetch(`${discordMemberID}`).then((member) => {
        if (!member.voice.serverMute) {
          member.voice.setMute(true, reason).then(() => {
            success(
              "[Mute][Discord:SetMute][Success]",
              `Muted ${discordMemberID}`
            );
          }).catch((err) => {
            error(
              "[Mute][Discord:SetMute][Error]",
              `Mute: ${discordMemberID} - ${err}`
            );
          });
        }
      }).catch((err) => {
        error(
          "[Mute][Discord:SetMute][Error]",
          `Mute: ${discordMemberID} - ${err}`
        );
      });
    }).catch((err) => {
      error(
        "[Mute][Discord:SetMute][Error]",
        `Mute: ${discordMemberID} - ${err}`
      );
    });
  };

}

export const init = (token?: string): void => {
  bot.login(token || process.env.DISCORD_TOKEN);
};
