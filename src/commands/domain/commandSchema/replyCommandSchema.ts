const replyCommandSchema = {
    aliases: ['cinco', '5', 'trece', '13', 'javi', 'ino ', 'ano '],
    cooldown: 0,
    devOnly: false,
    description: 'when a alias is written in discord chat it makes a reply',
    category: 'test',
    name: 'reply',
    usage: 'cinco',
    slash: {},
    contextChat: '',
    contextUser: ''
}

export {
    replyCommandSchema
}