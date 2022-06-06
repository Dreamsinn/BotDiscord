import { DiscordRequestRepo } from "../domain/interfaces/discordRequestRepo";
import { ReplyCommandSchema } from "../domain/commandSchema/replyCommandSchema";
import { CoolDown } from "./utils/coolDown";
import { MessageCreator } from "./utils/messageCreator";
import { Message } from "discord.js";

export class ReplyCommand {
    private replySchema: DiscordRequestRepo = ReplyCommandSchema;
    private coolDown = new CoolDown();

    public async call(event): Promise<Message> {
        console.log('ReplyCommand executed')
        // TODO: jordi, no fer recorsivitat de if, es podria fer un filter
        // concatenar if fa que sigui lios
        this.replySchema.aliases.forEach(alias => {
            // mirar si se encuntra el alias al principio, o ente ' '
            if (event.content.startsWith(alias) || event.content.includes(` ${alias} `)) {

                // mirar si cumple la condicion de coolDown
                const interrupt = this.coolDown.call(this.replySchema.coolDown);
                if (interrupt === 1) {
                    console.log('command interrupted by cooldown')
                    return
                }

                console.log('alias founded')

                const output = new MessageCreator({
                    message: {
                        content: `${event.author.username} a dicho: ${event.content}!`,
                    },
                    embed: {
                        color: '#0099ff',
                        title: `${event.author.username} te falta calle`,
                        description: `${this.mapAliases(alias)}`
                    }
                }).call()

                return event.reply(output);
            }
        })
        return
    }

    private mapAliases(alias) {
        console.log(alias)
        if (alias.charAt(alias.length - 1) === ' ') {
            const aliasModified = alias.slice(0, -1);
            return replyCommandOptions[aliasModified];
        }

        return replyCommandOptions[alias];
    }
}

//TODO hamburgessa no responde

export const replyCommandOptions = {
    cinco: 'POR EL CULO TE LA HINCO',
    5: 'POR EL CULO TE LA HINCO',
    trece: 'AGARRAMELA QUE ME CRECE',
    13: 'AGARRAMELA QUE ME CRECE',
    javi: 'HAMBURGESSA',
    hamburgessa: 'AMBULANCIA',
    // ino: 'PEPINO',
    // ano: 'AGARRAMELA CON LA MANO'
}