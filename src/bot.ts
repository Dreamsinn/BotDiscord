import { Client, Intents } from 'discord.js';

export class Bot {
  client: Client;
  async createClient() {
    // Create a new client instance
    // intents -> BOTS PERMISSIONS IN SERVER
    this.client = new Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_PRESENCES,
      ],
    });

    // When the client is ready, run this code (only once)
    this.client.once('ready', () => {
      console.log('Discord conection ready!');
    });

    // this.client.on("debug", (status: any) => {
    //     console.log('\x1B[34m' + status + '\x1b[37m')
    // })

    // Login to Discord with your client's token
    await this.client.login(process.env.TOKEN);
    // .catch((error) => console.log({ error }));
  }
}
