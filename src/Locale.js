import App from "./App.js"
import glob from "glob"
import path from "path"
import fs from "fs"


class Locale
{
    constructor()
    {
        this.locales = [];
    }

    init()
    {
        console.log('init locale');
        this.loadLocaleFiles();
    }

    loadLocaleFiles()
    {
        let localeFile = './languages';
        let service = this;

        glob.sync( './languages/**/*.json' ).forEach( function( file ) {
            let localeData = fs.readFileSync(file);
            if (localeData) {
                try {
                    localeData = JSON.parse(localeData);
                    service.locales[path.parse(file).name] = localeData;
                } catch (e) {
                    console.log('On load ' + file + ' local: ' + e);
                }
            }
        });
    }

    locateCommand(command)
    {
        let result = null;
        for (let lang in this.locales) {
            if (!this.locales.hasOwnProperty(lang)) {
                continue;
            }
            for (let cmd in this.locales[lang].commands) {
                if (!this.locales[lang].commands.hasOwnProperty(cmd)) {
                    continue;
                }
                if (this.locales[lang].commands[cmd].includes(command)) {
                    result = {
                        'command' : cmd,
                        'locale' : lang
                    };
                    break;
                }
            }
            if (result) {
                break;
            }
        }
        return result;
    }

    t(language, message, params = null)
    {
        if ('undefined' !== typeof(this.locales[language])
            && 'undefined' !== typeof(this.locales[language]['messages'][message])
        ) {
            message = this.locales[language]['messages'][message];
        } else {
            console.log('Warning! locale not found for message:' + "\n" + message );
        }
        if (Array.isArray(params)) {
            for (let paramKey in params) {
                if (!params.hasOwnProperty(paramKey)) {
                    continue;
                }
                message = message.replace(paramKey, params[paramKey]);
            }
        }
        return message;
    }
}
const locale = new Locale();
export default locale