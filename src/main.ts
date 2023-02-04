import { Message } from 'discord.js';
import * as dotenv from 'dotenv';
import { Bot } from './bot';
import AppDataSource from './database/dataSource';
import { ServerRouting } from './serverRouting';

dotenv.config();

async function server() {
    console.log('start');

    // connection to discord
    const bot = new Bot();
    await bot.createClient();
    console.log('client created');

    // database connection
    await AppDataSource.CreateDataSource();

    const serverRouting = new ServerRouting();

    bot.client.on('messageCreate', async (event: Message): Promise<void> => {
        if (event.author.bot) return;

        // si el autor del mensaje no es el bot
        return await serverRouting.call(event);
    });
}

server();
