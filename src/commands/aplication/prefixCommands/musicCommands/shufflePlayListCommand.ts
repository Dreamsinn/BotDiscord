import { Message } from 'discord.js';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';

export class ShufflePlayListCommand extends Command {
    private shuffleSchema: CommandSchema;
    private playListHandler: PlayListHandler;

    constructor(shuffleSchema: CommandSchema, playListHandler: PlayListHandler) {
        super();
        this.shuffleSchema = shuffleSchema;
        this.playListHandler = playListHandler;
    }

    public async call(event: Message): Promise<void> {
        if (this.roleAndCooldownValidation(event, this.shuffleSchema)) {
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
