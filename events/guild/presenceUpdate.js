const UserModel = require('../../models/userSchema');
const gameData = require('../../myModules/gameData');

module.exports = async (client, Discord, oldPresence, newPresence) => {

  const userID = newPresence.userID;

  const findGame = (activities) => {
    return activities.find(activity =>
      activity.name === 'League of Legends' &&
      activity.state === 'In Game' &&
      (
        activity.details === 'Summoner\'s Rift (Normal)' ||
        activity.details === 'Summoner\'s Rift (Ranked)' ||
        activity.details === 'Howling Abyss (ARAM)'
      )
    );
  }

  if (!findGame(oldPresence.activities) && findGame(newPresence.activities)) {
      
    const userData = await UserModel.findOne({ userID: userID });
    if (!userData) return;

    // Execute after 5s, so API already has the game data to be fetched
    setTimeout(gameData, 5000,
      client, Discord, userData);
  }
}