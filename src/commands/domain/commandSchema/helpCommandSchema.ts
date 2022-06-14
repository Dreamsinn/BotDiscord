import { CommandsCategoryEnum } from '../commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const HelpCommandSchema: CommandSchema = {
    aliases: ['help', 'h'],
    coolDown: 0,
    devOnly: false,
    description:
        'Explica el uso y los alias de los comandos.\n' +
        '__Durante este proceso no se podrán usar otros comandos.__',
    category: CommandsCategoryEnum.PREFIX,
    name: 'Ayuda',
};

export { HelpCommandSchema };
