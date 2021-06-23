const Discord = require('discord.js');

const bot = new Discord.Client();

bot.on('ready', () => {
  console.log(`Logged in as ${bot.user.tag}!`);
});

bot.on('interaction', async interaction => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
});

bot.login(process.env.DISCORD_TOKEN);

module.exports = {
  bot
};
