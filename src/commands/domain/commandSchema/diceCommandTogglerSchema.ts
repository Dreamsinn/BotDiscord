import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const DiceCommandTogglerSchema: CommandSchema = {
    name: 'schemas.diceToggler.name',
    // 'Activador del comando de dados'
    aliases: ['dice', 'roll'],
    coolDown: 0,
    adminOnly: false,
    description: 'schemas.diceToggler.description',
    // 'Activa o desactiva el comando de dados.\n' +
    // 'Este comando debe ir seguido de `on` u `off` \n' +
    // `Ejemplo: dice on`,
    command: CommandsNameEnum.DiceCommandToggler,
    category: CommandsCategoryEnum.PREFIX,
};

export { DiceCommandTogglerSchema };
