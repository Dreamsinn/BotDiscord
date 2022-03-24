const HelpCommandSchema = {
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