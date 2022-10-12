import { Message } from 'discord.js';
import { PauseCommandSchema } from '../../../domain/commandSchema/pauseCommandSchema';
import { TogglePauseOutputEnums } from '../../../domain/enums/togglePauseOutputEnums';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';
import { CheckDevRole } from '../../utils/checkDevRole';
import { CoolDown } from '../../utils/coolDown';

export class PauseCommand extends Command {
    private pauseSchema: CommandSchema = PauseCommandSchema;
    private coolDown = new CoolDown();
    private checkDevRole = new CheckDevRole();
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event: Message) {
        //role check
        if (this.pauseSchema.devOnly) {
            const interrupt = this.checkDevRole.call(event);
            if (!interrupt) {
                return;
            }
        }

        //comprobar coolDown
        const interrupt = this.coolDown.call(this.pauseSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown');
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
