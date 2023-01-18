import { Message } from 'discord.js';
import { PauseCommandSchema } from '../../../domain/commandSchema/pauseCommandSchema';
import { TogglePauseOutputEnums } from '../../../domain/enums/togglePauseOutputEnums';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';

export class PauseCommand extends Command {
    private pauseSchema: CommandSchema = PauseCommandSchema;
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event: Message) {
        if (this.roleAndCooldownValidation(event, this.pauseSchema)) {
            return;
        }

        const pausedResposne = this.playListHandler.togglePauseMusic();

        if (pausedResposne === TogglePauseOutputEnums.NO_PLAYLIST) {
            return event.reply('There is no playList');
        }

        if (pausedResposne === TogglePauseOutputEnums.PAUSE) {
            return event.reply('PlayList has been paused');
        }

        return event.reply('PlayList has been unpaused');
    }
}
