const PlayListCommandSchema = {
    aliases: ['playlist', 'pl'],
    coolDown: 0,
    devOnly: false,
    description: 'show up list of music requested, paginated',
    category: 'prefix',
    name: 'playList',
    usage: 'playlist',
    slash: {},
    contextChat: '',
    contextUser: ''
}

export {
    PlayListCommandSchema
}