const fetch = require('node-fetch');
const UserModel = require('../../models/userSchema.js');
const { prefix } = require('../../config.json');

module.exports = {
  name: 'apply',
  description: 'Apply for League of Legends match info in your Discord DM, right when you start a match',
  args: true,
  usage: '<region> <summoner name> (regions: euw1, eun1, na1, kr, br1, la1, la2, oc1, tr1, ru1, jp1)',
  cooldown: 20,
  async execute(client, message, args) {

    if (args.length === 1) return message.channel.send('You need to provide both the region and the summoner name!');

    const successMsg = 'Application succesful!, ' + message.author.toString();
    const errorMsg = 'There was an error trying to create your entry. Please, try again in a second ' + message.author.toString();

    const region = args[0];
    const sumName = args.slice(1).join(' ');

    try {
      const sumID = await fetch(
        'https://' + region + '.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + sumName + '?api_key=' + process.env.RIOT_TOKEN
      )
      .then(response => response.json())
      .then(data => data.id)
      .catch((err) => {
        throw err;
      });
      
      if (!sumID) {
        throw new Error('No ID found!');
      }

      // Make a new model if user doesn't have one
      // and return if summoner exists in the user's model
      const userData = await UserModel.findOne({ userID: message.author.id });
      if (userData) return message.channel.send('You have already applied! Your summoner is **' + userData.sumName + `**! You can change it by opting out **${prefix}optout**`);

      
      //
      // Create a model and save it
      await UserModel.create({
        userID: message.author.id,
        region: region,
        sumName: sumName,
        sumID: sumID,
      }).catch(() => {
        throw err;
      });

      message.channel.send(successMsg);

  //     else if (userData.summoners.length === sumLimit) {
  //       return message.channel.send(`You have already added the maximum of ${sumLimit} summoners! You can opt out with **${prefix}optout <region> <summoner name>**`);
  //     }
  //     else if (userData.summoners.find(summoner => summoner.sumName === sumName)) {
  //       return message.channel.send(`You have already applied this summoner before, ${message.author.toString()}! You can opt out with **${prefix}optout <region> <summoner name>**`);
  //     }
  //     else {
  //       await UserModel.findOneAndUpdate(
  //         {
  //           userID: message.author.id,
  //           'summoners.active': true
  //         },
  //         {
  //           $set: { 'summoners.$.active': false }
  //         },
  //         // null,
  //         (err) => {
  //           if (err) {
  //             throw new Error('Couldn\'t find an active summoner entry.');
  //           }
  //         }
  //       );
  //     }


  //     // Create and push a summoner object
  //     const summonerObj = {
  //       region: region,
  //       sumName: sumName,
  //       sumID: sumID
  //     };

  //     UserModel.findOneAndUpdate(
  //       { userID: message.author.id },
  //       { $push: { summoners: summonerObj } },
  //       // { upsert: true },
  //       (err) => {
  //         if (err) { message.channel.send(errorMsg) }
  //         else { message.channel.send(successMsg) }
  //       }
  //     );

    } catch (err) {
      console.log(err.message);
      message.channel.send(errorMsg);
    }
  }
}