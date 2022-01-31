import {DiscordRequestRepo} from "../domain/interfaces/discordRequestRepo";
import {replyCommandSchema} from "../domain/commandSchema/replyCommandSchema";
import {CommandOutput} from "../domain/interfaces/commandOutput";
import {MessageEmbed} from "discord.js";
import {CoolDown} from "./utils/coolDown";

export class ReplyCommand {
    replySchema: DiscordRequestRepo = replyCommandSchema;
    coolDown = new CoolDown();

    public async call (event) : Promise<CommandOutput> {
        console.log('ReplyCommand executed')
        this.replySchema.aliases.forEach(alias => {
            if (event.content.startsWith(alias) || event.content.includes( ` ${alias} `)){
                if (this.replySchema.coolDown !== 0){
                    const interrupt = this.coolDown.call(this.replySchema.coolDown);
                    if(interrupt){
                        console.log('command interrupted by cooldown')
                        return
                    }
                }

                console.log('alias founded')

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
            const aliasModified = alias.slice(0, -1);
            return replyCommandOptions[aliasModified];
        }

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