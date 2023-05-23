import app from "./App.js"

class ResponseHelper {

}

ResponseHelper.sendResponse = async function(message, guild, strings) {
    let channel = message ? message.channel : guild.channel;
    if (!Array.isArray(strings)) {
        strings = [strings];
    }
    if (channel) {
        for (let index = 0; index < strings.length; index++) {
            await channel.send(strings[index]);
        }
    }
};

ResponseHelper.msgCurrentSong = function (message, guild) {
    return(
        "> Зараз грає:\n" + "```#" + guild.songs[0].id + "\t\t" + guild.songs[0].title + "\n\n"
        + guild.songs[0].getKeywordsString() + "```"
        + "Url: " + guild.songs[0].url
        // ,  { files:[ guild.songs[0].image] }
    );
};

ResponseHelper.msgAddToQueue = function (message, guild, song) {
    return "> Додана до черги:\n" + "```#" + song.id + "\t\t" + song.title + "\n\n"
    + song.getKeywordsString() + "```" // ,  { files:[ song.image] }
        + "Url: " + song.url
};

export default ResponseHelper;