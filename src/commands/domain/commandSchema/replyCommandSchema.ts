const ReplyCommandSchema = {
    aliases: ['cinco', '5', 'trece', '13', 'javi', 'ino ', 'ano '],
    coolDown: 0,
    devOnly: false,
    description: 'ofrece una respuesta cuando uno de los alias es escrito en el chat',
    category: 'test',
    name: 'reply',
    usage: 'cinco',
    slash: {},
    contextChat: '',
    contextUser: ''
}

export {
    ReplyCommandSchema
}