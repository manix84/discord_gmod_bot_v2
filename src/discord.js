const Discord = require('discord.js');

const bot = new Discord.Client();

bot.on('ready', () => {
  console.log(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', (message) => {
  if (message.content.startsWith('ping!')) {
    message.channel.send('pong!');
  }
});

bot.login(process.env.DISCORD_TOKEN);

module.exports = {
  bot
};
