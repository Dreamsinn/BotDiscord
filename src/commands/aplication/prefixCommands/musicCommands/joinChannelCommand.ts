import { Message } from 'discord.js';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';

export class JoinChannelCommand extends Command {
    private joinSchema: CommandSchema;
    private playListHandler: PlayListHandler;

    constructor(joinSchema: CommandSchema, playListHandler: PlayListHandler) {
        super();
        this.joinSchema = joinSchema;
        this.playListHandler = playListHandler;
    }

    public async call(event: Message, adminRole: string): Promise<void> {
        if (this.roleAndCooldownValidation(event, this.joinSchema, adminRole)) {
            return;
        }

        return this.playListHandler.changeBotVoiceChanel(event);
    }
}
