const dotenv = require('dotenv');
dotenv.config();
const fetch = require('node-fetch');

module.exports = async (client, Discord, userData) => {

  // Fetch and JSON the data
  const fetchData = (url) => {
    return fetch(url)
      .then(response => {
        if (!response.ok)
          throw new Error("No data found!");
        return response.json();
      })
  }

  // Get rank data for a summoner
  const getRankData = async (playerID) => {
    const url = `https://${userData.region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${playerID}?api_key=${process.env.RIOT_TOKEN}`;
    return await fetchData(url)
      .then(data => {
        const soloq = data.find(mode => mode.queueType === "RANKED_SOLO_5x5");
        if (soloq.tier === "undefined") {
          return "UNRANKED";
        }
        let wr = (soloq.wins / (soloq.wins + soloq.losses)) * 100;
        wr = Math.round((wr + Number.EPSILON) * 10) / 10;
        return (soloq.tier + " " + soloq.rank + " " + wr + "% WR");
      })
      .catch((err) => { throw err });
  }

  try {
    // Get the user's data and get his current game data
    const gameData = await fetchData(
      `https://${userData.region}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${userData.sumID}?api_key=${process.env.RIOT_TOKEN}`
    ).catch((err) => { throw err });
    

    // Array of objects representing two teams, each key-value is "summoner: rank"
    const participantsData = gameData.participants;

    let teams = [];
    teams[0] = new Object();
    teams[1] = new Object();

    for (const summoner of participantsData) {
      const playerID = summoner.summonerId;
      const playerTeam = summoner.teamId;

      const rank = await getRankData(playerID);
      
      if(playerTeam == 100) {
        teams[0][summoner.summonerName] = rank;
      } else {
        teams[1][summoner.summonerName] = rank;
      }
    };

    const teamToEntries = (i) => {
      return Object.entries(teams[i])
      .reduce((acc, currVal) => `${acc}${
        currVal[0] + " - " + currVal[1]}\n`,
      "")
      .trim();
    };

    let team100 = '';
    let team200 = '';
    if (teams[0].hasOwnProperty(userData.sumName)) {
      team100 = teamToEntries(0);
      team200 = teamToEntries(1);
    } else {
      team100 = teamToEntries(1);
      team200 = teamToEntries(0);
    }

    const embed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setAuthor('LEAGUE OF LEGENDS')
      .setTitle(userData.sumName + " - Solo Queue")
      .setThumbnail('https://i.imgur.com/vgERB5I.png')
      .addFields(
        { name: 'Your team', value: team100 },
        { name: 'Enemy team', value: team200 }
      );

    client.users.cache.get(userData.userID).send(embed)
      .then(() => { console.log(`Embed sent to ${userData.userID}`) })
      .catch((err) => {
        console.log(`Could not send embed to ${userID}`);
        throw err;
      });

  } catch (err) {
    console.log(err.message);
  }
}