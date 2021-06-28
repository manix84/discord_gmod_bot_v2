import Discord from "discord.js";
import { nanoid } from "nanoid";
import { success, info, warn, error, br } from "../utils/log";

const bot = new Discord.Client();
const PREFIX: string = process.env.DISCORD_PREFIX || "!muter";

bot.on("ready", () => {
  info(`Logged in as ${bot.user?.tag}!`);
  br();
});

bot.on("message", (message) => {
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
      message.author.send(embeddedSetupMessage);
      message.channel.send("Check your private messages for setup instructions.");
    }
    if (message.member?.hasPermission("ADMINISTRATOR")) {
      info("[Server]: Admin!");
    }
  }
});

bot.on("voiceStateUpdate", (oldState, newState) => {
  if (newState.channelID !== oldState.channelID) {
    if (newState.channelID === null) {
      info(`${oldState.member?.displayName} (${oldState.member?.id}) left voice channels.`);
    } else {
      info(`${newState.member?.displayName} (${newState.member?.id}) joined "${newState.channel?.name}" (${newState.channel?.id}).`);
    }
  }
});

export const mutePlayer = (discordMemberID: string, discordServerID: string): void => {
  bot.guilds.fetch(discordServerID).then(discordGuild => {
    discordGuild.members.fetch(discordMemberID).then((member) => {
      if (!member.voice.serverMute) {
        member.voice.setMute(true, "Dead players can't talk!").then(() => {
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

export const init = (): void => {
  bot.login(process.env.DISCORD_TOKEN);
};
