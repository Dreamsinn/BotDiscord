import { Message } from 'discord.js';
import { ReplyCommandTogglerSchema } from '../../domain/commandSchema/replyCommandTogglerSchema';
import { Command } from '../../domain/interfaces/Command';
import { CommandSchema } from '../../domain/interfaces/commandSchema';
import { ReplyCommand } from '../replyCommand';

export class ReplyCommandToggler extends Command {
    private toggleDiceSchema: CommandSchema = ReplyCommandTogglerSchema;

    public async call(event: Message, replyCommand: ReplyCommand) {
        if (this.roleAndCooldownValidation(event, this.toggleDiceSchema)) {
            return;
        }

        // si on activa la respuestas de dados, si off la desactiva
        if (event.content.includes('on')) {
            const hasBeenActived = replyCommand.toggleReplyCommand(true);
            if (hasBeenActived) {
                event.channel.send('Respuestas activados');
            }
            return;
        }

        if (event.content.includes('off')) {
            const hasBeenDeactivate = replyCommand.toggleReplyCommand(false);
            if (hasBeenDeactivate) {
                event.channel.send('Respuestas desactivados');
            }
            return;
        }
        return;
    }
}
