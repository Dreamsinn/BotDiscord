import { Message } from 'discord.js';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';

export class LogPlaylistStatusCommand extends Command {
    private logSchema: CommandSchema;
    private playListHandler: PlayListHandler;

    constructor(logSchema: CommandSchema, playListHandler: PlayListHandler) {
        super();
        this.logSchema = logSchema;
        this.playListHandler = playListHandler;
    }

    public async call(event: Message): Promise<void> {
        event.delete();

        if (this.roleAndCooldownValidation(event, this.logSchema)) {
            return;
        }

        return this.playListHandler.logPlaylistStatus();
    }
}
