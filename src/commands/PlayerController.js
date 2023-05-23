import CommandController from "../CommandController.js";
import ResponseHelper from "../ResponseHelper.js";
import app from "../App.js";
import ytdl from "ytdl-core";
import Song from "../Song.js";
import Player from "../Player.js";

class PlayerController extends CommandController
{
    constructor()
    {
        super();
    }

    commands()
    {
        return [ 'play', 'volume', 'stop' ];
    }

    async playCommand(words, message, guild)
    {
        if (words.length < 2) {
            if (Player.STATUS_READY === guild.player.status) {
                // return message.channel.send(
                //     "> Введіть URL пісні!"
                // );
                app.service('commands').runCommand('queue', ["queue", "*"], message, guild);
                return;
            } else {
                return ResponseHelper.sendResponse(message, guild, ResponseHelper.msgCurrentSong(message, guild));
            }
        }

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return ResponseHelper.sendResponse(message, guild, "> " + guild.t("need-voice-chanel"));
        }
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
            return ResponseHelper.sendResponse(message, guild, "> " + guild.t("need-voice-chanel-access"));
        }

        let song = await guild.player.getSong(words[1], guild.id);
        if (!song) {
            return ResponseHelper.sendResponse(message, guild, "> " + guild.t("song-not-found") + " " + words[1]);
        }

        if (!guild.voiceChannel) {
            guild.voiceChannel = voiceChannel;
        }

        guild.songs.push(song);

        if (Player.STATUS_READY == guild.player.status) {
            if (!guild.connection) {
                // todo refactor
                guild.connection = await guild.voiceChannel.join();

                guild.player.playSong(song);
            }
        } else if(guild.player.status = Player.STATUS_PLAYING) {
            return ResponseHelper.sendResponse(message, guild, ResponseHelper.msgAddToQueue(message, guild, song));
        }
    }

    stopCommand(words, message, guild)
    {
        if (!message.member.voice.channel)
            return ResponseHelper.sendResponse(message, guild, "> " + guild.t("need-voice-chanel"));

        if (!guild.voiceChannel)
            ResponseHelper.sendResponse(message, guild,"> Чувак! Зараз нічого не грає.");

        guild.player.stop();
    }

    volumeCommand(words, message, guild)
    {
        if (!message.member.voice.channel || guild.player.status === Player.STATUS_READY || !guild.connection)
            return ResponseHelper.sendResponse(message, guild,"> Нема що регулювати!");

        if (words.length < 1)
            return ResponseHelper.sendResponse(message, guild,"> Поточний голос: " + guild.volume);

        let volume = parseFloat(words[1]);
        if (volume > 5)
            return ResponseHelper.sendResponse(message, guild,"> Максимальний голос 5!");


        guild.volume = volume;
        const dispatcher = guild.connection.dispatcher;
        if (dispatcher) {
            dispatcher.setVolumeLogarithmic(guild.volume / 5);
            guild.save();
            return ResponseHelper.sendResponse(message, guild,`> Сила звуку змінена: **${volume}**`);
        }
    }


}

export default PlayerController