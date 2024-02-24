import { Message } from 'discord.js';
import { CommandSchema } from '../../../../domain/interfaces/commandSchema';
import { MessageCreator } from '../../../utils/messageCreator';
import messageToEditMissage from '../../../utils/messageToEditMissage';
import { PaginatedMessage } from '../../../utils/paginatedMessage';

interface Response {
  newCoolDown: number;
  schema: CommandSchema;
}

export class ChangeCoolDown {
  public async call(
    event: Message,
    schemaList: CommandSchema[],
  ): Promise<Response | void | Error> {
    const selectSchemaMessage = await this.createSelectSchemaMessage(event, schemaList);

    const collectorResonse = await this.selectSchemaCollector(
      event,
      schemaList,
      selectSchemaMessage,
    );

    if (collectorResonse instanceof Error) {
      return collectorResonse;
    }

    if (collectorResonse) {
      const changeCoolDownEmbed = this.createChangeCoolDownEmbed(event, collectorResonse);

      let changeCoolDownMessage: Message;
      try {
        changeCoolDownMessage = await selectSchemaMessage.edit(
          messageToEditMissage(changeCoolDownEmbed),
        );
      } catch (error) {
        changeCoolDownMessage = await event.channel.send(changeCoolDownEmbed);
      }

      return this.changeCoolDownCollector(event, changeCoolDownMessage, collectorResonse);
    }
    return;
  }

  private async createSelectSchemaMessage(event: Message, schemaList: CommandSchema[]) {
    const schemaListArray: string[] = schemaList.map(
      (schema: CommandSchema, i: number) => {
        return `${i + 1} - ${schema.command}\n      coolDown: ${schema.coolDown}ms\n`;
      },
    );

    const userName = event.member?.nickname ?? event.author.username;

    return new PaginatedMessage({
      embed: {
        color: 'WHITE',
        title: 'Cambiar coolDown',
        author: {
          name: `${userName}`,
          iconURL: `${event.member?.user.displayAvatarURL()}`,
        },
        description:
          'Escriba:\n' +
          '- El **numero** del esquema que quiera modificar: \n' +
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

  private async selectSchemaCollector(
    event: Message,
    schemaList: CommandSchema[],
    selectSchemaMessage: Message,
  ): Promise<void | CommandSchema | Error> {
    const filter = (reaction: Message): boolean => {
      const userCondition = reaction.author.id === event.author.id;

      // content can be numbers splited by ',' or just a number
      const numberCondition =
        Number(reaction.content) <= schemaList.length && Number(reaction.content) > 0;

      const letterCondition = ['x', 'X'].includes(reaction.content);

      return userCondition && (numberCondition || letterCondition);
    };

    return event.channel
      .awaitMessages({ filter, time: 60000, max: 1, errors: ['time'] })
      .then(async collected => {
        const collectedMessage = collected.map((e: Message) => e);

        // delete response message
        await collectedMessage[0].delete();

        if (['x', 'X'].includes(collectedMessage[0].content)) {
          await selectSchemaMessage
            .delete()
            .catch(err => console.log('Error deleting selectSchemaMessage:', err));

          return;
        }

        return schemaList[Number(collectedMessage[0].content) - 1];
      })
      .catch(async err => {
        if (err instanceof Error) {
          console.log('Error in changeAdminRole collector: ', err);
          return err;
        }

        await selectSchemaMessage
          .delete()
          .catch(err => console.log('Error deleting selectSchemaMessage:', err));

        return;
      });
  }

  private createChangeCoolDownEmbed(event: Message, schemaSelected: CommandSchema) {
    const userName = event.member?.nickname ?? event.author.username;

    return new MessageCreator({
      embed: {
        color: 'WHITE',
        title: 'Cambiar coolDown',
        author: {
          name: `${userName}`,
          iconURL: `${event.member?.user.displayAvatarURL()}`,
        },
        description:
          `**${schemaSelected.command}** seleccionado. Actualmente, cooldown: **${schemaSelected.coolDown}ms**\n\n` +
          'Escriba:\n' +
          '- El **tiempo en milisegundos** que quiera para el cooldown para este comando: \n' +
          '- **x** para cancelar',
      },
    }).call();
  }

  private async changeCoolDownCollector(
    event: Message,
    changeCoolDownMessage: Message,
    schemaSelected: CommandSchema,
  ): Promise<Response | void | Error> {
    const filter = (reaction: Message): boolean => {
      const userCondition = reaction.author.id === event.author.id;

      // content can be numbers splited by ',' or just a number
      const numberCondition = !isNaN(Number(reaction.content));

      const letterCondition = ['x', 'X'].includes(reaction.content);

      return userCondition && (numberCondition || letterCondition);
    };

    return event.channel
      .awaitMessages({ filter, time: 60000, max: 1, errors: ['time'] })
      .then(async collected => {
        const collectedMessage = collected.map((e: Message) => e);

        // delete response message
        await collectedMessage[0].delete();

        await changeCoolDownMessage
          .delete()
          .catch(err => console.log('Error deleting changeCoolDownMessage:', err));

        if (['x', 'X'].includes(collectedMessage[0].content)) {
          return;
        }

        return {
          newCoolDown: Number(collectedMessage[0].content),
          schema: schemaSelected,
        };
      })
      .catch(async err => {
        if (err instanceof Error) {
          console.log('Error in changeAdminRole collector: ', err);
          return err;
        }

        await changeCoolDownMessage
          .delete()
          .catch(err => console.log('Error deleting changeCoolDownMessage:', err));

        return;
      });
  }
}
