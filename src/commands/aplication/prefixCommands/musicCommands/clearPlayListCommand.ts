import { Message } from 'discord.js';
import { ClearPlayListCommandSchema } from '../../../domain/commandSchema/clearPlayListCommandSchema';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';

export class ClearPlayListCommand extends Command {
    private clearSchema: CommandSchema = ClearPlayListCommandSchema;
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public call(event) {
        if (this.roleAndCooldownValidation(event, this.clearSchema)) {
            return;
        }

        const deleteResponse = this.playListHandler.deletePlayList();

        if (!deleteResponse) {
            return event.reply('There is no playList');
        }
        return event.reply('Playlist has been cleared');
    }
}
