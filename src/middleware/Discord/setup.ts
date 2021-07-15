import { Message, MessageEmbed } from "discord.js";
import { MysqlError } from "mysql";
import { nanoid } from "nanoid";
import { error, warn } from "../../utils/log";
import Database from "../Database";

const dbase = new Database();
const PREFIX: string = process.env.DISCORD_PREFIX || "!muter";

export const generateSetupInstructions = (authToken: string) => (
  new MessageEmbed()
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
    .setFooter("Discord Muter", `https://${process.env.HOST}/images/logo_bordered.png`)
);

const setup = (message: Message, overwrite = false) => {
  if (!message.member?.hasPermission("ADMINISTRATOR")) {
    warn(`${message.member?.displayName} (${message.member?.id}): "${message.content}"`);
    warn("[Server]: Not an Admin, so i'm just going to ignore this!");
    return;
  }
  const authToken = nanoid();
  dbase.registerServer(`${message.guild?.id}`, authToken, overwrite)
    .then(() => {
      message.author.send(generateSetupInstructions(authToken)).catch(error);
      message.channel.send("Check your direct messages for setup instructions.").catch(error);
    }).catch((err: MysqlError) => {
      let friendlyMessage = "Something went wrong. This is probably an internal issue. We've notified the Code-Monkeys.";
      switch (err.code) {
        case "ER_DUP_ENTRY":
          friendlyMessage = `If looks like the host is already connected. If you're sure you want to re-register, please run \`${PREFIX} re-setup\`.`;
          break;
      }
      message.author.send(friendlyMessage).catch(error);
    });
};

export default setup;
