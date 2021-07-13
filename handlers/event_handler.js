const fs = require('fs').promises;

module.exports = async (client, Discord, message) => {
  async function dir(dirName) {
    const files = (await fs.readdir(`./events/${dirName}`)).filter(file => file.endsWith('.js'));
    for (const file of files) {
      const event = require(`../events/${dirName}/${file}`);
      const eventName = file.split('.')[0];
      client.on(eventName, event.bind(null, client, Discord));
    }
  }
  Promise.all(['client', 'guild'].map(d => dir(d)));
}