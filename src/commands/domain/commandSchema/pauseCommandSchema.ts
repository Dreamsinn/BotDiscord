import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const PauseCommandSchema: CommandSchema = {
    aliases: ['pause'],
    coolDown: 0,
    devOnly: false,
    description:
        'Pausa la cancion que este sonando, para renudarla habra que usar el comando de Renudar o el de conectar el bot a un canal de voz.',
    category: CommandsCategoryEnum.MUSIC,
    name: 'Pausar canción',
};

export { PauseCommandSchema };
