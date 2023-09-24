import { Message } from 'discord.js';
import { Command, CommandProps } from '../../domain/interfaces/Command';
import { CommandSchema } from '../../domain/interfaces/commandSchema';

export class DiceCommandToggler extends Command {
    public async call(
        event: Message,
        adminRole: string,
        toggleDiceSchema: CommandSchema,
        { diceCommand }: CommandProps,
    ): Promise<void> {
        if (this.roleAndCooldownValidation(event, toggleDiceSchema, adminRole)) {
            return;
        }

        // si on activa la funcion de dados, si off la desactiva
        if (event.content.includes('on')) {
            console.log({ argument: 'on' });
            const hasBeenActived = diceCommand!.toggleDiceCommand(true);
            if (hasBeenActived) {
                event.channel.send('Dados activados');
            }
            return;
        }

        if (event.content.includes('off')) {
            console.log({ argument: 'off' });
            const hasBeenDeactivate = diceCommand!.toggleDiceCommand(false);
            if (hasBeenDeactivate) {
                event.channel.send('Dados desactivados');
            }
            return;
        }
        return;
    }
}
