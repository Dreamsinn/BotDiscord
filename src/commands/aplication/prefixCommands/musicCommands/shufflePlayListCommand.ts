import { Message } from 'discord.js';
import { ShufflePlayListCommandSchema } from '../../../domain/commandSchema/shufflePlayListCommandSchema';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';
import { CheckDevRole } from '../../utils/checkDevRole';
import { CoolDown } from '../../utils/coolDown';

export class ShufflePlayListCommand extends Command {
    private shuffleSchema: CommandSchema = ShufflePlayListCommandSchema;
    private coolDown = new CoolDown();
    private checkDevRole = new CheckDevRole();
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event: Message): Promise<Message> {
        //role check
        if (this.shuffleSchema.devOnly) {
            const interrupt = this.checkDevRole.call(event);
            if (!interrupt) {
                return;
            }
        }

        //comprobar coolDown
        const interrupt = this.coolDown.call(this.shuffleSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown');
            return;
        }

        if (this.playListHandler.shufflePlayList()) {
            return event.channel.send('PlayList have been randomized');
        }

        return event.reply('There is no playList');
    }
}
