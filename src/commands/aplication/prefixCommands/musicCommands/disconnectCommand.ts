import { DisconnectCommandSchema } from '../../../domain/commandSchema/disconnectCommandSchema';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';
import { CheckAdminRole } from '../../utils/CheckAdminRole';
import { CoolDown } from '../../utils/coolDown';

export class DisconnectCommand extends Command {
    private BotDisconnectSchema: CommandSchema = DisconnectCommandSchema;
    private coolDown = new CoolDown();
    private checkAdminRole = new CheckAdminRole();
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event) {
        if (this.BotDisconnectSchema.adminOnly) {
            const interrupt = this.checkAdminRole.call(event);
            if (!interrupt) {
                return;
            }
        }

        const interrupt = this.coolDown.call(this.BotDisconnectSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown');
            return;
        }

        return this.playListHandler.botDisconnect();
    }
}
