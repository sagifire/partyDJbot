import app from "./App.js"
import fs from 'fs';
import CommandListener from "./CommandListener.js";
import Guild from "./Guild.js";

class ConsoleController
{
    constructor()
    {
        this.commands = {
            'help' : 'help',
            'export-songs' : 'exportSongs',
            'import-songs' : 'importSongs',
        };
    }

    async run()
    {
        console.log('Run console controller');
        if ('undefined' !== typeof process.argv[2]) {

            let commandKey = process.argv[2].trim();
            let params = [];

            if ('undefined' !== typeof this.commands[commandKey] ) {

                for (let index = 3; index < process.argv.length; index++) {
                    params.push(process.argv[index]);
                }

                let command = this.commands[commandKey];
                app.run(false);

                await this.runCommand(command, params);
            } else {
                console.log('Unknown command!');
            }
        } else {
            console.log('Please set a command!');
            this.runCommand('help');
        }

        process.exit(1);
    }

    async runCommand(command, params = [])
    {
        await this[command + 'Command'](params);
    }

    async helpCommand(params)
    {
        console.log('Help');
    }

    async exportSongsCommand(params)
    {
        console.log('Export Songs');

        let db = app.service('db');
        let songs = await db('song').select('url');

        if (!songs) {
            console.log('No song found.');
        } else {
            let urls = [];
            for (let index = 0; index < songs.length; index++) {
                urls.push(songs[index].url);
            }
            let exportData = urls.join("\n");
            if ('undefined' !== typeof(params[0])) {
                fs.writeFileSync(params[0], exportData);
            } else {
                console.log(exportData);
            }
        }
    }

    async importSongsCommand(params)
    {
        console.log('Import Songs');
        if ('undefined' !== typeof(params[0]) && 'undefined' !== typeof(params[0])) {
            let db = app.service('db');
            try {
                let guild = await db('guild').where({'id' : params[1]}).first();
                if ('undefined' === typeof guild) {
                    throw new Error('Invalid guild id');
                }
                let importData = fs.readFileSync(params[0], 'utf8');
                let urls = importData.split("\n");

                guild = app.extend(new Guild(), {
                    id: guild.id,
                });
                guild.load();

                for (let index = 0; index < urls.length; index++) {
                    try {
                        let song = await guild.player.getSong(urls[index], guild.id);
                        console.log('Imported ' + (index + 1) + ' of ' + urls.length + ' > ' + urls[index]);
                    } catch (e) {
                        console.log('Error ' + e.statusCode + ' when import ' + (index + 1) + ' of ' + urls.length + ' > ' + urls[index]);
                    }
                }
            } catch (e) {
                console.log(e);
            }
        } else {
            console.log('Please set import file and guild id');
        }
    }
}

export default ConsoleController;