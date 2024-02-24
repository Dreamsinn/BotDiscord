import { Message } from 'discord.js';
import { Command } from '../../domain/interfaces/Command';
import { CommandSchema } from '../../domain/interfaces/commandSchema';
import { MessageCreator } from '../utils/messageCreator';

export class ReplyCommand extends Command {
  public isReplyCommandActive = false;

  // activa o desactuva las respuestas
  public toggleReplyCommand(active: boolean): boolean {
    if (this.isReplyCommandActive === active) {
      return false;
    }
    this.isReplyCommandActive = active;
    return true;
  }

  public async call(
    event: Message,
    adminRole: string,
    replySchema: CommandSchema,
  ): Promise<void> {
    if (this.roleAndCooldownValidation(event, replySchema, adminRole)) {
      return;
    }

    // TODO: no fer recorsivitat de if, es podria fer un filter
    // concatenar if fa que sigui lios
    replySchema.aliases.forEach((alias: string) => {
      // mirar si se encuntra el alias al principio, o ente ' '
      if (event.content.startsWith(alias) || event.content.includes(` ${alias} `)) {
        // mirar si cumple la condicion de coolDown

        const output = new MessageCreator({
          message: {
            content: `${event.author.username} a dicho: ${event.content}!`,
          },
          embed: {
            color: '#0099ff',
            title: `${event.author.username} te falta calle`,
            description: `${this.mapAliases(alias)}`,
          },
        }).call();
        event.reply(output);
        return;
      }
    });
    return;
  }

  private mapAliases(alias: string): string {
    if (alias.charAt(alias.length - 1) === ' ') {
      const aliasModified = alias.slice(0, -1);
      return replyCommandOptions[aliasModified];
    }

    return replyCommandOptions[alias];
  }
}

//TODO hamburgessa no responde

export const replyCommandOptions: any = {
  cinco: 'POR EL CULO TE LA HINCO',
  5: 'POR EL CULO TE LA HINCO',
  trece: 'AGARRAMELA QUE ME CRECE',
  13: 'AGARRAMELA QUE ME CRECE',
  // javi: 'HAMBURGESSA',
  // hamburgessa: 'AMBULANCIA',
  // ino: 'PEPINO',
  // ano: 'AGARRAMELA CON LA MANO'
};
