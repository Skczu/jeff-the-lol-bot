const fs = require('fs').promises;

module.exports = async (client, Discord) => {
  const commandFolders = await fs.readdir('./commands/');

  for (const folder of commandFolders) {
    const commandFiles = (await fs.readdir(`./commands/${folder}`))
      .filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const command = require(`../commands/${folder}/${file}`);
      client.commands.set(command.name, command);
    }
  }
}