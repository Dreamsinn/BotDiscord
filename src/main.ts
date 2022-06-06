import { Bot } from "./bot";
import * as dotenv from 'dotenv';
import { CommandHandler } from "./commands/commandHandler";
import { DiceCommand } from "./commands/aplication/diceCommand";
import { ReplyCommand } from "./commands/aplication/replyCommand";
import { UsersUsingACommand } from "./commands/aplication/utils/usersUsingACommand"
import { Message } from "discord.js";

dotenv.config();

const diceCommand = new DiceCommand();
const replyCommand = new ReplyCommand();
const usersUsingACommand = UsersUsingACommand.usersUsingACommand;

async function server() {
    // TODO crear 1 cliente por servidor (a futuro)
    console.log('start')
    const bot = new Bot();
    // TDOD: cuando llames el bot que sea creado, intentar pasar todo lo de createClient al constructor (mirar async constructor)
    await bot.createClient();
    console.log('client created')

    const commandHandler = new CommandHandler(diceCommand, replyCommand);

    bot.client.on('messageCreate', async (event: Message) => {
        if (event.author.bot) return false;
        if (usersUsingACommand.searchIdInUserList(event.author.id)) return false;
        // si el autor del mensaje no es el bot
        return await commandHandler.isCommand(event);
    });
}

server();

