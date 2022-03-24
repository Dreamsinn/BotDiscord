import {DiscordRequestRepo} from "../domain/interfaces/discordRequestRepo";
import {DiceCommandSchema} from "../domain/commandSchema/diceCommandSchema";
import {MessageEmbed} from "discord.js";
import {CommandOutput} from "../domain/interfaces/commandOutput";
import {CoolDown} from "./utils/coolDown";

export class DiceCommand {
    diceSchema: DiscordRequestRepo = DiceCommandSchema;
    coolDown = new CoolDown();

    public async call (event): Promise<CommandOutput> {
        // buscar la posicion de la D
        const D_position = event.content.search(`${this.diceSchema.aliases[0]}`);
        // si despues de la D es un numero
        if (Number(event.content.substring(D_position +1))){
            //comprobar coolDown

            const interrupt = this.coolDown.call(this.diceSchema.coolDown);
            if(interrupt === 1){
                console.log('command interrupted by cooldown')
                return
            }

            let diceNumber: number = 1;
            //mirar si antes de la D es nu numero
            if (Number(event.content.substring(0, D_position))){
                // ese numero = numero dados
                diceNumber = event.content.substring(0, D_position);
            }

            const diceFaces: number = event.content.substring(D_position +1);

            // limire de cadas y dados
            if (diceNumber > 30 || diceFaces > 10000){
                return this.rollLimitation(diceNumber, diceFaces, event);
            }

            // construir mensaje
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
        let rollString: string;
        if(diceNumber === 1) {
            rollString = ` D${diceFaces}= `;
        } else {
             rollString = `${diceNumber} D${diceFaces}= `;
        }

        let diceTotal:number;

        for (let i = 0; i <= diceNumber -1; i++){
            const roll = Math.floor(Math.random() * Number(`${diceFaces}`)) +1;
            if (i === 0){
                diceTotal = roll
                rollString = rollString + (`${roll}`);

            } else {
                diceTotal = diceTotal + roll
                rollString = rollString + (` + ${roll}`);
            }

        }

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