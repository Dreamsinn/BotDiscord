import { Message } from 'discord.js';
import { UnionToArray } from '../../../../../languages/interfaces/unionToArray';
import { Languages } from '../../../../../languages/languageService';
import { typeIsLanguage } from '../../../../../languages/utils/typeIsLanguage';
import { PaginatedMessage } from '../../../utils/paginatedMessage';

type response = {
  language: Languages;
};

export class ChangeLanguage {
  public async call(
    event: Message,
    languagesArray: UnionToArray<Languages>,
  ): Promise<response | void | Error> {
    const changeLengaugeMessage = await this.createChangeLanguageMessage(
      event,
      languagesArray,
    );

    const filter = (message: Message) => {
      const userConditions = event.author.id === message.author.id;
      const numbersConditions =
        Number(message.content) <= languagesArray.length && Number(message.content) > 0;
      const letterCondition = ['x', 'X'].includes(message.content);

      // si la respuesta viene del mismo que el evento, todos son numeros, mayot que 0 y no mayor que el numero de items, o X
      return userConditions && (numbersConditions || letterCondition);
    };

    return event.channel
      .awaitMessages({ filter, time: 60000, max: 1, errors: ['time'] })
      .then(async collected => {
        const collectedMessage = collected.map((e: Message) => e);

        // delete response message
        await collectedMessage[0].delete();

        await changeLengaugeMessage.delete().catch(err => {
          console.log('Error deleting changeLengaugeMessage: ', err);
        });

        if (['x', 'X'].includes(collectedMessage[0].content)) {
          return;
        }

        const selectedLanguage = languagesArray[Number(collectedMessage[0].content) - 1];

        if (typeIsLanguage(selectedLanguage)) {
          return { language: selectedLanguage };
        }

        return;
      })
      .catch(async err => {
        if (err instanceof Error) {
          console.log('Error in changePrefix collector: ', err);
          return err;
        }

        await changeLengaugeMessage.delete().catch(err => {
          console.log('Error deleting changeLengaugeMessage: ', err);
        });

        return;
      });
  }

  private async createChangeLanguageMessage(
    event: Message,
    languagesArray: UnionToArray<Languages>,
  ) {
    const laguangesString: string[] = languagesArray.map(
      (language: Languages, i: number) => `${i + 1} - ${language}\n`,
    );

    const userName = event.member?.nickname ?? event.author.username;

    return new PaginatedMessage({
      embed: {
        color: '#d817ff',
        title: 'Change language:',
        author: {
          name: `${userName}`,
          iconURL: `${event.member!.user.displayAvatarURL()}`,
        },
        description:
          'Escriba:\n' +
          '- El **numero** del lenguaje que quiera seleccionar \n' +
          '- **x** para cancelar',
      },
      pagination: {
        channel: event.channel,
        dataToPaginate: [...laguangesString],
        dataPerPage: 10,
        timeOut: 60000,
        jsFormat: true,
        deleteWhenTimeOut: false,
        reply: false,
        closeButton: false,
        author: event.author,
      },
    }).call();
  }
}
