module.exports = {
    name: 'server',
    description: 'Server info.',
    guildOnly: true,
    execute(client, message, args) {
        message.channel.send(`Server's name: ${message.guild.name}\nTotal members: ${message.guild.memberCount}`);
    },
};