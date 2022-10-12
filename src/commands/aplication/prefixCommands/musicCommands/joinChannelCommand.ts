import { Message } from 'discord.js';
import { JoinChannelCommandSchema } from '../../../domain/commandSchema/joinChannelCommandSchema';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';
import { CheckAdminRole } from '../../utils/CheckAdminRole';
import { CoolDown } from '../../utils/coolDown';

export class JoinChannelCommand extends Command {
    private joinSchema: CommandSchema = JoinChannelCommandSchema;
    private coolDown = new CoolDown();
    private checkAdminRole = new CheckAdminRole();
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event: Message) {
        if (this.joinSchema.adminOnly) {
            const interrupt = this.checkAdminRole.call(event);
            if (!interrupt) {
                return;
            }
        }

        const interrupt = this.coolDown.call(this.joinSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown');
            return;
        }

        return this.playListHandler.changeBotVoiceChanel(event);
    }
}
