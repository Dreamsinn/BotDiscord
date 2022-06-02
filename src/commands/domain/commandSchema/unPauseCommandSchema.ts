const UnpauseCommandSchema = {
    aliases: ['unpause'],
    coolDown: 0,
    devOnly: false,
    description: 'unpause the playlist, if it is paused',
    category: 'prefix',
    name: 'unpause',
    usage: 'unpause',
    slash: {},
    contextChat: '',
    contextUser: ''
}

export {
    UnpauseCommandSchema
}