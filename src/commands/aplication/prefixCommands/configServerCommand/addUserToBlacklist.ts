import { GuildMember, Message } from 'discord.js';
import { MessageCreator } from '../../utils/messageCreator';
import { PaginatedMessage } from '../../utils/paginatedMessage';

interface BlackListUser {
    id: string;
    name: string;
}

type Response =
    | {
          message: Message;
          user: BlackListUser;
      }
    | { message: null };

export class AddUserToBlacklist {
    public async call(event: Message, configOptionMessage: Message): Promise<Response | void> {
        const addUserToBlacklsitEmbed = this.createAddUserToBlacklsitEmbed(event);
        const addUserToBlacklsitMessage = await configOptionMessage
            .edit(addUserToBlacklsitEmbed)
            .catch((err) => {
                console.log('Error editing addOrRemoveUserMessage: ', err);
            });

        if (!addUserToBlacklsitMessage) {
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

                if (['x', 'X'].includes(collectedMessage[0].content)) {
                    return;
                }

                const userList = await this.fetchAndMapUserToBlacklist(
                    event,
                    collectedMessage[0].content,
                );

                if (!userList) {
                    await event.channel.send('Usuario no encontrado');
                    return;
                }

                if (userList.length > 1) {
                    const user = await this.wichUserAddToBlacklist(event, userList);

                    if (user) {
                        return {
                            message: addUserToBlacklsitMessage,
                            user: { id: user.id, name: user.name },
                        };
                    }
                } else {
                    return {
                        message: addUserToBlacklsitMessage,
                        user: { id: userList[0].id, name: userList[0].name },
                    };
                }
                return;
            })
            .catch(async (err) => {
                if (err instanceof Error) {
                    console.log('Error add user to blacklist collector', err);
                    return { message: null };
                }

                return;
            });
    }

    private createAddUserToBlacklsitEmbed(event: Message) {
        const userName = event.member?.nickname ?? event.author.username;

        return new MessageCreator({
            embed: {
                color: 'WHITE',
                title: 'Añadir usuario a blackList',
                description:
                    'Escriba:\n' +
                    '- El **nombre**, **alias** o **id** del usuario\n' +
                    '- **x** para cancelar',
                author: {
                    name: `${userName}`,
                    iconURL: `${event.member?.user.displayAvatarURL()}`,
                },
            },
        }).call();
    }

    private async fetchAndMapUserToBlacklist(
        event: Message,
        messageContent: string,
    ): Promise<void | BlackListUser[]> {
        const fetchedUser = await event.guild?.members.search({ query: messageContent, limit: 30 });

        if (fetchedUser?.size) {
            const userList: BlackListUser[] = fetchedUser.map((member: GuildMember) => {
                if (member.nickname) {
                    return { id: member.id, name: member.nickname };
                }
                return { id: member.id, name: member.user.username };
            });
            return userList;
        }
    }

    private async wichUserAddToBlacklist(
        event: Message,
        userList: BlackListUser[],
    ): Promise<void | BlackListUser> {
        const userName = event.member?.nickname ?? event.author.username;

        const indexedUsers: string[] = userList.map(
            (user: BlackListUser, i: number) => `${i + 1} - ${user.name}\n`,
        );

        const selectUserToBlackListMessage = await new PaginatedMessage({
            embed: {
                color: 'WHITE',
                title: 'Seleciona usuario para blacklsit',
                author: {
                    name: `${userName}`,
                    iconURL: `${event.member?.user.displayAvatarURL()}`,
                },
                description:
                    'Escriba:\n' +
                    '- El **numero** del usuario que quiera selecionar: \n' +
                    '- **x** para cancelar',
            },
            pagination: {
                channel: event.channel,
                dataToPaginate: [...indexedUsers],
                dataPerPage: 10,
                timeOut: 60000,
                deleteWhenTimeOut: true,
                jsFormat: true,
                closeButton: false,
                reply: false,
            },
        }).call();

        const filter = (reaction: Message): boolean => {
            const userCondition = reaction.author.id === event.author.id;
            const numberCondition =
                Number(reaction.content) <= indexedUsers.length && Number(reaction.content) > 0;
            const letterCondition = ['x', 'X'].includes(reaction.content);

            return userCondition && (numberCondition || letterCondition);
        };

        return event.channel
            .awaitMessages({ filter, time: 60000, max: 1, errors: ['time'] })
            .then(async (collected) => {
                await selectUserToBlackListMessage.delete();

                const collectedMessage = collected.map((e: Message) => e);

                await collectedMessage[0].delete();

                if (['x', 'X'].includes(collectedMessage[0].content)) {
                    return;
                }

                return userList[Number(collectedMessage[0].content) - 1];
            })
            .catch(async (err) => {
                if (err instanceof Error) {
                    console.log('Error in changePrefix collector: ', err);
                }

                return;
            });
    }
}
