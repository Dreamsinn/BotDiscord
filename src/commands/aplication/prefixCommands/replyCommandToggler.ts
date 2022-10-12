import { Message } from 'discord.js';
import { ReplyCommandTogglerSchema } from '../../domain/commandSchema/replyCommandTogglerSchema';
import { Command } from '../../domain/interfaces/Command';
import { CommandSchema } from '../../domain/interfaces/commandSchema';
import { ReplyCommand } from '../replyCommand';
import { CheckAdminRole } from '../utils/CheckAdminRole';
import { CoolDown } from '../utils/coolDown';

export class ReplyCommandToggler extends Command {
    private toggleDiceSchema: CommandSchema = ReplyCommandTogglerSchema;
    private coolDown = new CoolDown();
    private checkAdminRole = new CheckAdminRole();
    private replyCommand: ReplyCommand;

    public async call(event: Message, replyCommand): Promise<Message> {
        if (this.toggleDiceSchema.adminOnly) {
            const interrupt = this.checkAdminRole.call(event);
            if (!interrupt) {
                return;
            }
        }

        this.replyCommand = replyCommand;

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
