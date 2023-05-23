import app from "./App.js";
import Keyword from "./Keyword.js";

class Song
{
    constructor()
    {
        this.id = null;
        this.guild_id = null;
        this.title = null;
        this.url = null;
        this.image = null;
        this.type = 1; //"youtube";
        this.length_seconds = null;

        this.keywords = [];
    }

    async save(guild_id)
    {
        let db = app.service('db');
        let result = await db('song').where({ id: this.id}).update({
            guild_id: guild_id,
            title: this.title,
            url: this.url,
            image: this.image,
            length_seconds: this.length_seconds,
            type: this.type,
        });
        return result;
    }

    async load(guild_id)
    {
        let db = app.service('db');
        let result = await db('song').where({ id: this.id}).first();

        if (!result) {
            result = await db('song').where({ id: this.id}).insert({
                guild_id: guild_id,
                title: this.title,
                image: this.image,
                url: this.url,
                length_seconds: this.length_seconds,
                type: this.type,
            });
            this.id = result[0];
            result = await db('song').where({ id: this.id}).select();
            result = result[0];
        }

        let song = app.extend(new Song, result);
        song.keywords = await Keyword.getSongKeywords(song.id);

        return song;
    }

    async linkKeywords(keys)
    {
        await Keyword.link(this, keys);
    }

    getKeywordsString()
    {
        let keys = [];
        for (let index = 0; index < this.keywords.length; index++) {
            keys.push('#' + this.keywords[index]);
        }
        return keys.join("\t");
    }
}

Song.getRandomSongs = async function(guildId, maxQueueLength)
{
    let db = app.service('db');
    let result = await db('song').where({
        guild_id: guildId,
    }).select().orderBy(db.raw('RANDOM()')).limit(maxQueueLength);
    return result;
};

export default Song;