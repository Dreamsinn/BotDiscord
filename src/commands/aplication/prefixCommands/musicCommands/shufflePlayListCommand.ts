import { Message } from 'discord.js';
import { ShufflePlayListCommandSchema } from '../../../domain/commandSchema/shufflePlayListCommandSchema';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';

export class ShufflePlayListCommand extends Command {
    private shuffleSchema: CommandSchema = ShufflePlayListCommandSchema;
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
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
