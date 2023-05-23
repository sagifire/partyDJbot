import CommandController from "../CommandController.js";
import ResponseHelper from "../ResponseHelper.js";

class HelpController extends CommandController
{
    constructor()
    {
        super();
    }

    commands() {
        return [ 'help' ];
    }

    async helpCommand(words, message, guild)
    {
        await ResponseHelper.sendResponse(message, guild, guild.t('Help'));
    }

}

export default HelpController;