const {Client, Intents} = require("discord.js");

export class Bot {
     client: any;
     async CreateClient() {
        // Create a new client instance
         this.client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });

        // When the client is ready, run this code (only once)
        this.client.once('ready', () => {
            console.log('Ready!');
        });

        // Login to Discord with your client's token
         await this.client.login(process.env.TOKEN);
    }

}