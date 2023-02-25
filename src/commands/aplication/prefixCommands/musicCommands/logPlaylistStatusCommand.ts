import { Message } from 'discord.js';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';

export class LogPlaylistStatusCommand extends Command {
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event: Message, adminRole: string, logSchema: CommandSchema): Promise<void> {
        event.delete();

        if (this.roleAndCooldownValidation(event, logSchema, adminRole)) {
            return;
        }

        return this.playListHandler.logPlaylistStatus();
    }
}
