import { Message } from 'discord.js';
import { JoinChannelCommandSchema } from '../../../domain/commandSchema/joinChannelCommandSchema';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';

export class JoinChannelCommand extends Command {
    private joinSchema: CommandSchema = JoinChannelCommandSchema;
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event: Message): Promise<void> {
        if (this.roleAndCooldownValidation(event, this.joinSchema)) {
            return;
        }

        return this.playListHandler.changeBotVoiceChanel(event);
    }
}
