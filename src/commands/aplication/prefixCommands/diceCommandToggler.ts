import { Message } from 'discord.js';
import { DiceCommandTogglerSchema } from '../../domain/commandSchema/diceCommandTogglerSchema';
import { Command } from '../../domain/interfaces/Command';
import { CommandSchema } from '../../domain/interfaces/commandSchema';
import { DiceCommand } from '../diceCommand';
import { CheckAdminRole } from '../utils/CheckAdminRole';
import { CoolDown } from '../utils/coolDown';

export class DiceCommandToggler extends Command {
    private toggleDiceSchema: CommandSchema = DiceCommandTogglerSchema;
    private coolDown = new CoolDown();
    private checkAdminRole = new CheckAdminRole();
    private diceCommand: DiceCommand;

    public async call(event: Message, diceCommand): Promise<Message> {
        if (this.toggleDiceSchema.adminOnly) {
            const interrupt = this.checkAdminRole.call(event);
            if (!interrupt) {
                return;
            }
        }

        this.diceCommand = diceCommand;

        const interrupt = this.coolDown.call(this.toggleDiceSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown');
            return;
        }

        if (event.content.includes('on')) {
            const hasBeenActived = this.diceCommand.toggleDiceCommand(true);
            if (hasBeenActived) {
                event.channel.send('Dados activados');
            }
            return;
        }

        if (event.content.includes('off')) {
            const hasBeenDeactivate = this.diceCommand.toggleDiceCommand(false);
            if (hasBeenDeactivate) {
                event.channel.send('Dados desactivados');
            }
            return;
        }
        return;
    }
}
