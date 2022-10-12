import { Message } from 'discord.js';
import { LoopPlayListModeCommandSchema } from '../../../domain/commandSchema/loopPlayListModeCommandSchema';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';
import { CheckAdminRole } from '../../utils/CheckAdminRole';
import { CoolDown } from '../../utils/coolDown';

export class LoopPlayListModeCommand extends Command {
    private loopSchema: CommandSchema = LoopPlayListModeCommandSchema;
    private coolDown = new CoolDown();
    private checkAdminRole = new CheckAdminRole();
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event: Message): Promise<Message> {
        if (this.loopSchema.adminOnly) {
            const interrupt = this.checkAdminRole.call(event);
            if (!interrupt) {
                return;
            }
        }

        const interrupt = this.coolDown.call(this.loopSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown');
            return;
        }

        const hasBeenActived = this.playListHandler.toggleLoopMode();
        if (hasBeenActived) {
            return event.channel.send('Loop mode active');
        }

        return event.channel.send('Loop mode deactive');
    }
}
