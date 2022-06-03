const ClearPlayListCommandSchema = {
    aliases: ['c', 'clear'],
    coolDown: 0,
    devOnly: false,
    description: `remove all songs from playList`,
    category: 'prefix',
    name: 'Clear Playlist',
    usage: 'clear',
    slash: {},
    contextChat: '',
    contextUser: ''
}

export {
    ClearPlayListCommandSchema
}