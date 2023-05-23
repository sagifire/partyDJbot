import CommandController from "../CommandController.js";
import ResponseHelper from "../ResponseHelper.js";
import app from "../App.js";
import Song from "../Song.js";
import Player from "../Player.js";

class QueueController extends CommandController
{
    constructor() {
        super();
    }

    commands() {
        return [ 'queue' , 'skip' ];
    }

    async queueCommand(words, message, guild)
    {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return ResponseHelper.sendResponse(message, guild,"> " + guild.t("need-voice-chanel"));
        }
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
            return ResponseHelper.sendResponse(message, guild,"> " + guild.t("need-voice-chanel-access"));
        }

        if (words.length > 1) {
            let db = app.service('db');
            let maxQueueLength = 10;
            if (words.length > 2) {
                let count = parseInt(words[2]);
                if (count > 0 && count < 30) {
                    maxQueueLength = count;
                }
            }
            if ('*' == words[1]) {
                let newSongs = await Song.getRandomSongs(guild.id, maxQueueLength);
                if (newSongs.length) {
                    let currentSong = guild.songs.length ? guild.songs[0] : null;
                    guild.songs = currentSong ? [ currentSong ] : [];
                    for (let index = 0; index < newSongs.length; index++) {
                        let song = app.extend(new Song, newSongs[index]);
                        song = await song.load();
                        guild.songs.push(song);
                    }
                    if (Player.STATUS_READY == guild.player.status) {
                        if (!guild.voiceChannel) {
                            guild.voiceChannel = voiceChannel;
                        }
                        if (!guild.connection) {
                            guild.connection = await guild.voiceChannel.join();
                        }
                        await guild.player.play();
                    }
                } else {
                    return ResponseHelper.sendResponse(message, guild,`> ` + guild.t('no-songs-in-db'));
                }
            }
        }
        if (guild.songs.length > 0) {
            let msg = "> Сипсок пісень в черзі:\n```\n";
            let firstSongFlag = (guild.status === "play" && guild.songs.length > 1);
            for (let index = 0; index < guild.songs.length; index++) {
                let song = guild.songs[index];

                if (firstSongFlag) {
                    firstSongFlag = false;
                } else {
                    msg += (index + 1) + "\t#" + song.id + "\t" + song.title + "\n";
                }
            }
            await ResponseHelper.sendResponse(message, guild,msg + "```" );
        } else {
            ResponseHelper.sendResponse(message, guild,`> В черзі немає пісень`);
        }
    }

    skipCommand(words, message, guild)
    {
        if (!message.member.voice.channel)
            return ResponseHelper.sendResponse(message, guild,"> Ти маєш бути в голосовому каналі щоб зупинити пісню!");
        if (!guild.voiceChannel)
            ResponseHelper.sendResponse(message, guild,"> Чувак! Зараз нічого не грає.");

        guild.connection.dispatcher.end();

        // return ResponseHelper.sendResponse(ResponseHelper.msgCurrentSong(message, guild));
    }
}

export default QueueController