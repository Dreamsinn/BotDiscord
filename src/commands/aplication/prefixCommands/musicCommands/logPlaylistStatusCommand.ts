import { Message } from 'discord.js';
import { LogPlaylistStatusSchema } from '../../../domain/commandSchema/logPlaylistStatusSchema';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';

export class LogPlaylistStatusCommand extends Command {
    private logSchema: CommandSchema = LogPlaylistStatusSchema;
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public call(event: Message) {
        event.delete();

        if (this.roleAndCooldownValidation(event, this.logSchema)) {
            return;
        }

        return this.playListHandler.logPlaylistStatus();
    }
}
