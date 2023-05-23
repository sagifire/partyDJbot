import app from "./App.js"
import Guild from "./Guild.js";
import ResponseHelper from "./ResponseHelper.js";
import HelpController from "./commands/HelpController.js";
import PlayerController from "./commands/PlayerController.js";
import QueueController from "./commands/QueueController.js";
import SongController from "./commands/SongController.js";
import KeywordController from "./commands/KeywordController.js";

class CommandListener
{

    constructor()
    {
        this.commands = {};
        this.controllers = {};
        this.initControllers([
            HelpController , PlayerController , QueueController , SongController,
            KeywordController
        ]);

    }

    initControllers(classes)
    {
        for (let index = 0; index < classes.length; index++) {
            let controllerClass = classes[index];
            let controllerObject = new controllerClass();
            controllerObject.init();
            let commands = controllerObject.commands();
            for(let ci = 0; ci < commands.length; ci++) {
                this.commands[commands[ci]] = controllerObject;
            }
        }
    }

    init()
    {
        console.log('start command listener');

        app.service('client').on('message', async message => {
            if (message.author.bot) {
                return;
            }

            let guild = app.guilds.get(message.guild.id);
            if (!guild) {
                guild = app.extend(new Guild(), {
                    id: message.guild.id,
                });
                guild.load();
                app.guilds.set(message.guild.id, guild);

            }

            if (!message.content.startsWith(guild.settings.prefix)) {
                return;
            }

            let startPrefix = '!';
            if (guild.settings.prefix) {
                startPrefix = guild.settings.prefix;
            }
            let words = message.content.replace(startPrefix, '').split(/\s+/).filter(function (el) {
                return el != null && el != "";
            });

            let commandData = app.service('locale').locateCommand( words[0] );

            let commandIsFounded = false;

            if (commandData && commandData.command) {

                for (let commandId in this.commands) {
                    if (!this.commands.hasOwnProperty(commandId)) continue;
                    if (commandId == commandData.command) {
                        guild.setLastCommandLocale(commandData.locale);
                        this.runCommand(commandId, words, message, guild);
                        commandIsFounded = true;
                    }
                }
            }

            if (!commandIsFounded) {
                await ResponseHelper.sendResponse(message, guild, guild.t("command-not-found"));
            }
        });
    }

    runCommand(command, words, message, guild)
    {
        console.log(guild.id + ' run command ' + command);

        if (message.channel) {
            guild.channel = message.channel;
        }

        this.commands[command][command + 'Command'](words, message, guild);
    }

}

export default CommandListener;