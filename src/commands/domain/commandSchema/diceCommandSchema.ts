const DiceCommandSchema = {
    aliases: ['D'],
    coolDown: 120,
    devOnly: false,
    description: 'cuando YDX o DX, siendo Y e X numeros, es escrito en el chat se lanzan Y dados de X caras',
    category: 'dice',
    name: 'dice',
    usage: 'D',
    slash: {},
    contextChat: '',
    contextUser: ''
}

export {
    DiceCommandSchema
}