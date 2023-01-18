import { Message } from 'discord.js';
import { LoopPlayListModeCommandSchema } from '../../../domain/commandSchema/loopPlayListModeCommandSchema';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';

export class LoopPlayListModeCommand extends Command {
    private loopSchema: CommandSchema = LoopPlayListModeCommandSchema;
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event: Message): Promise<Message> {
        if (this.roleAndCooldownValidation(event, this.loopSchema)) {
            return;
        }

        const hasBeenActived = this.playListHandler.toggleLoopMode();
        if (hasBeenActived) {
            return event.channel.send('Loop mode active');
        }

        return event.channel.send('Loop mode deactive');
    }
}
