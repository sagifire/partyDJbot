import CommandController from "../CommandController.js";
import app from "../App.js";
import ResponseHelper from "../ResponseHelper.js";
import TextTableHelper from "../TextTableHelper.js";


class KeywordController extends CommandController {
    constructor() {
        super();
    }

    commands() {
        return [ 'keywords' ];
    }

    async keywordsCommand(words, message, guild)
    {
        let db = app.service('db');

        // genres
        let genres = await db('keyword').where({ genre: 1 }).orderBy('name').select();
        let genresContent = "> " + guild.t('no-genres');
        if (genres.length) {
            let table = new TextTableHelper({
                perPage: 20,
                pageContainer: '```',
                columns: [
                    { marginRight: 2 },
                    { marginRight: 2 },
                    { marginRight: 2 },
                    {}
                ],
            });

            for (let index = 0; index < genres.length; index++) {
                table.push("+" + genres[index].name);
            }

            genresContent = table.render();
            genresContent[0] = "> " + guild.t('founded-genres') + "\n" + genresContent[0];
        }

        await ResponseHelper.sendResponse(message, guild, genresContent);

        // keywords
        let keywords = await db('keyword').where({ genre: 0 }).orderBy('name').select();
        let keywordsContent = "> " + guild.t('no-keywords');
        if (keywords.length) {
            let table = new TextTableHelper({
                perPage: 10,
                pageContainer: '```',
                columns: [
                    { marginRight: 2 },
                    {}
                ],
            });

            for (let index = 0; index < keywords.length; index++) {
                table.push("-" + keywords[index].name);
            }

            keywordsContent = table.render();
            keywordsContent[0] = "> " + guild.t('founded-keywords') + "\n" + keywordsContent[0];
        }

        await ResponseHelper.sendResponse(message, guild, keywordsContent);
    }
}

export default KeywordController;