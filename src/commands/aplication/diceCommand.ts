import {DiscordRequestRepo} from "../domain/interfaces/discordRequestRepo";
import {DiceCommandSchema} from "../domain/commandSchema/diceCommandSchema";
import {MessageEmbed} from "discord.js";
import {CommandOutput} from "../domain/interfaces/commandOutput";

export class DiceCommand {
    diceSchema: DiscordRequestRepo = DiceCommandSchema;

    public async call (event){
        const D_position = event.content.search(`${this.diceSchema.aliases[0]}`);
        if (Number(event.content.substring(D_position +1))){
            let diceNumber: number = 1;
            if (Number(event.content.substring(0, D_position))){
                diceNumber = event.content.substring(0, D_position);
            }

            const diceFaces: number = event.content.substring(D_position +1);

            if (diceNumber >= 30 || diceFaces >= 10000){
                return this.rollLimitation(diceNumber, diceFaces, event);
            }

            const embed = this.mapRollString(diceNumber, diceFaces);

            const output: CommandOutput = {
                content: `${event.author.username} a lanzado: ${diceNumber} dados de ${diceFaces} caras`,
                embeds: [embed],
            }
            return event.reply(output);
        }
        return
    }

    private mapRollString (diceNumber, diceFaces) {
        let rollString = `${diceNumber} D${diceFaces}= `;

        let diceTotal:number;

        console.log('diceNumber', diceNumber)
        for (let i = 0; i <= diceNumber -1; i++){
            const roll = Math.floor(Math.random() * Number(`${diceFaces}`)) +1;
            if (i === 0){
                console.log('se ejecuta una vez')
                diceTotal = roll
                rollString = rollString + (`${roll}`);

            } else {
                console.log(`se executa ${i} veces`)
                diceTotal = diceTotal + roll
                rollString = rollString + (` + ${roll}`);
            }

        }

        console.log('rollString', rollString)

        return this.embedConstructor(diceTotal, rollString);
    }

    private embedConstructor(diceTotal, rollString){
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${rollString}`)
            .setDescription(`${diceTotal}`)

        return embed;
    }

    private rollLimitation (diceNumber, diceFaces, event){
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`Tirada no permitida`)
            .setDescription(`Como maximo se puede lanzar 30 dados de 10000 caras`)

        const output: CommandOutput = {
            content: `${event.author.username} a lanzado: ${diceNumber} dados de ${diceFaces} caras`,
            embeds: [embed],
        }
        return event.reply(output);
    }
}