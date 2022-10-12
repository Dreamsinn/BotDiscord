import { Message } from 'discord.js';
import { LogPlaylistStatusSchema } from '../../../domain/commandSchema/logPlaylistStatusSchema';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';
import { CheckAdminRole } from '../../utils/CheckAdminRole';
import { CoolDown } from '../../utils/coolDown';

export class LogPlaylistStatusCommand extends Command {
    private logSchema: CommandSchema = LogPlaylistStatusSchema;
    private coolDown = new CoolDown();
    private checkAdminRole = new CheckAdminRole();
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event: Message) {
        event.delete();

        if (this.logSchema.adminOnly) {
            const interrupt = this.checkAdminRole.call(event);
            if (!interrupt) {
                return;
            }
        }

        const interrupt = this.coolDown.call(this.logSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown');
            return;
        }

        return await this.playListHandler.logPlaylistStatus();
    }
}
