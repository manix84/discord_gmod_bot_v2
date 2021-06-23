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

bot.on('voiceStateUpdate', (oldState, newState) => {
  if (newState.channelID !== oldState.channelID) {
    if (newState.channelID === null) {
      info(`${oldState.member.displayName} (${oldState.member.id}) left voice channels.`);
    } else {
      info(`${newState.member.displayName} (${newState.member.id}) joined "${newState.channel.name}" (${newState.channel.id}).`);
    }
  }
});

bot.login(process.env.DISCORD_TOKEN);

module.exports = {
  bot
};
