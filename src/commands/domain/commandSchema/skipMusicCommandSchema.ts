import { CommandSchema } from "../interfaces/commandSchema"

const SkipMusicCommandSchema: CommandSchema = {
    aliases: ['skip', 's'],
    coolDown: 0,
    devOnly: false,
    description: 'skip current song',
    category: 'prefix',
    name: 'skip',
    usage: 's',
    slash: {},
    contextChat: '',
    contextUser: ''
}

export {
    SkipMusicCommandSchema
}