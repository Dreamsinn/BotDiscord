import {DiscordRequestRepo} from "../domain/interfaces/discordRequestRepo";
import {replyCommandSchema} from "../domain/commandSchema/replyCommandSchema";
import {CommandOutput} from "../domain/interfaces/commandOutput";
import {MessageEmbed} from "discord.js";

export class ReplyCommand {
    schema: DiscordRequestRepo = replyCommandSchema;

    public async call (event) : Promise<any> {
        console.log('ReplyCommand se ha ejecutado')
        this.schema.aliases.forEach(alias => {
            if (event.content.startsWith(alias) || event.content.includes( ` ${alias} `)){
                console.log('se ha encontrado alias')
                const embed = this.embedConstructor(event, alias);
                console.log('embed construido')
                const output: CommandOutput = {
                    content: `${event.author.username} a dicho: ${event.content}!`,
                    embeds: [embed],
                }
                return event.reply(output);
            }
        })
        return
    }

    private embedConstructor(event, alias){
        const replay = this.mapAliases(alias);
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${event.author.username} te falta calle`)
            .setDescription(`${replay}`)

        return embed
    }

    private mapAliases(alias){
        console.log(alias)
        if (alias.charAt(alias.length -1) === ' '){
            console.log('alias con espacio', alias)
            const aliasModified = alias.slice(0, -1);
            console.log('alias modificado', aliasModified)
            return replyCommandOptions[aliasModified];
        }

        console.log('cinco', replyCommandOptions['cinco'])
        return replyCommandOptions[alias];
    }
}







export const replyCommandOptions = {
    cinco: 'POR EL CULO TE LA HINCO',
    5: 'POR EL CULO TE LA HINCO',
    trece: 'AGARRAMELA QUE ME CRECE',
    3: 'AGARRAMELA QUE ME CRECE',
    javi: 'HAMBURGESSA',
    // ino: 'PEPINO',
    // ano: 'AGARRAMELA CON LA MANO'
}