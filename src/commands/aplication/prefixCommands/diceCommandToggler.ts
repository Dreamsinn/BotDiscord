import { Message } from 'discord.js';
import { DiceCommandTogglerSchema } from '../../domain/commandSchema/diceCommandTogglerSchema';
import { Command } from '../../domain/interfaces/Command';
import { CommandSchema } from '../../domain/interfaces/commandSchema';
import { DiceCommand } from '../diceCommand';

export class DiceCommandToggler extends Command {
    private toggleDiceSchema: CommandSchema = DiceCommandTogglerSchema;

    public async call(event: Message, diceCommand: DiceCommand) {
        if (this.roleAndCooldownValidation(event, this.toggleDiceSchema)) {
            return;
        }

        // si on activa la funcion de dados, si off la desactiva
        if (event.content.includes('on')) {
            const hasBeenActived = diceCommand.toggleDiceCommand(true);
            if (hasBeenActived) {
                event.channel.send('Dados activados');
            }
            return;
        }

        if (event.content.includes('off')) {
            const hasBeenDeactivate = diceCommand.toggleDiceCommand(false);
            if (hasBeenDeactivate) {
                event.channel.send('Dados desactivados');
            }
            return;
        }
        return;
    }
}
