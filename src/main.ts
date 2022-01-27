import {Bot} from "./bot";
import * as dotenv from 'dotenv';
import {REST} from "@discordjs/rest";
import {Routes} from "discord-api-types/v9";
import {commands} from "./Domain/deploy-commands.js";
dotenv.config();

async function server () {
    // TODO crear 1 cliente por servidor (a futuro)
    console.log('algo')
    const client: any = await Bot.CreateClient();
    console.log('client created')

    // TODO dejarlo en una classe a parte
    // registra los comandos para su uso, solo necesita ejecutarse una vez
    const rest = new REST({ version: '9' }).setToken(process.env.token);
    rest.put(Routes.applicationGuildCommands(process.env.clientId, process.env.guildId), { body: commands })
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error);

    // TODO dejarlo en una classe a parte
    client.once('ready', () => {
        console.log('Ready!');
    });
    // interactionCreate -> Emitted when an interaction is created.
    client.on('interactionCreate', async interaction => {
        // .isCommand() -> comprueba  que es un comando
        // ..commandName -> The invoked application command's name
        if (!interaction.isCommand()) return;

        const { commandName } = interaction;

        if (commandName === 'ping') {
            await interaction.reply('Pong!');
        } else if (commandName === 'server') {
            await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
        } else if (commandName === 'user') {
            await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
        }
    });
}


server();


