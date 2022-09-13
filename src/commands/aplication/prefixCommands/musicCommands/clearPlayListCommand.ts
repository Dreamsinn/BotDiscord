import { ClearPlayListCommandSchema } from '../../../domain/commandSchema/clearPlayListCommandSchema';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';
import { CoolDown } from '../../utils/coolDown';
import { CheckDevRole } from '../../utils/checkDevRole';

export class ClearPlayListCommand extends Command {
    private clearSchema: CommandSchema = ClearPlayListCommandSchema;
    private coolDown = new CoolDown();
    private checkDevRole = new CheckDevRole();
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event) {
        //role check
        if(this.clearSchema.devOnly){
            const interrupt = this.checkDevRole.call(event)
            if(!interrupt){
                return
            }
        }
        
        //comprobar coolDown
        const interrupt = this.coolDown.call(this.clearSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown');
            return;
        }

        return this.playListHandler.deletePlayList();
    }
}
