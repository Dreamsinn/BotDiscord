import { Message } from 'discord.js';
import { CommandSchema } from '../../../../domain/interfaces/commandSchema';
import { PaginatedMessage } from '../../../utils/paginatedMessage';

export class ChangeAdminOnly {
    public async call(
        event: Message,
        schemaList: CommandSchema[],
    ): Promise<CommandSchema[] | void | Error> {
        const changeAdminOnlyMessage = await this.createChangeAdminOnlyMessage(event, schemaList);

        const filter = (reaction: Message): boolean => {
            const userCondition = reaction.author.id === event.author.id;

            // content can be numbers splited by ',' or just a number
            const numbersArray = reaction.content.split(',');
            const numbersConditions =
                !numbersArray.find((n: string) => isNaN(Number(n))) &&
                Math.max(Number(...numbersArray)) <= schemaList.length &&
                Math.min(Number(...numbersArray)) > 0;

            const letterCondition = ['x', 'X'].includes(reaction.content);

            return userCondition && (numbersConditions || letterCondition);
        };

        return event.channel
            .awaitMessages({ filter, time: 60000, max: 1, errors: ['time'] })
            .then(async (collected) => {
                const collectedMessage = collected.map((e: Message) => e);

                // delete response message
                await collectedMessage[0].delete();

                await changeAdminOnlyMessage
                    .delete()
                    .catch((err) => console.log('Error deleting changeAdminRoleMessage:', err));

                if (['x', 'X'].includes(collectedMessage[0].content)) {
                    return [];
                }

                const numberArray = collectedMessage[0].content.split(',');
                return numberArray.map((number: string) => schemaList[Number(number) - 1]);
            })
            .catch(async (err) => {
                if (err instanceof Error) {
                    console.log('Error in changeAdminRole collector: ', err);
                    return err;
                }

                await changeAdminOnlyMessage
                    .delete()
                    .catch((err) => console.log('Error deleting changeAdminRoleMessage:', err));
                return [];
            });
    }

    private async createChangeAdminOnlyMessage(event: Message, schemaList: CommandSchema[]) {
        const schemaListArray: string[] = schemaList.map((schema: CommandSchema, i: number) => {
            return `${i + 1} - ${schema.command}\n      admin only?: ${schema.adminOnly}\n`;
        });

        const userName = event.member?.nickname ?? event.author.username;

        return new PaginatedMessage({
            embed: {
                color: 'WHITE',
                title: 'Cambiar adminRole only',
                author: {
                    name: `${userName}`,
                    iconURL: `${event.member?.user.displayAvatarURL()}`,
                },
                description:
                    'Escriba:\n' +
                    '- Los **numeros** separados por "**,**" de los esquemas que quiera modificar: \n' +
                    '- **x** para cancelar',
            },
            pagination: {
                channel: event.channel,
                reply: false,
                dataToPaginate: [...schemaListArray],
                dataPerPage: 10,
                timeOut: 60000,
                deleteWhenTimeOut: true,
                jsFormat: true,
                closeButton: false,
            },
        }).call();
    }
}
