import { Message, Client, Guild } from "discord.js";
import parseCommand from "../utils/parseCommand";
import { success, info, error, br } from "../utils/log";
import ping from "./Discord/ping";
import setup from "./Discord/setup";
import link from "./Discord/link";

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
      case "link":
        link(message);
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
              "[Mute][Discord:Mute][Success]",
              `${member.displayName} <@${discordMemberID}>`
            );
          }).catch((err) => {
            error(
              "[Mute][Discord:Mute][Error]",
              `${discordMemberID} - ${err}`
            );
          });
        }
      }).catch((err) => {
        error(
          "[Mute][Discord:Mute][Error]",
          `${discordMemberID} - ${err}`
        );
      });
    }).catch((err) => {
      error(
        "[Mute][Discord:Mute][Error]",
        `${discordMemberID} - ${err}`
      );
    });
  };

  unmutePlayer = (discordMemberID: string, reason?: string): void => {
    this.guild.then(discordGuild => {
      discordGuild.members.fetch(`${discordMemberID}`).then((member) => {
        if (member.voice.serverMute) {
          member.voice.setMute(false, reason).then(() => {
            success(
              "[Mute][Discord:Unmute][Success]",
              `${member.displayName} <@${discordMemberID}>`
            );
          }).catch((err) => {
            error(
              "[Mute][Discord:Unmute][Error]",
              `${discordMemberID} - ${err}`
            );
          });
        }
      }).catch((err) => {
        error(
          "[Mute][Discord:Unmute][Error]",
          `${discordMemberID} - ${err}`
        );
      });
    }).catch((err) => {
      error(
        "[Mute][Discord:Unmute][Error]",
        `${discordMemberID} - ${err}`
      );
    });
  };

  deafenPlayer = (discordMemberID: string, reason?: string): void => {
    this.guild.then(discordGuild => {
      discordGuild.members.fetch(`${discordMemberID}`).then((member) => {
        if (!member.voice.serverDeaf) {
          member.voice.setDeaf(true, reason).then(() => {
            success(
              "[Mute][Discord:Deafen][Success]",
              `${member.displayName} <@${discordMemberID}>`
            );
          }).catch((err) => {
            error(
              "[Mute][Discord:Deafen][Error]",
              `${discordMemberID} - ${err}`
            );
          });
        }
      }).catch((err) => {
        error(
          "[Mute][Discord:Deafen][Error]",
          `${discordMemberID} - ${err}`
        );
      });
    }).catch((err) => {
      error(
        "[Mute][Discord:Deafen][Error]",
        `${discordMemberID} - ${err}`
      );
    });
  };

  undeafenPlayer = (discordMemberID: string, reason?: string): void => {
    this.guild.then(discordGuild => {
      discordGuild.members.fetch(`${discordMemberID}`).then((member) => {
        if (member.voice.serverDeaf) {
          member.voice.setDeaf(false, reason).then(() => {
            success(
              "[Mute][Discord:Deafen][Success]",
              `${member.displayName} <@${discordMemberID}>`
            );
          }).catch((err) => {
            error(
              "[Mute][Discord:Deafen][Error]",
              `${discordMemberID} - ${err}`
            );
          });
        }
      }).catch((err) => {
        error(
          "[Mute][Discord:Deafen][Error]",
          `${discordMemberID} - ${err}`
        );
      });
    }).catch((err) => {
      error(
        "[Mute][Discord:Deafen][Error]",
        `${discordMemberID} - ${err}`
      );
    });
  };

}

export const init = (token?: string): void => {
  bot.login(token || process.env.DISCORD_TOKEN);
};
