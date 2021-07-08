export const getPrefix = (prefix?: string) => {
  return (prefix || process.env.DISCORD_PREFIX || "!muter").trim();
};

export const isCommand = (message: string, prefix?: string) => {
  const PREFIX = getPrefix(prefix);
  return message.startsWith(PREFIX);
};

export const parseCommand = (message: string, prefix?: string) => {
  if (!isCommand(message, prefix)) return false;

  const PREFIX = getPrefix(prefix);
  const command = message.replace(new RegExp(`^(${PREFIX} )`, "gi"), "").trim();
  if (!command) return false;

  return command;
};

export default parseCommand;
