import { Message } from 'discord.js';
import { PaginatedMessage } from '../../../utils/paginatedMessage';

type Response = {
  user: string;
};

export class RemoveUserFromBlacklist {
  public async call(
    event: Message,
    blacklist: string[],
  ): Promise<Response | void | Error> {
    const removeUserFromBlacklistMessage =
      await this.createRemoveUserFromBlacklistMessage(event, blacklist);

    const filter = (reaction: Message): boolean => {
      const userCondition = reaction.author.id === event.author.id;
      // number condition = write a number equal to the index of the role wanted
      const numberCondition =
        Number(reaction.content) <= blacklist.length && Number(reaction.content) > 0;
      const letterCondition = ['x', 'X'].includes(reaction.content);

      return userCondition && (numberCondition || letterCondition);
    };

    return event.channel
      .awaitMessages({ filter, time: 60000, max: 1, errors: ['time'] })
      .then(async collected => {
        const collectedMessage = collected.map((e: Message) => e);

        // delete response message
        await collectedMessage[0].delete();

        await removeUserFromBlacklistMessage
          .delete()
          .catch(err => console.log('Error deleting changeAdminRoleMessage:', err));

        if (!['x', 'X'].includes(collectedMessage[0].content)) {
          const selectedRoll = blacklist[Number(collectedMessage[0].content) - 1];
          return { user: selectedRoll };
        }

        return;
      })
      .catch(async err => {
        if (err instanceof Error) {
          console.log('Error in changeAdminRole collector: ', err);
          return err;
        }

        await removeUserFromBlacklistMessage
          .delete()
          .catch(err => console.log('Error deleting changeAdminRoleMessage:', err));

        return;
      });
  }

  private async createRemoveUserFromBlacklistMessage(
    event: Message,
    blacklist: string[],
  ): Promise<Message<boolean>> {
    const indexedUsers = blacklist.map(
      (userName: string, i: number) => `${i + 1} - ${userName}\n`,
    );

    const userName = event.member?.nickname ?? event.author.username;

    return await new PaginatedMessage({
      embed: {
        color: 'WHITE',
        title: 'Cambiar admin role',
        author: {
          name: `${userName}`,
          iconURL: `${event.member?.user.displayAvatarURL()}`,
        },
        description:
          'Escriba:\n' +
          '- El **numero** del rol que quiera selecionar: \n' +
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
  }
}
