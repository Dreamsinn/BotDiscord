const DiceCommandSchema = {
    aliases: ['D'],
    coolDown: 120,
    devOnly: false,
    description: 'when YDX or DX, being Y and X a numbers, is written in discord chat it roles Y dice of X faces',
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