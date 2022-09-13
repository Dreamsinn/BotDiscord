import { Message } from 'discord.js';
import { LogPlaylistStatusSchema } from '../../../domain/commandSchema/logPlaylistStatusSchema';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';
import { CoolDown } from '../../utils/coolDown';
import { CheckDevRole } from '../../utils/checkDevRole';

export class LogPlaylistStatusCommand extends Command {
    private logSchema: CommandSchema = LogPlaylistStatusSchema;
    private coolDown = new CoolDown();
    private checkDevRole = new CheckDevRole();
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event: Message) {
        event.delete()
        
        //role check
        if(this.logSchema.devOnly){
            const interrupt = this.checkDevRole.call(event)
            if(!interrupt){
                return
            }
        }
        
        //comprobar coolDown
        const interrupt = this.coolDown.call(this.logSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown');
            return;
        }

        return await this.playListHandler.logPlaylistStatus();
    }
}
