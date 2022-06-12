import { CommandSchema } from '../interfaces/commandSchema';

const DiceCommandTogglerSchema: CommandSchema = {
    aliases: ['dice', 'roll'],
    coolDown: 0,
    devOnly: false,
    description:
        'Activa o desactiva el comando de dados.\n' +
        'Este comando debe ir seguido de ON u OFF\n' +
        `Egemplo: \n${process.env.PREFIX}dice on`,
    category: 'prefix',
    name: 'toggleDiceCommand',
};

export { DiceCommandTogglerSchema };
