import { ClearPlayListCommandSchema } from '../../../domain/commandSchema/clearPlayListCommandSchema';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';
import { CheckAdminRole } from '../../utils/CheckAdminRole';
import { CoolDown } from '../../utils/coolDown';

export class ClearPlayListCommand extends Command {
    private clearSchema: CommandSchema = ClearPlayListCommandSchema;
    private coolDown = new CoolDown();
    private checkAdminRole = new CheckAdminRole();
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event) {
        if (this.clearSchema.adminOnly) {
            const interrupt = this.checkAdminRole.call(event);
            if (!interrupt) {
                return;
            }
        }

        const interrupt = this.coolDown.call(this.clearSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown');
            return;
        }

        const deleteResponse = await this.playListHandler.deletePlayList();

        if (!deleteResponse) {
            return event.reply('There is no playList');
        }
        return event.reply('Playlist has been cleared');
    }
}
