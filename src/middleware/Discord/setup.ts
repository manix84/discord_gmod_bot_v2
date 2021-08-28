import { Message, MessageEmbed } from "discord.js";
import { MysqlError } from "mysql";
import { nanoid } from "nanoid";
import { error, warn } from "../../utils/log";
import Database from "../Database";

const dbase = new Database();
const PREFIX: string = process.env.DISCORD_PREFIX || "!muter";

export const generateSetupInstructions = (authToken: string, serverID: string) => (
  new MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Let's get you setup")
    // .setURL(`https://${process.env.HOST}/`)
    // .setDescription("Some instructions here, for adding the AuthToken to the Bot Addon.")
    .setThumbnail(`https://${process.env.HOST}/images/logo.png`)
    .addField("Your Discord Muter AuthToken", authToken)
    .addField("Server config values", `\`\`\`config
discord_auth_token "${authToken}"
discord_server_id ${serverID}
discord_channel_id <Your chosen Channel ID>
\`\`\``)
    .addField("To find your channel ID:", "https://github.com/manix84/discord_gmod_addon_v2/wiki/Finding-your-Channel-ID")
    .addFields(
      { name: "Step 1", value: "Open Garry's Mod Server config:\n`/garrysmod/cfg/server.cfg`", inline: true },
      { name: "Step 2", value: "Add the config values above to your Server config.", inline: true },
      { name: "Step 3", value: "Save your changes, and restart your Garry's Mod server.", inline: true }
    )
    // .setImage("https://${process.env.HOST}/images") // Some instruction image here to show adding the AuthToken into place.
    .setTimestamp()
    .setFooter("Discord Muter", `https://${process.env.HOST}/images/logo_bordered.png`)
);

const setup = (message: Message, overwrite = false) => {
  if (!message.member?.hasPermission("ADMINISTRATOR")) {
    warn(`${message.member?.displayName} (${message.member?.id}): "${message.content}"`);
    warn("[Server]: Not an Admin, so I'm just going to ignore this!");
    return;
  }
  const authToken = nanoid();
  const serverID = message.guild?.id;
  dbase.registerServer(`${serverID}`, authToken, overwrite)
    .then(() => {
      message.author.send(generateSetupInstructions(authToken, `${serverID}`)).catch(error);
      message.channel.send("Check your direct messages for setup instructions.").catch(error);
    }).catch((err: MysqlError) => {
      let friendlyMessage = "Something went wrong. This is probably an internal issue. We've notified the Code-Monkeys.";
      switch (err.code) {
        case "ER_DUP_ENTRY":
          friendlyMessage = `If looks like the host is already connected. If you're sure you need a new AuthToken, please run:\`\`\`\n${PREFIX} re-setup\n\`\`\`\n**Remember:** This will invalidate your existing token.`;
          break;
      }
      message.author.send(friendlyMessage).catch(error);
    });
};

export default setup;
