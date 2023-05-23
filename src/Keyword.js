import app from "./App.js";

class Keyword
{
    constructor()
    {
        this.id = null;
        this.name = null;
        this.genre = false;
    }

}

Keyword.generateKeywordList = async function (keys)
{
    let keywordList = [];
    let db = app.service('db');
    for (let index = 0; index < keys.length; index++)
    {
        let name = keys[index];
        name = name.trim().toLowerCase().replace(/ /g, '-');
        let result = await db('keyword').where({ 'name' : name }).first();
        if (!result) {
            let ids = await db('keyword').insert({ 'name' : name, 'genre' : false });
            result = {
                id: ids[0],
                name: name,
                genre: false
            };
        }
        keywordList.push(app.extend(new Keyword(), result));
    }
    return keywordList;
};

Keyword.link = async function(song, keys)
{
    if (!keys) {
        return;
    }
    let db = app.service('db');
    let keyList = await Keyword.generateKeywordList(keys);
    let songKeys = [];
    await db('song_keyword').where({song_id: song.id}).delete();
    for (let index = 0; index < keyList.length; index++) {
        let keyword = keyList[index];
        songKeys.push(keyword.name);
        try {
            await db('song_keyword').insert({
                song_id: song.id,
                keyword_id: keyword.id,
            });
        } catch (e) {
            console.log('Warning:');
            console.log('Song: ', song.id, ' ', song.name);
            console.log('Keyword: ', keyword);
            console.log('All keywords: ', keys, keyList);
        }
    }
    song.keywords = songKeys;
};

Keyword.getSongKeywordList = async function(songId)
{
    let keyList = [];
    let db = app.service('db');

    let result = await db('keyword').innerJoin('song_keyword', function() {
        this.on('song_keyword.keyword_id', '=', 'keyword.id').andOn('song_keyword.song_id', '=', songId);
    }).select();

    for(let index = 0; index < result.length; index++) {
        keyList.push(app.extend(new Keyword, result[index]));
    }
    return keyList;
};

Keyword.getSongKeywords = async function(songId)
{
    let words = [];
    let keyList = await Keyword.getSongKeywordList(songId);
    for (let index = 0; index < keyList.length; index++) {
        words.push(keyList[index].name);
    }
    return words;
};


export default Keyword;