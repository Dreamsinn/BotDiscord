const JoinChannelCommandSchema = {
    aliases: ['j', 'join'],
    coolDown: 0,
    devOnly: false,
    description: 'Join the bot to the current voice channel, no needed if bot is not already in a channel',
    category: 'prefix',
    name: 'Join',
    usage: 'join',
    slash: {},
    contextChat: '',
    contextUser: ''
}

export {
    JoinChannelCommandSchema
}