import { Message } from 'discord.js';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';

export class LoopPlayListModeCommand extends Command {
    private loopSchema: CommandSchema;
    private playListHandler: PlayListHandler;

    constructor(loopSchema: CommandSchema, playListHandler: PlayListHandler) {
        super();
        this.loopSchema = loopSchema;
        this.playListHandler = playListHandler;
    }

    public async call(event: Message): Promise<void> {
        if (this.roleAndCooldownValidation(event, this.loopSchema)) {
            return;
        }

        const hasBeenActived = this.playListHandler.toggleLoopMode();
        if (hasBeenActived) {
            event.channel.send('Loop mode active');
            return;
        }

        event.channel.send('Loop mode deactive');
    }
}
