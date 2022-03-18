import {Bot} from "./bot";
import * as dotenv from 'dotenv';
import {CommandHandler} from "./commands/commandHandler";
import {DiceCommand} from "./commands/aplication/diceCommand";

dotenv.config();

const diceCommand = new DiceCommand();

async function server () {
    // TODO crear 1 cliente por servidor (a futuro)
    console.log('start')
    const client = new Bot();
    // TDOD: cuando llames el bot que sea creado, intentar pasar todo lo de createClient al constructor (mirar async constructor)
    await client.createClient();
    console.log('client created')

    const commandHandler = new CommandHandler(diceCommand);


    client.client.on('messageCreate', async event => {
        if (event.author.bot) return false;
        // si el autor del mensaje no es el bot
        return await commandHandler.isCommand(event);
    });
}

server();
