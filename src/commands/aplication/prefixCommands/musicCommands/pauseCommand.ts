import { Message } from 'discord.js';
import { TogglePauseOutputEnums } from '../../../domain/enums/togglePauseOutputEnums';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';

export class PauseCommand extends Command {
    private pauseSchema: CommandSchema;
    private playListHandler: PlayListHandler;

    constructor(pauseSchema: CommandSchema, playListHandler: PlayListHandler) {
        super();
        this.pauseSchema = pauseSchema;
        this.playListHandler = playListHandler;
    }

    public async call(event: Message, adminRole: string): Promise<void> {
        if (this.roleAndCooldownValidation(event, this.pauseSchema, adminRole)) {
            return;
        }

        const pausedResposne = this.playListHandler.togglePauseMusic();

        if (pausedResposne === TogglePauseOutputEnums.NO_PLAYLIST) {
            event.reply('There is no playList');
            return;
        }

        if (pausedResposne === TogglePauseOutputEnums.PAUSE) {
            event.reply('PlayList has been paused');
            return;
        }

        event.reply('PlayList has been unpaused');
        return;
    }
}
