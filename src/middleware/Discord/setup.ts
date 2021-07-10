import { Message, MessageEmbed } from "discord.js";
import { nanoid } from "nanoid";
import { warn } from "../../utils/log";
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
    warn("[Server]: I'm just going to ignore this!");
    return;
  }
  const authToken = nanoid();
  dbase.registerServer(Number(message.guild?.id), authToken, (success, reason) => {
    if (success) {
      message.author.send(generateSetupInstructions(authToken));
    } else if (reason === "ER_DUP_ENTRY") {
      message.author.send(`If looks like the host is already connected. If you're sure you want to re-register, please run \`${PREFIX} re-setup\`.`);
    } else {
      message.author.send("Something went wrong. This is probably an internal issue. We've notified the Code-Monkeys.");
    }
    message.channel.send("Check your private messages for setup instructions.");
  }, overwrite);
};

export default setup;
