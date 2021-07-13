const { prefix } = require('../../config.json');

module.exports = (client, Discord, message) => {
     // Stop if sent by a bot or no prefix
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    
    // Create args array and shift the command name from it
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    // Get command from the collection by its name or alias
    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    // Refuse to execute if guildOnly
    if (command.guildOnly && message.channel.type === 'dm') {
        return message.reply('I can\'t execute that command inside DMs!');
    }

    // Refuse to execute if author is not permitted
    if (command.permissions) {
        const authorPerms = message.channel.permissionsFor(message.author);
        if (!authorPerms || !authorPerms.has(command.permissions)) {
            return message.reply('You can not do this!');
        }
    }

    // Refuse to execute if args required but missing
    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;
        
        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }
    
        return message.channel.send(reply);
    }

    // Reference to cooldowns collection
    const {cooldowns} = client;

    // Initialize a new command-collection entry in the cooldowns collection
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    // Time now, collection of timestamps of the command and the command's cooldown or default
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    // If author is present in the command's timestamps, calculate when the cooldown ends, how long is until that and print it
    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
        
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`)
        }
    }
    // Create new authorId-timestamp pair in the collection and set a timer to delete the timestamp when cooldown ends
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    // Try to execute the command, catching potential errors
    try {
        command.execute(client, message, args, Discord);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command');
    }
};
