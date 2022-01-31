import {Bot} from "./bot";
import * as dotenv from 'dotenv';
import {CommandHandler} from "./commands/commandHandler";

dotenv.config();

async function server () {
    // TODO crear 1 cliente por servidor (a futuro)
    console.log('start')
    const client = new Bot();
    await client.CreateClient();
    console.log('client created')

    const commandHandler = new CommandHandler();

    client.client.on('messageCreate', async event => {
        if (event.author.bot) return false;
        return await commandHandler.isCommand(event);
    });
}

server();
