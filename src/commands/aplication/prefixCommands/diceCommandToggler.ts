import { Message } from 'discord.js';
import { Command } from '../../domain/interfaces/Command';
import { CommandSchema } from '../../domain/interfaces/commandSchema';
import { DiceCommand } from '../diceCommand';

export class DiceCommandToggler extends Command {
    private toggleDiceSchema: CommandSchema;

    constructor(toggleDiceSchema: CommandSchema) {
        super();
        this.toggleDiceSchema = toggleDiceSchema;
    }

    public async call(event: Message, diceCommand: DiceCommand): Promise<void> {
        if (this.roleAndCooldownValidation(event, this.toggleDiceSchema)) {
            return;
        }

        // si on activa la funcion de dados, si off la desactiva
        if (event.content.includes('on')) {
            console.log({ argument: 'on' });
            const hasBeenActived = diceCommand.toggleDiceCommand(true);
            if (hasBeenActived) {
                event.channel.send('Dados activados');
            }
            return;
        }

        if (event.content.includes('off')) {
            console.log({ argument: 'off' });
            const hasBeenDeactivate = diceCommand.toggleDiceCommand(false);
            if (hasBeenDeactivate) {
                event.channel.send('Dados desactivados');
            }
            return;
        }
        return;
    }
}
