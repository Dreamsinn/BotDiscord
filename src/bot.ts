import { Client, Intents } from 'discord.js';

export class Bot {
    client: Client;
    async createClient() {
        this.client = new Client({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.DIRECT_MESSAGES,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
                Intents.FLAGS.GUILD_VOICE_STATES,
            ],
        });

        this.client.once('ready', () => {
            console.log('Ready!');
        });

        await this.client.login(process.env.TOKEN);
    }
}
