import { CommandSchema } from "../interfaces/commandSchema"

const HelpCommandSchema: CommandSchema = {
    aliases: ['help'],
    coolDown: 0,
    devOnly: false,
    description: 'Explica el uso y los alias de los comandos',
    category: 'prefix',
    name: 'help',
    usage: 'help',
    slash: {},
    contextChat: '',
    contextUser: ''
}

export {
    HelpCommandSchema
}