// Require the necessary discord.js classes
import {Bot} from "./bot";
import * as dotenv from 'dotenv';
dotenv.config();


async function server () {
    console.log('algo')
    await Bot.CreateClient();
    console.log('client created')
}


server();


