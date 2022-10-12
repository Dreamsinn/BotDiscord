import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const HelpCommandSchema: CommandSchema = {
    aliases: ['help', 'h'],
    coolDown: 0,
    adminOnly: false,
    description:
        'Explica el uso y los alias de los comandos.\n' +
        '__Durante este proceso no se podrán usar otros comandos.__',
    category: CommandsCategoryEnum.PREFIX,
    name: 'Ayuda',
};

export { HelpCommandSchema };
