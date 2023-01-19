import { Message, MessageOptions } from 'discord.js';
import { DiceCommandSchema } from '../domain/commandSchema/diceCommandSchema';
import { Command } from '../domain/interfaces/Command';
import { CommandSchema } from '../domain/interfaces/commandSchema';
import { rollSymbol, SuccessesSymbol } from '../domain/interfaces/successesSymbol';
import { MessageCreator } from './utils/messageCreator';

export class DiceCommand extends Command {
    private diceSchema: CommandSchema = DiceCommandSchema;
    public isDiceCommandActive = false;

    // activa o desactuva los dados
    public toggleDiceCommand(active: boolean): boolean {
        if (this.isDiceCommandActive === active) {
            return false;
        }
        this.isDiceCommandActive = active;
        return true;
    }

    public async call(event: Message): Promise<Message | void> {
        if (this.roleAndCooldownValidation(event, this.diceSchema)) {
            return;
        }

        // para tiradas que incluyen < o >
        if (event.content.includes('<') || event.content.includes('>')) {
            if (event.content.includes(',')) {
                return;
            }
            // valida que las tiradas sean correctas
            if (!this.checkValidRoll(event.content)) {
                return;
            }
            const output = this.rollSuccesses(event.content);
            return event.reply(output);
        }

        // las demas tiradas
        const rollsList = event.content.split(',');

        const nonValidRoll = rollsList.map((roll: string) => {
            if (!this.checkValidRoll(roll)) {
                return roll;
            }
        });

        if (nonValidRoll[0]) {
            return;
        }

        const output = this.rolDices(rollsList);
        return event.reply(output);
    }

    private checkValidRoll(roll: string): boolean {
        const D_position = roll.search(this.diceSchema.aliases[0]);
        // si comienza por algo que no es D o un numero
        if (isNaN(Number(roll.substring(0, D_position))) && roll.charAt(0) !== 'D') {
            return false;
        }

        if (roll.includes('<') || roll.includes('>')) {
            const symbol: SuccessesSymbol = this.findSuccessSymbol(roll);
            // antes y despues del simbolo sea u numero
            if (Number(roll.substring(D_position + 1, symbol.symbolPosition))) {
                // si tiene =, despues de <= sea un nuemero
                if (symbol.plusSymbol && Number(roll.substring(symbol.symbolPosition + 2))) {
                    return true;
                }
                // sino tiene =, despues de < sea un numero
                if (Number(roll.substring(symbol.symbolPosition + 1))) {
                    return true;
                }
            }
            return false;
        }

        // si despues de la D no hay un numero
        if (!Number(roll.substring(D_position + 1))) {
            return false;
        }

        return true;
    }

    private findSuccessSymbol(messageContent: string): SuccessesSymbol {
        const successSymbolDictionary: { symbol: rollSymbol, condition: boolean, plusSymbol: boolean }[] = [
            {
                symbol: '<=',
                condition: messageContent.includes('<') && messageContent.includes('='),
                plusSymbol: true
            },
            {
                symbol: '<',
                condition: messageContent.includes('<'),
                plusSymbol: false
            },
            {
                symbol: '>=',
                condition: messageContent.includes('>') && messageContent.includes('='),
                plusSymbol: true
            },
            {
                symbol: '>',
                condition: messageContent.includes('>'),
                plusSymbol: false
            }
        ]

        const usedSymbol = successSymbolDictionary.find((successSymbol) => successSymbol.condition)

        return {
            symbol: usedSymbol!.symbol,
            symbolPosition: messageContent.search(usedSymbol!.symbol),
            plusSymbol: usedSymbol!.plusSymbol
        }
    }

    private rollSuccesses(messageContent: string): MessageOptions {
        const symbolData: SuccessesSymbol = this.findSuccessSymbol(messageContent);

        const roll = messageContent.substring(0, symbolData.symbolPosition);
        const { diceNumber, diceFaces } = this.numberOfDicesAndDicesFaces(roll);
        const diceResult = this.mapRandomNumberString(diceNumber, diceFaces);

        // comprobar que no se supera el limite de caras y tiradas
        const notAllowedRoll = this.rollLimitation([diceNumber], [diceFaces]);
        if (notAllowedRoll) {
            return notAllowedRoll;
        }

        let successesCondition: number;
        if (symbolData.plusSymbol) {
            successesCondition = Number(messageContent.substring(symbolData.symbolPosition + 2));
        } else {
            successesCondition = Number(messageContent.substring(symbolData.symbolPosition + 1));
        }

        const { diceString, results } = this.mapRollSuccessesString(
            diceResult,
            diceNumber,
            diceFaces,
            successesCondition,
            symbolData,
        );

        return this.embedConstructor(results, diceString);
    }

