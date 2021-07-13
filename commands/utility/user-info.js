module.exports = {
    name: 'user-info',
    description: 'User info.',
    execute(client, message, args) {
        message.channel.send(`Your username: ${message.author.username}\nYourID: ${message.author.id}`);
    },
};