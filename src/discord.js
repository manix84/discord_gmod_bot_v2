const Discord = require('discord.js');
const { info, newLine } = require('./utils/log');

const bot = new Discord.Client();

bot.on('ready', () => {
  info(`Logged in as ${bot.user.tag}!`);
  newLine();
});

bot.on('message', (message) => {
  info(message.content);
  if (message.content.startsWith('ping!')) {
    message.channel.send('pong!');
  }
});

bot.login(process.env.DISCORD_TOKEN);

module.exports = {
  bot
};
