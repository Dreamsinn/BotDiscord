import { Message, MessageOptions } from 'discord.js';
import { MessageCreator } from '../../utils/messageCreator';

type Response =
    | {
          message: Message;
          prefix: string;
      }
    | { message: null };

export class ChangePrefix {
    public async call(event: Message, configOptionMessage: Message): Promise<Response | void> {
        const changePrefixEmbed = this.createChangePrefixEmbed(event);

        // edit the configOptionMessage with the new embed
        const changePrefixMessage = await configOptionMessage.edit(changePrefixEmbed).catch((err) => {
            console.log('Error editing changePrefixMessage: ', err);
        });

        if (!changePrefixMessage) {
            // most problably message was deleted
            return { message: null };
        }

        const filter = (reaction: Message): boolean => {
            return reaction.author.id === event.author.id;
        };

        return event.channel
            .awaitMessages({ filter, time: 60000, max: 1, errors: ['time'] })
            .then(async (collected) => {
                const collectedMessage = collected.map((e: Message) => e);

                // delete response message
                await collectedMessage[0].delete();

                if (!['x', 'X'].includes(collectedMessage[0].content)) {
                    return { message: configOptionMessage, prefix: collectedMessage[0].content };
                }
                return;
            })
            .catch(async (err) => {
                if (err instanceof Error) {
                    console.log('Error in changePrefix collector: ', err);
                    return { message: null };
                }
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