    private mapRollSuccessesString(
        diceResult: { rollString: string; diceTotal: number },
        diceNumber: number,
        diceFaces: number,
        successesCondition: number,
        symbolData: SuccessesSymbol,
    ) {
        let diceString = '';
        if (diceNumber !== 1) {
            diceString += `${diceNumber} `;
        }
        diceString += `D${diceFaces}= `;

        diceString += '{' + diceResult.rollString + '}';
        diceString += ' ' + symbolData.symbol;
        diceString += ` ${successesCondition}`;

        const numberSuccesses = this.findNumberOfSuccesses(
            symbolData,
            diceResult.rollString,
            successesCondition,
        );

        let results = `**${numberSuccesses}**`;
        if (numberSuccesses === 1) {
            results += ` éxito`;
        } else {
            results += ` éxitos`;
        }

        return { diceString, results };
    }

    private findNumberOfSuccesses(
        symbolData: SuccessesSymbol,
        rollString: string,
        successesCondition: number,
    ): number {
        const diceResultNumbers = rollString.split('+');
        const successesDictionary: { [key in rollSymbol]: (n: string) => boolean } = {
            '>=': (result: string): boolean => (Number(result) >= successesCondition),
            '>': (result: string): boolean => (Number(result) > successesCondition),
            '<=': (result: string): boolean => (Number(result) <= successesCondition),
            '<': (result: string): boolean => (Number(result) < successesCondition)
        }

        const successes: string[] = diceResultNumbers.filter((result: string) => {
            return successesDictionary[symbolData.symbol](result)
        });

        return successes.length;
    }

    private rolDices(rollsList: string[]) {
        const diceNumberArray: number[] = [];
        const diceFacesArray: number[] = [];

        rollsList.forEach((roll: string) => {
            const { diceNumber, diceFaces } = this.numberOfDicesAndDicesFaces(roll);
            diceNumberArray.push(diceNumber);
            diceFacesArray.push(diceFaces);
        });

        // comprobar que no se supera el limite de caras y tiradas
        const notAllowedRoll = this.rollLimitation(diceNumberArray, diceFacesArray);
        if (notAllowedRoll) {
            return notAllowedRoll;
        }

        return this.mapRollString(diceNumberArray, diceFacesArray);
    }

    private numberOfDicesAndDicesFaces(roll: string) {
        const D_position = roll.search(this.diceSchema.aliases[0]);
        let diceNumber = 1;
        //mirar si antes de la D es un numero
        if (Number(roll.substring(0, D_position))) {
            // ese numero = numero dados
            diceNumber = Number(roll.substring(0, D_position));
        }

        const diceFaces = Number(roll.substring(D_position + 1));

        return { diceNumber, diceFaces };
    }

    private rollLimitation(diceNumberArray: number[], diceFacesArray: number[]): MessageOptions | void {
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
                    description: 'Como máximo se puede lanzar 30 dados de 10000 caras',
                },
            }).call();
            return output;
        }
        return;
    }

    private mapRollString(diceNumberArray: number[], diceFacesArray: number[]): MessageOptions {
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

        return this.embedConstructor(`${total}`, rollStringSum);
    }

    private mapRandomNumberString(diceNumber: number, diceFaces: number, rollString = '') {
        let diceTotal = 0;
        for (let i = 0; i <= diceNumber - 1; i++) {
            const roll = Math.floor(Math.random() * diceFaces) + 1;
            if (i === 0) {
                rollString = rollString + `${roll}`;
            } else {
                rollString = rollString + ` + ${roll}`;
            }
            diceTotal = diceTotal + roll;
        }
        return { rollString, diceTotal };
    }

    private embedConstructor(results: string, rollStringArray: string): MessageOptions {
        const output = new MessageCreator({
            embed: {
                color: 'GREEN',
                title: rollStringArray,
                description: results,
            },
        }).call();
        return output;
    }
}
