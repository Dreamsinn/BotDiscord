import { Message, MessageOptions } from 'discord.js';
import { MessageCreator } from '../../../../utils/messageCreator';

type Response = {
  name: string;
};

export class ChangePlaylistName {
  public async call(event: Message): Promise<Response | void | Error> {
    const changePlaylistNameEmbed = this.createChangePlaylistNameEmbed(event);

    // edit the configOptionMessage with the new embed
    const changePlaylistNameMessage = await event.channel.send(changePlaylistNameEmbed);

    const filter = (reaction: Message): boolean => {
      return reaction.author.id === event.author.id;
    };

    return event.channel
      .awaitMessages({ filter, time: 60000, max: 1, errors: ['time'] })
      .then(async collected => {
        const collectedMessage = collected.map((e: Message) => e);

        // delete response message
        await collectedMessage[0].delete();
        await changePlaylistNameMessage.delete().catch(err => {
          console.log('Error deleting changePlaylistNameMessage: ', err);
        });

        if (!['x', 'X'].includes(collectedMessage[0].content)) {
          return { name: collectedMessage[0].content };
        }
        return;
      })
      .catch(async err => {
        if (err instanceof Error) {
          console.log('Error in changePlaylistName collector: ', err);
          return err;
        }

        await changePlaylistNameMessage.delete().catch(err => {
          console.log('Error deleting changePlaylistNameMessage: ', err);
        });

        return;
      });
  }

  private createChangePlaylistNameEmbed(event: Message): MessageOptions {
    const userName = event.member?.nickname ?? event.author.username;

    return new MessageCreator({
      embed: {
        color: '#d817ff',
        title: 'Cambiar el nombre de la playlist',
        description:
          'Escriba:\n' + '- El **nombre** de la playlist\n' + '- **x** para cancelar',
        author: {
          name: `${userName}`,
          iconURL: `${event.member?.user.displayAvatarURL()}`,
        },
      },
      buttons: [],
    }).call();
  }
}
