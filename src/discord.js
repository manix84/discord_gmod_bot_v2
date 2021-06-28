const Discord = require('discord.js');
const { nanoid } = require('nanoid');
const { success, info, error, newLine } = require('./utils/log');

const bot = new Discord.Client();
const PREFIX = process.env.DISCORD_PREFIX || '!muter ';

bot.on('ready', () => {
  info(`Logged in as ${bot.user.tag}!`);
  newLine();
});

bot.on('message', (message) => {
  if (message.content.startsWith(PREFIX)) {
    if (message.content.endsWith('ping!')) {
      info(message.content);
      message.channel.send('pong!');
    }
    if (message.content.endsWith('setup')) {
      info(message.content);
      const authToken = nanoid();
      const embeddedSetupMessage = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Let\'s get you setup')
        // .setURL(`https://${process.env.HOST}/`)
        .setDescription('Some instructions here, for adding the AuthToken to the Bot Addon.')
        .setThumbnail(`https://${process.env.HOST}/images/logo.png`)
        .addField('Your Discord Muter AuthToken', authToken)
        .addField('Server config value', `\`\`\`config\ndiscord_auth_token "${authToken}"\n\`\`\``)
        .addFields(
          { name: 'Step 1', value: 'Open Garry\'s Mod Server config:\n`/garrysmod/cfg/server.cfg`', inline: true },
          { name: 'Step 2', value: `Add the config value to Server config: \n\`discord_auth_token "${authToken}"\``, inline: true },
          { name: 'Step 3', value: 'Save your changes, and restart your Garry\'s Mod server.', inline: true }
        )
        // .setImage('') // Some instruction image here to show adding the AuthToken into place.
        .setTimestamp()
        .setFooter('Discord Muter', `https://${process.env.HOST}/images/logo_bordered.png`);
      message.channel.send(embeddedSetupMessage);
    }
    if (message.member.hasPermission('ADMINISTRATOR')) {
      info('THIS USER HAS ADMINISTRATOR PERMISSIONS!');
    }
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

const mutePlayer = (discordMemberID, discordServerID) => {
  bot.guilds.fetch(discordServerID).then(discordGuild => {
    discordGuild.members.fetch(discordMemberID).then((member) => {
      if (!member.voice.serverMute) {
        member.voice.setMute(true, "Dead players can't talk!").then(() => {
          success(
            '[Mute][Discord:SetMute][Success]',
            `Muted ${discordMemberID}`
          );
        }).catch((err) => {
          error(
            '[Mute][Discord:SetMute][Error]',
            `Mute: ${discordMemberID} - ${err}`
          );
        });
      }
    }).catch((err) => {
      error(
        '[Mute][Discord:SetMute][Error]',
        `Mute: ${discordMemberID} - ${err}`
      );
    });
  }).catch((err) => {
    error(
      '[Mute][Discord:SetMute][Error]',
      `Mute: ${discordMemberID} - ${err}`
    );
  });
};

const init = () => {
  bot.login(process.env.DISCORD_TOKEN);
};

module.exports = {
  init,
  mutePlayer
};
