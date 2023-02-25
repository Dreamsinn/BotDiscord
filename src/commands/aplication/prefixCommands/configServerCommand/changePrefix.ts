import { Message, MessageOptions } from 'discord.js';
import { MessageCreator } from '../../utils/messageCreator';

type Response = {
    prefix: string;
};

export class ChangePrefix {
    public async call(event: Message): Promise<Response | void | Error> {
        const changePrefixEmbed = this.createChangePrefixEmbed(event);

        // edit the configOptionMessage with the new embed
        const changePrefixMessage = await event.channel.send(changePrefixEmbed);

        const filter = (reaction: Message): boolean => {
            return reaction.author.id === event.author.id;
        };

        return event.channel
            .awaitMessages({ filter, time: 60000, max: 1, errors: ['time'] })
            .then(async (collected) => {
                const collectedMessage = collected.map((e: Message) => e);

                // delete response message
                await collectedMessage[0].delete();
                await changePrefixMessage.delete().catch((err) => {
                    console.log('Error deleting changePrefixMessage: ', err);
                });

                if (!['x', 'X'].includes(collectedMessage[0].content)) {
                    return { prefix: collectedMessage[0].content };
                }
                return;
            })
            .catch(async (err) => {
                if (err instanceof Error) {
                    console.log('Error in changePrefix collector: ', err);
                    return err;
                }

                await changePrefixMessage.delete().catch((err) => {
                    console.log('Error deleting changePrefixMessage: ', err);
                });

                return;
            });
    }

    private createChangePrefixEmbed(event: Message): MessageOptions {
        const userName = event.member?.nickname ?? event.author.username;

        return new MessageCreator({
            embed: {
                color: 'WHITE',
                title: 'Cambiar prefijo',
                description:
                    'Escriba:\n' +
                    '- El **prefijo** con el que quiera llamar al bot\n' +
                    '- **x** para cancelar',
                author: {
                    name: `${userName}`,
                    iconURL: `${event.member?.user.displayAvatarURL()}`,
                },
            },
            buttons: [],
        }).call();
    }
}
