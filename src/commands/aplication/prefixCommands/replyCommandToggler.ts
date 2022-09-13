import { Message } from 'discord.js';
import { ReplyCommandTogglerSchema } from '../../domain/commandSchema/replyCommandTogglerSchema';
import { Command } from '../../domain/interfaces/Command';
import { CommandSchema } from '../../domain/interfaces/commandSchema';
import { ReplyCommand } from '../replyCommand';
import { CheckDevRole } from '../utils/checkDevRole';
import { CoolDown } from '../utils/coolDown';

export class ReplyCommandToggler extends Command {
    private toggleDiceSchema: CommandSchema = ReplyCommandTogglerSchema;
    private coolDown = new CoolDown();
    private checkDevRole = new CheckDevRole();
    private replyCommand = ReplyCommand;

    public async call(event: Message): Promise<Message> {
        //role check
        if (this.toggleDiceSchema.devOnly) {
            const interrupt = this.checkDevRole.call(event);
            if (!interrupt) {
                return;
            }
        }

        // si on activa la respuestas de dados, si off la desactiva
        const interrupt = this.coolDown.call(this.toggleDiceSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown');
            return;
        }

        if (event.content.includes('on')) {
            const hasBeenActived = this.replyCommand.toggleReplyCommand(true);
            if (hasBeenActived) {
                event.channel.send('Respuestas activados');
            }
            return;
        }

        if (event.content.includes('off')) {
            const hasBeenDeactivate = this.replyCommand.toggleReplyCommand(false);
            if (hasBeenDeactivate) {
                event.channel.send('Respuestas desactivados');
            }
            return;
        }
        return;
    }
}
