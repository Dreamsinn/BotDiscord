import { Message } from 'discord.js';
import { LoopPlayListModeCommandSchema } from '../../../domain/commandSchema/loopPlayListModeCommandSchema';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';
import { CoolDown } from '../../utils/coolDown';

export class LoopPlayListModeCommand extends Command {
    private loopSchema: CommandSchema = LoopPlayListModeCommandSchema;
    private coolDown = new CoolDown();
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event: Message): Promise<Message> {
        //comprobar coolDown
        const interrupt = this.coolDown.call(this.loopSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown');
            return;
        }

        if (event.content.includes('on')) {
            const haveBeenActived = this.playListHandler.toggleLoopMode(true);
            if (haveBeenActived) {
                event.channel.send('Loop mode active');
            }
            return;
        }

        if (event.content.includes('off')) {
            const haveBeenDeactivate = this.playListHandler.toggleLoopMode(false);
            if (haveBeenDeactivate) {
                event.channel.send('Loop mode deactive');
            }
            return;
        }
        return;
    }
}
