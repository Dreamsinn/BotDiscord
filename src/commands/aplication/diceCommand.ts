import { Message } from 'discord.js';
import { DiceCommandSchema } from '../domain/commandSchema/diceCommandSchema';
import { CommandSchema } from '../domain/interfaces/commandSchema';
import { CoolDown } from './utils/coolDown';
import { MessageCreator } from './utils/messageCreator';

export class DiceCommand {
    private diceSchema: CommandSchema = DiceCommandSchema;
    private coolDown = new CoolDown();

    public async call(event: Message): Promise<Message> {
        // buscar la posicion de la D, y la de la , (-1 si no hay)
        const { D_position, comma_position } = this.searchDandCommaPosition(event.content);

        // valida que la tirada sea correcta
        if (this.checkValidRoll(event.content, D_position, comma_position)) {
            return;
        }

        //comprobar coolDown
        const interrupt = this.coolDown.call(this.diceSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown');
            return;
        }

        const output = this.rolDices(event, D_position, comma_position);

        return event.reply(output);
    }

    private searchDandCommaPosition(messageContent: string) {
        const D_position = messageContent.search(this.diceSchema.aliases[0]);
        const comma_position = messageContent.search(this.diceSchema.usage);

        return { D_position, comma_position };
    }

    private checkValidRoll(messageContent: string, D_position: number, comma_position: number) {
        // que comience por D o numero
        if (!Number(messageContent.charAt(0)) && messageContent.charAt(0) != 'D') {
            return true;
        }

        // si incluye una , comprobar si antes de la coma hay un numero, repite el metodo para ver si el siguiente esta bien
        if (comma_position != -1) {
            if (!Number(messageContent.substring(D_position + 1, comma_position))) {
                return true;
            }
            const modifiedMessage = messageContent.substring(comma_position + 2);
            const newPossition = this.searchDandCommaPosition(modifiedMessage);
            return this.checkValidRoll(
                modifiedMessage,
                newPossition.D_position,
                newPossition.comma_position,
            );
        }

        // despues de la D sea un numero
        if (!Number(messageContent.substring(D_position + 1))) {
            return true;
        }
        return false;
    }

    private rolDices(event: Message, D_position: number, comma_position: number) {
        let diceNumberArray: number[] = [];
        let diceFacesArray: number[] = [];

        if (comma_position === -1) {
            // sino hay ,
            const { diceNumber, diceFaces } = this.numberOfDicesAndDicesFaces(event.content, D_position);
            diceNumberArray.push(diceNumber);
            diceFacesArray.push(diceFaces);
        } else {
            // si hay ,
            const rols = this.rolMultipleDices(event.content);
            diceNumberArray = rols.diceNumberArray;
            diceFacesArray = rols.diceFacesArray;
        }

        // comprobar que no se supera el limite de caras y tiradas
        const notAllowdRoll = this.rollLimitation(diceNumberArray, diceFacesArray);
        if (this.rollLimitation(diceNumberArray, diceFacesArray)) {
            return notAllowdRoll;
        }

        // tirar los dados
        return this.mapRollString(diceNumberArray, diceFacesArray);
    }

    private numberOfDicesAndDicesFaces(messageContent: string, D_position: number) {
        let diceNumber = 1;
        //mirar si antes de la D es un numero
        if (Number(messageContent.substring(0, D_position))) {
            // ese numero = numero dados
            diceNumber = Number(messageContent.substring(0, D_position));
        }

        const diceFaces = Number(messageContent.substring(D_position + 1));

        return { diceNumber, diceFaces };
    }

    private rolMultipleDices(messageContent: string) {
        // numero de comas
        const numberOfCommas = messageContent.split(this.diceSchema.usage).length - 1;
        let modifiedMessage = messageContent;
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
                diceNumberArray.push(diceNumber);
                diceFacesArray.push(diceFaces);
            } else {
                // ultimo dado, destras de la ultima ,
                const position = this.searchDandCommaPosition(modifiedMessage);
                dice = modifiedMessage;
                const { diceNumber, diceFaces } = this.numberOfDicesAndDicesFaces(
                    dice,
                    position.D_position,
                );
                diceNumberArray.push(diceNumber);
                diceFacesArray.push(diceFaces);
            }
        }
        return { diceNumberArray, diceFacesArray };
    }

    private rollLimitation(diceNumberArray: number[], diceFacesArray: number[]) {
        let numberOfDices = 0;
        for (const value of diceNumberArray) {
            numberOfDices += value;
        }

        const maxNumberOfFaces = Math.max(...diceFacesArray);

        if (numberOfDices > 30 || maxNumberOfFaces > 10000) {
            const output = new MessageCreator({
                embed: {
                    color: 'RED',
                    title: 'Tirada no permitida',
                    description: 'Como maximo se puede lanzar 30 dados de 10000 caras',
                },
            }).call();
            return output;
        }
        return;
    }

    private mapRollString(diceNumberArray: number[], diceFacesArray: number[]) {
        let total = 0;
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
            const { rollString, diceTotal } = this.mapRandomNumberString(
                diceNumberArray[i],
                diceFacesArray[i],
                diceString,
            );

            if (i === 0) {
                rollStringSum = `${rollString}\n`;
            } else {
                rollStringSum += `${rollString}\n`;
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
                diceTotal = roll;
                rollString = rollString + `${roll}`;
            } else {
                diceTotal = diceTotal + roll;
                rollString = rollString + ` + ${roll}`;
            }
        }
        return { rollString, diceTotal };
    }

    private embedConstructor(diceTotal: number, rollStringArray: string) {
        const output = new MessageCreator({
            embed: {
                color: 'GREEN',
                title: rollStringArray,
                description: `${diceTotal}`,
            },
        }).call();
        return output;
    }
}
