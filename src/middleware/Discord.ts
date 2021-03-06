import { Message, Client, Guild } from "discord.js";
import parseCommand from "../utils/parseCommand";
import { success, info, error, br } from "../utils/log";
import ping from "./Discord/ping";
import setup from "./Discord/setup";
import link from "./Discord/link";

interface ActionResponse {
  success: boolean;
}

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
  channel: string;

  constructor(serverID: string, channelID: string) {
    if (!serverID) return;
    this.guild = bot.guilds.fetch(serverID);
    this.channel = channelID;
  }

  mutePlayer = (discordMemberID: string, reason?: string): Promise<ActionResponse> =>
    new Promise((resolve, reject) => {
      this.guild.then(discordGuild => {
        discordGuild.members.fetch(`${discordMemberID}`).then((member) => {
          if (!member.voice.channelID || member.voice.channelID !== this.channel) {
            error("[Discord:Mute][Error]", `${discordMemberID} - User not connected to voice channel.`);
            reject({ code: "ER_USER_MISSING", message: "User not connected to voice channel" });
          } else if (!member.voice.serverMute) {
            member.voice.setMute(true, reason).then(() => {
              success("[Discord:Mute][Success]", `${member.displayName} (${discordMemberID})`);
              resolve({ success: true });
            }).catch((err) => {
              error("[Discord:Mute][Error]", `${discordMemberID} - ${err}`);
              reject({ code: err.code, message: err.message });
            });
          } else {
            success("[Discord:Mute][Success]", `${member.displayName} (${discordMemberID})`);
            resolve({ success: true });
          }
        }).catch((err) => {
          error("[Discord:Mute][Error]", `${discordMemberID} - ${err}`);
          reject({ code: err.code, message: err.message });
        });
      }).catch((err) => {
        error("[Discord:Mute][Error]", `${discordMemberID} - ${err}`);
        reject({ code: err.code, message: err.message });
      });
    });

  unmutePlayer = (discordMemberID: string, reason?: string): Promise<ActionResponse> =>
    new Promise((resolve, reject) => {
      this.guild.then(discordGuild => {
        discordGuild.members.fetch(`${discordMemberID}`).then((member) => {
          if (!member.voice.channelID || member.voice.channelID !== this.channel) {
            error("[Discord:Unmute][Error]", `${discordMemberID} - User not connected to voice channel.`);
            reject({ code: "ER_USER_MISSING", message: "User not connected to voice channel" });
          } else if (member.voice.serverMute) {
            member.voice.setMute(false, reason).then(() => {
              success("[Discord:Unmute][Success]", `${member.displayName} (${discordMemberID})`);
              resolve({ success: true });
            }).catch((err) => {
              error("[Discord:Unmute][Error]", `${discordMemberID} - ${err}`);
              reject({ code: err.code, message: err.message });
            });
          } else {
            success("[Discord:Unmute][Success]", `${member.displayName} (${discordMemberID})`);
            resolve({ success: true });
          }
        }).catch((err) => {
          error("[Discord:Unmute][Error]", `${discordMemberID} - ${err}`);
          reject({ code: err.code, message: err.message });
        });
      }).catch((err) => {
        error("[Discord:Unmute][Error]", `${discordMemberID} - ${err}`);
        reject({ code: err.code, message: err.message });
      });
    });

  deafenPlayer = (discordMemberID: string, reason?: string): Promise<ActionResponse> =>
    new Promise((resolve, reject) => {
      this.guild.then(discordGuild => {
        discordGuild.members.fetch(`${discordMemberID}`).then((member) => {
          if (!member.voice.channelID || member.voice.channelID !== this.channel) {
            error("[Discord:Deafen][Error]", `${discordMemberID} - User not connected to voice channel.`);
            reject({ code: "ER_USER_MISSING", message: "User not connected to voice channel" });
          } else if (!member.voice.serverDeaf) {
            member.voice.setDeaf(true, reason).then(() => {
              success("[Discord:Deafen][Success]", `${member.displayName} (${discordMemberID})`);
              resolve({ success: true });
            }).catch((err) => {
              error("[Discord:Deafen][Error]", `${discordMemberID} - ${err}`);
              reject({ code: err.code, message: err.message });
            });
          } else {
            success("[Discord:Deafen][Success]", `${member.displayName} (${discordMemberID})`);
            resolve({ success: true });
          }
        }).catch((err) => {
          error("[Discord:Deafen][Error]", `${discordMemberID} - ${err}`);
          reject({ code: err.code, message: err.message });
        });
      }).catch((err) => {
        error("[Discord:Deafen][Error]", `${discordMemberID} - ${err}`);
        reject({ code: err.code, message: err.message });
      });
    });

  undeafenPlayer = (discordMemberID: string, reason?: string): Promise<ActionResponse> =>
    new Promise((resolve, reject) => {
      this.guild.then(discordGuild => {
        discordGuild.members.fetch(`${discordMemberID}`).then((member) => {
          if (!member.voice.channelID || member.voice.channelID !== this.channel) {
            error("[Discord:Undeafen][Error]", `${discordMemberID} - User not connected to voice channel.`);
            reject({ code: "ER_USER_MISSING", message: "User not connected to voice channel" });
          } else if (member.voice.serverDeaf) {
            member.voice.setDeaf(false, reason).then(() => {
              success("[Discord:Undeafen][Success]", `${member.displayName} (${discordMemberID})`);
              resolve({ success: true });
            }).catch((err) => {
              error("[Discord:Undeafen][Error]", `${discordMemberID} - ${err}`);
              reject({ code: err.code, message: err.message });
            });
          } else {
            success("[Discord:Undeafen][Success]", `${member.displayName} (${discordMemberID})`);
            resolve({ success: true });
          }
        }).catch((err) => {
          error("[Discord:Undeafen][Error]", `${discordMemberID} - ${err}`);
          reject({ code: err.code, message: err.message });
        });
      }).catch((err) => {
        error("[Discord:Undeafen][Error]", `${discordMemberID} - ${err}`);
        reject({ code: err.code, message: err.message });
      });
    });

}

export const init = (token?: string): void => {
  bot.login(token || process.env.DISCORD_TOKEN);
};
