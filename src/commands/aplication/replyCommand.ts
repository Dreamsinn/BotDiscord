import { DiscordRequestRepo } from "../domain/interfaces/discordRequestRepo";
import { ReplyCommandSchema } from "../domain/commandSchema/replyCommandSchema";
import { CommandOutput } from "../domain/interfaces/commandOutput";
import { MessageEmbed } from "discord.js";
import { CoolDown } from "./utils/coolDown";

export class ReplyCommand {
    replySchema: DiscordRequestRepo = ReplyCommandSchema;
    coolDown = new CoolDown();

    public async call(event): Promise<CommandOutput> {
        console.log('ReplyCommand executed')
        // TODO: jordi, no fer recorsivitat de if, es podria fer un filter
        // per el cooldawn una funcio, o metodo que comprobes si te en ves de un if,
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
                // construir el cuadro del mensaje
                const embed = this.embedConstructor(event, alias);

                console.log('embed builded')

                const output: CommandOutput = {
                    content: `${event.author.username} a dicho: ${event.content}!`,
                    embeds: [embed],
                }
                return event.reply(output);
            }
        })
        return
    }

    private embedConstructor(event, alias) {
        const replay = this.mapAliases(alias);
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${event.author.username} te falta calle`)
            .setDescription(`${replay}`)

        return embed
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

//TODO 13 da undefined

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