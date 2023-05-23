import App from "./App.js"
import ytdl from "ytdl-core";
import ResponseHelper from "./ResponseHelper.js";
import app from "./App.js";
import Song from "./Song.js";

class Player
{
    constructor(guild)
    {
        this.guild = guild;
        this.status = Player.STATUS_READY;
    }

    next()
    {

    }

    prev()
    {

    }

    play()
    {
        this.playSong(this.guild.songs[0]);
    }

    stop()
    {
        this.guild.songs = [];
        this.guild.connection.dispatcher.end();
    }

    reset()
    {

    }

    pause()
    {

    }

    async playSong(song)
    {
        if (!song) {
            this.guild.connection = null;
            this.guild.voiceChannel.leave();
            this.guild.voiceChannel = null;
            this.status = Player.STATUS_READY;
            this.guild.load();
            return;
        }

        let songData = ytdl(song.url);
        if (!songData || 'object' == typeof songData.videoDetails) {
            console.log('INVALID SONG DATA!!!', songData);
            return;
        }
        const dispatcher = this.guild.connection
            .play(songData)
            .on("finish", () => {
                this.guild.songs.shift();
                this.playSong(this.guild.songs[0]);
            })
            .on("error", error => console.error(error));
        dispatcher.setVolumeLogarithmic(this.guild.volume / 5);
        this.status = Player.STATUS_PLAYING;
        this.guild.save();
        return ResponseHelper.sendResponse(null, this.guild, ResponseHelper.msgCurrentSong(null, this.guild));
    }

    async getSong(search, guildId) {
        try {
            let db = app.service('db');
            let song = false;
            let dbResult = await db('song').where({ url: search, guild_id: guildId }).select() ;
            if (0 === search.indexOf("#")) {
                let idNumber = parseInt(search.replace('#', ''));
                dbResult = await db('song').where({ id: idNumber, guild_id: guildId }).select();
                if (dbResult.length) {
                    song = app.extend(new Song, dbResult[0]);
                    song = song.load(guildId);
                }
            } else if (dbResult.length) {
                song = app.extend(new Song, dbResult[0]);
            } else {
                const songInfo = await ytdl.getInfo(search);
                if ('undefined' != typeof songInfo.videoDetails) {
                    let keywords = songInfo.videoDetails.keywords;

                    song = app.extend(new Song, {
                        guild_id: guildId,
                        title: songInfo.videoDetails.title,
                        url: songInfo.videoDetails.video_url,
                        length_seconds: songInfo.videoDetails.lengthSeconds,
                        image: songInfo.videoDetails.thumbnails.length ? songInfo.videoDetails.thumbnails[0].url : null,
                    });
                    song = await song.load(guildId);
                    await song.linkKeywords(keywords);
                }
            }
            return song;
        } catch (e) {
            console.log(e);
            throw(e);
        }
        return false;
    }
}

Player.STATUS_READY = 'ready';
Player.STATUS_PLAYING = 'playing';
Player.STATUS_PAUSE = 'pause';

export default Player;