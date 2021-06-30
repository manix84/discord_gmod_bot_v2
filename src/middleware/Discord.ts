import Discord from "discord.js";
import { nanoid } from "nanoid";
import { success, info, warn, error, br } from "../utils/log";
import Database from "./Database";

const bot = new Discord.Client();
const dbase = new Database();
const PREFIX: string = process.env.DISCORD_PREFIX || "!muter";

bot.on("ready", () => {
  info(`Logged in as ${bot.user?.tag}!`);
  br();
});

bot.on("message", (message: Discord.Message) => {
  if (message.content.startsWith(`${PREFIX} `) && message.channel.type !== "dm") {
    if (message.content.endsWith("ping!")) {
      info(message.content);
      message.channel.send("pong!");
    }

    if (message.content.endsWith("setup")) {
      info(message.content);
      if (!message.member?.hasPermission("ADMINISTRATOR")) {
        warn("[Server]: I'm just going to ignore this!");
        return;
      }
      const authToken = nanoid();

      const embeddedSetupMessage = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Let's get you setup")
        // .setURL(`https://${process.env.HOST}/`)
        .setDescription("Some instructions here, for adding the AuthToken to the Bot Addon.")
        .setThumbnail(`https://${process.env.HOST}/images/logo.png`)
        .addField("Your Discord Muter AuthToken", authToken)
        .addField("Server config value", `\`\`\`config\ndiscord_auth_token "${authToken}"\n\`\`\``)
        .addFields(
          { name: "Step 1", value: "Open Garry's Mod Server config:\n`/garrysmod/cfg/server.cfg`", inline: true },
          { name: "Step 2", value: `Add the config value to Server config: \n\`discord_auth_token "${authToken}"\``, inline: true },
          { name: "Step 3", value: "Save your changes, and restart your Garry's Mod server.", inline: true }
        )
        // .setImage('') // Some instruction image here to show adding the AuthToken into place.
        .setTimestamp()
        .setFooter("Discord Muter", `https://${process.env.HOST}/images/logo_bordered.png`);

      if (message.content.endsWith("re-setup")) {
        dbase.reRegisterServer(Number(message.guild?.id), authToken, (success) => {
          if (success) {
            message.author.send(embeddedSetupMessage);
          } else {
            message.author.send("Something went wrong. This is probably an internal issue. We've notified the Code Monkies.");
          }
          message.channel.send("Check your private messages for setup instructions.");
        });
      } else {
        dbase.registerServer(Number(message.guild?.id), authToken, (success, reason) => {
          if (success) {
            message.author.send(embeddedSetupMessage);
          } else if (reason === "ER_DUP_ENTRY") {
            message.author.send(`If looks like the host is already connected. If you're sure you want to re-register, please run \`${PREFIX} re-setup\`.`);
          } else {
            message.author.send("Something went wrong. This is probably an internal issue. We've notified the Code Monkies.");
          }
          message.channel.send("Check your private messages for setup instructions.");
        });
      }
    }
    if (message.member?.hasPermission("ADMINISTRATOR")) {
      info("[Server]: Admin!");
    }
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
