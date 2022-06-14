import { DisconnectCommandSchema } from '../../../domain/commandSchema/disconnectCommandSchema';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';
import { CoolDown } from '../../utils/coolDown';

export class DisconnectCommand extends Command {
    private BotDisconnectSchema: CommandSchema = DisconnectCommandSchema;
    private coolDown = new CoolDown();
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call() {
        //comprobar coolDown
        const interrupt = this.coolDown.call(this.BotDisconnectSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown');
            return;
        }

        return this.playListHandler.botDisconnect();
    }
}
