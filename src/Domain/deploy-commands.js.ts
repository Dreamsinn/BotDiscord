const { SlashCommandBuilder } = require('@discordjs/builders');


// SlashComandBuilder -> te evita tener que crear los comandos de cero
const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
    new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
    new SlashCommandBuilder().setName('user').setDescription('Replies with user info!'),
]
    .map(command => command.toJSON());

export{
    commands
}
