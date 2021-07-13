const UserModel = require('../../models/userSchema');

module.exports = {
  name: 'optout',
  description: 'Stop receiving match info in your DMs for a certain summoner that you applied for before.',
  cooldown: 20,
  async execute(client, message) {
    
    const successMsg = 'Success! You have opted out.';
    const errorMsg = 'There was an error trying to delete your entry. Please, try again in a second ' + message.author.toString();

    try {
      // Delete the user's document
      const userData = await UserModel.findOneAndDelete({ userID: message.author.id })
        .catch((err) => {
          message.channel.send(errorMsg);
          throw err;
        });

      // If not applied, return
      if (!userData) return message.channel.send('You haven\'t applied yet, there\'s nothing to cancel!');
      message.channel.send(successMsg);
      
    } catch (err) {
      console.log(err.message);
      return message.channel.send(errorMsg);
    }
  }
}