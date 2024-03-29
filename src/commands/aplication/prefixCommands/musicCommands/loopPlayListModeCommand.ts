import { Message } from "discord.js";
import { Command } from "../../../domain/interfaces/Command";
import { CommandSchema } from "../../../domain/interfaces/commandSchema";
import { PlayListHandler } from "../../playListHandler";

export class LoopPlayListModeCommand extends Command {
  private playListHandler: PlayListHandler;

  constructor(playListHandler: PlayListHandler) {
    super();
    this.playListHandler = playListHandler;
  }

  public async call(
    event: Message,
    adminRole: string,
    loopSchema: CommandSchema
  ): Promise<void> {
    if (this.roleAndCooldownValidation(event, loopSchema, adminRole)) {
      return;
    }

    const hasBeenActived = this.playListHandler.toggleLoopMode();
    if (hasBeenActived) {
      event.channel.send("Loop mode active");
      return;
    }

    event.channel.send("Loop mode deactive");
  }
}
