import CommandController from "../CommandController.js";
import ResponseHelper from "../ResponseHelper.js";
import app from "../App.js";
import Song from "../Song.js";

class SongController extends CommandController
{
    constructor() {
        super();
    }

    commands() {
        return [ 'songs' ];
    }


    async songsCommand(words, message, guild)
    {
        let db = app.service('db');
        let songs = await db('song').where({ guild_id: guild.id}).select();
        let msg = "> " + guild.t('founded-songs') + "\n";
        let firstMessage = true;
        let pageMsg = [];

        for (let index = 0; index < songs.length; index++){
            let pageIndex = parseInt(index/20);
            let song = songs[index];

            if ("undefined" == typeof (pageMsg[pageIndex])) {
                pageMsg[pageIndex] = firstMessage ? msg : '';
                firstMessage = false;
            }
            pageMsg[pageIndex] += "#" + song.id + "\t" + song.title + "\n";
        }
        await ResponseHelper.sendResponse(message, guild, pageMsg);
    }
}

export default SongController
