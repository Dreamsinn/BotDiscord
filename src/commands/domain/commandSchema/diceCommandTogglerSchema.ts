import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const DiceCommandTogglerSchema: CommandSchema = {
    aliases: ['dice', 'roll'],
    coolDown: 0,
    adminOnly: false,
    description:
        'Activa o desactiva el comando de dados.\n' +
        'Este comando debe ir seguido de `on` u `off`\n' +
        `Ejemplo: dice on`,
    category: CommandsCategoryEnum.PREFIX,
    name: 'Activador del comando de dados',
};

export { DiceCommandTogglerSchema };
