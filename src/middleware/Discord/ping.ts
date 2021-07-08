import Discord from "discord.js";
import { info } from "../../utils/log";

const ping = (message: Discord.Message) => {
  info(message.content);
  message.channel.send("pong!");
};

export default ping;
