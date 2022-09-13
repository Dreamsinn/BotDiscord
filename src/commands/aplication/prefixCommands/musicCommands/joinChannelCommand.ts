import { Message } from 'discord.js';
import { JoinChannelCommandSchema } from '../../../domain/commandSchema/joinChannelCommandSchema';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';
import { CheckDevRole } from '../../utils/checkDevRole';
import { CoolDown } from '../../utils/coolDown';

export class JoinChannelCommand extends Command {
    private joinSchema: CommandSchema = JoinChannelCommandSchema;
    private coolDown = new CoolDown();
    private checkDevRole = new CheckDevRole();
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event: Message) {
        //role check
        if (this.joinSchema.devOnly) {
            const interrupt = this.checkDevRole.call(event);
            if (!interrupt) {
                return;
            }
        }

        //comprobar coolDown
        const interrupt = this.coolDown.call(this.joinSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown');
            return;
        }

        return this.playListHandler.changeBotVoiceChanel(event);
    }
}
