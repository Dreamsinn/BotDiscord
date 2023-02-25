import { Message } from 'discord.js';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';

export class ClearPlayListCommand extends Command {
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event: Message, adminRole: string, clearSchema: CommandSchema): Promise<void> {
        if (this.roleAndCooldownValidation(event, clearSchema, adminRole)) {
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
