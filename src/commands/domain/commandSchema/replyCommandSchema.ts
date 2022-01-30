const replyCommandSchema = {
    aliases: ['cinco', '5', 'trece', '13', 'javi', 'ino ', 'ano '],
    cooldown: 0,
    devOnly: false,
    description: 'al escribir un alias te da una respuesta, ino y ano no habilitados',
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