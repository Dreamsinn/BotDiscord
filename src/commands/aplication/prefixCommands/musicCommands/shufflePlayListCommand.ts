import { Message } from 'discord.js';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';

export class ShufflePlayListCommand extends Command {
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event: Message, adminRole: string, shuffleSchema: CommandSchema): Promise<void> {
        if (this.roleAndCooldownValidation(event, shuffleSchema, adminRole)) {
            return;
        }

        if (this.playListHandler.shufflePlayList()) {
            event.channel.send('PlayList have been randomized');
            return;
        }

        event.reply('There is no playList');
        return;
    }
}
