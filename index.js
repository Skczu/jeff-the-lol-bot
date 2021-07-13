const dotenv = require('dotenv');
dotenv.config();
const Discord = require('discord.js')
const client = new Discord.Client();
const mongoose = require('mongoose');

//
// Make sure the prefix is not used by any other bots in the server
// Change the prefix in config.json if needed
//

// Collections
client.commands = new Discord.Collection();
client.events = new Discord.Collection();
client.cooldowns = new Discord.Collection();

// Handlers
for (handler of ['command_handler', 'event_handler']) {
  require(`./handlers/${handler}`)(client, Discord);
}

mongoose.connect(process.env.MONGODB_SRV, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
}).then(() => {
  console.log("Database ready!");
}).catch((e) => {
  console.log(e);
});

client.login(process.env.DC_TOKEN);