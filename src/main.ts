import { Message } from 'discord.js';
import * as dotenv from 'dotenv';
import { Bot } from './bot';
import { commandsSchemasList } from './commands/domain/commandSchema/schemasList';
import Database from './database/connectionHandler';
import { ServerRouting } from './serverRouting';

dotenv.config();

async function server() {
    console.log('start');

    // connection to discord
    const bot = new Bot();
    await bot.createClient();
    console.log('client created');

    const serverRouting = new ServerRouting(Database, commandsSchemasList);
    serverRouting.createServerList();

    bot.client.on('messageCreate', async (event: Message): Promise<void> => {
        if (event.author.bot) return;

        // if event is not created by a bot
        return await serverRouting.call(event);
    });
}

server();
