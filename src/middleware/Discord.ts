import Discord from "discord.js";
import { success, info, error, br } from "../utils/log";
import ping from "./Discord/ping";
import setup from "./Discord/setup";

const bot = new Discord.Client();
const PREFIX: string = process.env.DISCORD_PREFIX || "!muter";

bot.on("ready", () => {
  info(`Logged in as ${bot.user?.tag}!`);
  br();
});

bot.on("message", (message: Discord.Message) => {
  if (message.content.startsWith(`${PREFIX} `) && message.channel.type !== "dm") {
    if (message.content.endsWith("ping!")) ping(message);
    if (message.content.endsWith("setup")) setup(message);
  }
});

bot.on("voiceStateUpdate", (oldState: Discord.VoiceState, newState: Discord.VoiceState) => {
  if (newState.channelID !== oldState.channelID) {
    if (newState.channelID === null) {
      info(`${oldState.member?.displayName} (${oldState.member?.id}) left voice channels.`);
    } else {
      info(`${newState.member?.displayName} (${newState.member?.id}) joined "${newState.channel?.name}" (${newState.channel?.id}).`);
    }
  }
});

export class DiscordMiddleware {
  guild: Promise<Discord.Guild>;

  constructor(serverID: number) {
    if (!serverID) return;
    this.guild = bot.guilds.fetch(`${serverID}`);
  }

  mutePlayer = (discordMemberID: number, reason?: string): void => {
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

export const init = (): void => {
  bot.login(process.env.DISCORD_TOKEN);
};
