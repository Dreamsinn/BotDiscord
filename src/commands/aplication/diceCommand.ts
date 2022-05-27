import { DiscordRequestRepo } from "../domain/interfaces/discordRequestRepo";
import { DiceCommandSchema } from "../domain/commandSchema/diceCommandSchema";
import { MessageEmbed } from "discord.js";
import { CommandOutput } from "../domain/interfaces/commandOutput";
import { CoolDown } from "./utils/coolDown";

export class DiceCommand {
    diceSchema: DiscordRequestRepo = DiceCommandSchema;
    coolDown = new CoolDown();

    public async call(event): Promise<CommandOutput> {
        // buscar la posicion de la D, y la de la , (-1 si no hay)
        const { D_position, comma_position } = this.searchDandCommaPosition(event.content);

        // valida que la tirada sea correcta
        if (this.checkValidRoll(event.content, D_position, comma_position)) {
            return;
        }

        //comprobar coolDown
        const interrupt = this.coolDown.call(this.diceSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown')
            return;
        }

        const embed = this.rolDices(event.content, D_position, comma_position, event);

        const output: CommandOutput = {
            // content: `${event.author.username} a lanzado: ${diceNumber} dados de ${diceFaces} caras`,
            embeds: [embed],
        }

        return event.reply(output);

    }

    private searchDandCommaPosition(message) {
        const D_position = message.search(this.diceSchema.aliases[0]);
        const comma_position = message.search(this.diceSchema.usage);

        return { D_position, comma_position }
    }

    private checkValidRoll(message: string, D_position: number, comma_position: number) {
        // que comience por D o numero
        if (!Number(message.charAt(0)) && message.charAt(0) != 'D') {
            return true;
        }

        // si incluye una , comprobar si antes de la coma hay un numero, repite el metodo para ver si el siguiente esta bien
        if (comma_position != -1) {
            if (!Number(message.substring(D_position + 1, comma_position))) {
                return true
            }
            const modifiedMessage = message.substring(comma_position + 2);
            const newPossition = this.searchDandCommaPosition(modifiedMessage);
            return this.checkValidRoll(modifiedMessage, newPossition.D_position, newPossition.comma_position);
        }

        // despues de la D sea un numero
        if (!Number(message.substring(D_position + 1))) {
            return true;
        }
        return false;
    }

    private rolDices(message: string, D_position: number, comma_position: number, event) {
        let diceNumberArray: number[] = [];
        let diceFacesArray: number[] = [];

        let modifiedMessage = message;
        let dice: string;

        if (comma_position === -1) {
            // sino hay ,
            const { diceNumber, diceFaces } = this.numberOfDicesAndDicesFaces(message, D_position);
            diceNumberArray.push(diceNumber)
            diceFacesArray.push(diceFaces)
        } else {
            // si hay ,
            const rols = this.rolMultipleDices(message)
            diceNumberArray = rols.diceNumberArray
            diceFacesArray = rols.diceFacesArray
        }

        // comprobar que no se supera el limite de caras y tiradas
        this.rollLimitation(diceNumberArray, diceFacesArray, event)

        // tirar los dados
        return this.mapRollString(diceNumberArray, diceFacesArray)
    }

    private numberOfDicesAndDicesFaces(message, D_position) {
        let diceNumber: number = 1;
        //mirar si antes de la D es un numero
        if (Number(message.substring(0, D_position))) {
            // ese numero = numero dados
            diceNumber = Number(message.substring(0, D_position));
        }

        const diceFaces: number = message.substring(D_position + 1);

        return { diceNumber, diceFaces }
    }

    private rolMultipleDices(message: string) {
        // numero de comas
        const numberOfCommas = message.split(this.diceSchema.usage).length - 1;
        let modifiedMessage = message;
        let dice: string;
        const diceNumberArray: number[] = [];
        const diceFacesArray: number[] = [];
        for (let i = 0; i <= numberOfCommas; i++) {
            if (i != numberOfCommas) {
                const { D_position, comma_position } = this.searchDandCommaPosition(modifiedMessage);
                // dado = lo que haya antes de la coma
                dice = modifiedMessage.substring(0, comma_position);
                // nuevo mensage = todo lo que haya despues de la coma
                modifiedMessage = modifiedMessage.substring(comma_position + 1);
                const { diceNumber, diceFaces } = this.numberOfDicesAndDicesFaces(dice, D_position);
                diceNumberArray.push(diceNumber)
                diceFacesArray.push(diceFaces)
            } else {
                // ultimo dado, destras de la ultima ,
                const { D_position, comma_position } = this.searchDandCommaPosition(modifiedMessage);
                dice = modifiedMessage;
                const { diceNumber, diceFaces } = this.numberOfDicesAndDicesFaces(dice, D_position);
                diceNumberArray.push(diceNumber)
                diceFacesArray.push(diceFaces)
            }
        }
        return { diceNumberArray, diceFacesArray }
    }

    private rollLimitation(diceNumberArray: number[], diceFacesArray: number[], event) {
        let numberOfFaces = 0;
        for (const value of diceNumberArray) {
            numberOfFaces += value;
        }

        const maxNumberOfFaces = Math.max(...diceFacesArray)

        if (numberOfFaces > 30 || maxNumberOfFaces > 10000) {
            const embed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`Tirada no permitida`)
                .setDescription(`Como maximo se puede lanzar 30 dados de 10000 caras`)

            const output: CommandOutput = {
                embeds: [embed],
            }
            return event.reply(output);
        }
    }

    private mapRollString(diceNumberArray: number[], diceFacesArray: number[]) {
        let total: number = 0;
        let rollStringSum: string;

        // mapear a string todos dados
        for (let i = 0; i <= diceNumberArray.length - 1; i++) {
            // numero de dados y caras a string
            let diceString: string;
            if (diceNumberArray[i] === 1) {
                diceString = `D${diceFacesArray[i]}= `;
            } else {
                diceString = `${diceNumberArray[i]} D${diceFacesArray[i]}= `;
            }

            // numeros randoms, suma de estos, y el estring de las tiradas
            const { rollString, diceTotal } = this.mapRandomNumberString(diceNumberArray[i], diceFacesArray[i], diceString);

            if (i === 0) {
                rollStringSum = `${rollString}\n`
            } else {
                rollStringSum += `${rollString}\n`
            }
            total += diceTotal;
        }

        return this.embedConstructor(total, rollStringSum);
    }

    private mapRandomNumberString(diceNumber: number, diceFaces: number, rollString: string) {
        let diceTotal: number;
        for (let i = 0; i <= diceNumber - 1; i++) {
            const roll = Math.floor(Math.random() * Number(diceFaces)) + 1;
            if (i === 0) {
                diceTotal = roll
                rollString = rollString + (`${roll}`);

            } else {
                diceTotal = diceTotal + roll
                rollString = rollString + (` + ${roll}`);
            }
        }
        return { rollString, diceTotal }
    }

    private embedConstructor(diceTotal, rollStringArray) {
        // construir embed
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(rollStringArray)
            .setDescription(`${diceTotal}`)

        return embed;
    }
}