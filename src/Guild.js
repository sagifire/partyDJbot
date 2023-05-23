import app from "./App.js";
import Player from "./Player.js"

class Guild
{
    constructor()
    {
        this.id = null;
        this.channel = null;
        this.voiceChannel = null;
        this.connection = null;
        this.volume = 2;
        this.songs = [];
        this.history = [];
        this.player = new Player(this);
        this.lastMessageLocale = null;
        this.settings = {
            prefix: '!',
            language: 'en',
            language_policy: 'change', // change, command, settings
            prefer_channel: null,
            prefer_voiceChannel: null,
        };
        this.admins = [];

        this.status = 'ready';
        this._tableName = 'guild';
    }

    async save()
    {
        let db = app.service('db');
        let result = await db('guild').where({ id: this.id}).update({
            id: this.id,
            status: this.status,
            volume: this.volume,
        });
        console.log('res',result);
        return result;
    }

    async load()
    {
        let db = app.service('db');
        let result = await db('guild').where({ id: this.id}).first();

        if (!result) {
            result = await db('guild').where({ id: this.id}).insert({
                id: this.id,
                status: this.status,
                volume: this.volume,
            });
            result = await db('guild').where({ id: this.id}).first();
        }
        this.volume = result.volume;

        return result;
    }

    addHistoryRecord(song)
    {
        this.history.push(song);
        if (this.history.length > 30) {
            this.history.shift();
        }
    }

    t(string, params = null)
    {
        let locale = this.settings.language;
        if ('command' === this.settings.language_policy && this.lastMessageLocale) {
            locale = this.lastMessageLocale;
        }
        return app.service('locale').t(locale, string, params);
    }

    setLastCommandLocale(locale)
    {
        this.lastMessageLocale = locale;
        if ('change' === this.settings.language_policy && this.lastMessageLocale) {
            this.settings.language = this.lastMessageLocale;
        }
    }

}

export default Guild;