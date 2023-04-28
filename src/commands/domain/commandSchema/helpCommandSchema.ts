import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const HelpCommandSchema: CommandSchema = {
    name: 'Ayuda',
    aliases: ['help', 'h'],
    coolDown: 0,
    adminOnly: false,
    description:
        'Explica el uso y los alias de los comandos. Muestra los cooldowns y si requieren admin role.\n\n' +
        '__Mientras este comando este en uso, no se podrán usar otros comandos. \nSe cerrará automáticamente tras 1min de inactividad.__',
    command: CommandsNameEnum.HelpCommand,
    category: CommandsCategoryEnum.PREFIX,
};

export { HelpCommandSchema };
