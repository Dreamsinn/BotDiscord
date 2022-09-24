import { Message } from 'discord.js';
import * as dotenv from 'dotenv';
import { Bot } from './bot';
import { ServerRouting } from './serverRouting';

dotenv.config();

async function server() {
    // TODO crear 1 cliente por servidor (a futuro)
    console.log('start');
    const bot = new Bot();
    // TDOD: cuando llames el bot que sea creado, intentar pasar todo lo de createClient al constructor (mirar async constructor)
    await bot.createClient();
    console.log('client created');

    // const commandHandler = new CommandHandler(diceCommand, replyCommand);
    const serverRouting = new ServerRouting();

    bot.client.on('messageCreate', async (event: Message) => {
        if (event.author.bot) return false;

        // si el autor del mensaje no es el bot
        return await serverRouting.call(event);
    });
}

server();
