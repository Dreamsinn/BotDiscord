import { Message } from 'discord.js';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';

export class ClearPlayListCommand extends Command {
    private clearSchema: CommandSchema;
    private playListHandler: PlayListHandler;

    constructor(clearSchema: CommandSchema, playListHandler: PlayListHandler) {
        super();
        this.clearSchema = clearSchema;
        this.playListHandler = playListHandler;
    }

    public async call(event: Message): Promise<void> {
        if (this.roleAndCooldownValidation(event, this.clearSchema)) {
            return;
        }

        const deleteResponse = this.playListHandler.deletePlayList();
        if (!deleteResponse) {
            event.reply('There is no playList');
            return;
        }
        event.reply('Playlist has been cleared');
    }
}
