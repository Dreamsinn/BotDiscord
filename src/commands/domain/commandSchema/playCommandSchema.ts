const PlayCommandSchema = {
    aliases: ['p'],
    coolDown: 0,
    devOnly: false,
    description: 'when run select the rest of the string and search it in youtube',
    category: 'prefix',
    name: 'play',
    usage: 'p',
    slash: {},
    contextChat: '',
    contextUser: ''
}

export {
    PlayCommandSchema
}