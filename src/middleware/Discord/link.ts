import { Message, MessageEmbed } from "discord.js";
import { generateLinkToken } from "../../utils/linkToken";
import { error } from "../../utils/log";
import Database from "../Database";

const dbase = new Database();
const PREFIX = process.env.DISCORD_PREFIX || "!muter";

export const generateLinkInstructions = (linkToken: string) => (
  new MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Let's get you setup")
    .setThumbnail(`https://${process.env.HOST}/images/logo.png`)
    .addField("Your Discord Muter AuthToken", `\`${linkToken}\``)
    .addField("In game, type in chat:", `\`\`\`say\n${PREFIX} ${linkToken}\n\`\`\``)
    .addFields(
      { name: "Step 1", value: "Join the Garrys Mod Server", inline: true },
      { name: "Step 2", value: "Open general chat (usually by pressing the 🆈 key)", inline: true },
      { name: "Step 3", value: `Type in \`${PREFIX} ${linkToken}\`, and press enter.`, inline: true }
    )
    .setTimestamp()
    .setFooter("Discord Muter", `https://${process.env.HOST}/images/logo_bordered.png`)
);

const link = (message: Message) => {
  const linkToken = generateLinkToken();
  const discordUserID = message.author.id;
  dbase.registerDiscordUser(discordUserID, linkToken, true)
    .then(() => {
      message.channel.send(`<@${message.author.id}>: Check your direct messages for linking instructions.`).catch(error);
      message.author.send(generateLinkInstructions(linkToken)).catch(error);
    }).catch((err) => {
      error(err);
      let friendlyMessage = "Something went wrong. This is probably an internal issue. We've notified the Code-Monkeys.";
      switch(err.code) {
        case "ER_DUP_ENTRY":
          friendlyMessage = "We've already got a link for you. No need to repeat this step.";
          break;
      }
      message.author.send(friendlyMessage).catch(error);
    });
};

export default link;
