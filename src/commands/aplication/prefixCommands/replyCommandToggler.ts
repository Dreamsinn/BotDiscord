import { Message } from 'discord.js';
import { Command } from '../../domain/interfaces/Command';
import { CommandSchema } from '../../domain/interfaces/commandSchema';
import { ReplyCommand } from '../replyCommand';

export class ReplyCommandToggler extends Command {
    private toggleDiceSchema: CommandSchema;

    constructor(toggleDiceSchema: CommandSchema) {
        super();
        this.toggleDiceSchema = toggleDiceSchema;
    }

    public async call(
        event: Message,
        adminRole: string,
        props: { replyCommand: ReplyCommand },
    ): Promise<void> {
        if (this.roleAndCooldownValidation(event, this.toggleDiceSchema, adminRole)) {
            return;
        }

        // si on activa la respuestas de dados, si off la desactiva
        if (event.content.includes('on')) {
            console.log({ argument: 'on' });
            const hasBeenActived = props.replyCommand.toggleReplyCommand(true);
            if (hasBeenActived) {
                event.channel.send('Respuestas activados');
            }
            return;
        }

        if (event.content.includes('off')) {
            console.log({ argument: 'off' });
            const hasBeenDeactivate = props.replyCommand.toggleReplyCommand(false);
            if (hasBeenDeactivate) {
                event.channel.send('Respuestas desactivados');
            }
            return;
        }
        return;
    }
}
