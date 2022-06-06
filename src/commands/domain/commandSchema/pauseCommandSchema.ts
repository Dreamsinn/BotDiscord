import { CommandSchema } from "../interfaces/commandSchema"

const PauseCommandSchema: CommandSchema = {
    aliases: ['pause'],
    coolDown: 0,
    devOnly: false,
    description: 'pause the playlist',
    category: 'prefix',
    name: 'pause',
    usage: 'pause',
    slash: {},
    contextChat: '',
    contextUser: ''
}

export {
    PauseCommandSchema
}