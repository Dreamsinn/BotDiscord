import { Message } from "discord.js";
import { Command } from "../../domain/interfaces/Command";
import { CommandSchema } from "../../domain/interfaces/commandSchema";
import { ReplyCommand } from "../non-prefixCommands/replyCommand";

export class ReplyCommandToggler extends Command {
  public async call(
    event: Message,
    adminRole: string,
    toggleDiceSchema: CommandSchema,
    props: { replyCommand: ReplyCommand }
  ): Promise<void> {
    if (this.roleAndCooldownValidation(event, toggleDiceSchema, adminRole)) {
      return;
    }

    // si on activa la respuestas de dados, si off la desactiva
    if (event.content.includes("on")) {
      console.log({ argument: "on" });
      const hasBeenActived = props.replyCommand.toggleReplyCommand(true);
      if (hasBeenActived) {
        event.channel.send("Respuestas activados");
      }
      return;
    }

    if (event.content.includes("off")) {
      console.log({ argument: "off" });
      const hasBeenDeactivate = props.replyCommand.toggleReplyCommand(false);
      if (hasBeenDeactivate) {
        event.channel.send("Respuestas desactivados");
      }
      return;
    }
    return;
  }
}
