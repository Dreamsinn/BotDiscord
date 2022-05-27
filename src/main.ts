import { Bot } from "./bot";
import * as dotenv from 'dotenv';
import { CommandHandler } from "./commands/commandHandler";
import { DiceCommand } from "./commands/aplication/diceCommand";
import { ReplyCommand } from "./commands/aplication/replyCommand";

dotenv.config();

const diceCommand = new DiceCommand();
const replyCommand = new ReplyCommand();

async function server() {
    // TODO crear 1 cliente por servidor (a futuro)
    console.log('start')
    const client = new Bot();
    // TDOD: cuando llames el bot que sea creado, intentar pasar todo lo de createClient al constructor (mirar async constructor)
    await client.createClient();
    console.log('client created')

    const commandHandler = new CommandHandler(diceCommand, replyCommand);


    client.client.on('messageCreate', async event => {
        if (event.author.bot) return false;
        // si el autor del mensaje no es el bot
        return await commandHandler.isCommand(event);
    });

    // client.client.on('messageReactionAdd', event => {
    //     if(event.message.author.username === process.env.BOT_NAME){
    //         console.log(event.message.embeds)
    //     }
    // });
}

server();
