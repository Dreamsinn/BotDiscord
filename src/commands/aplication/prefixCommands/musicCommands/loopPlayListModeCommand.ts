import { Message } from 'discord.js';
import { LoopPlayListModeCommandSchema } from '../../../domain/commandSchema/loopPlayListModeCommandSchema';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';
import { CoolDown } from '../../utils/coolDown';
import { CheckDevRole } from '../../utils/checkDevRole';

export class LoopPlayListModeCommand extends Command {
    private loopSchema: CommandSchema = LoopPlayListModeCommandSchema;
    private coolDown = new CoolDown();
    private checkDevRole = new CheckDevRole();
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event: Message): Promise<Message> {
        //role check
        if(this.loopSchema.devOnly){
            const interrupt = this.checkDevRole.call(event)
            if(!interrupt){
                return
            }
        }
        
        //comprobar coolDown
        const interrupt = this.coolDown.call(this.loopSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown');
            return;
        }

        if (event.content.includes('on')) {
            const hasBeenActived = this.playListHandler.toggleLoopMode(true);
            if (hasBeenActived) {
                event.channel.send('Loop mode active');
            }
            return;
        }

        if (event.content.includes('off')) {
            const hasBeenDeactivate = this.playListHandler.toggleLoopMode(false);
            if (hasBeenDeactivate) {
                event.channel.send('Loop mode deactive');
            }
            return;
        }
        return;
    }
}
