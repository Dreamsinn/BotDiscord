import { Message } from "discord.js";
import { Command } from "../../../domain/interfaces/Command";
import { CommandSchema } from "../../../domain/interfaces/commandSchema";
import { PlayListHandler } from "../../playListHandler";

export class JoinChannelCommand extends Command {
  private playListHandler: PlayListHandler;

  constructor(playListHandler: PlayListHandler) {
    super();
    this.playListHandler = playListHandler;
  }

  public async call(
    event: Message,
    adminRole: string,
    joinSchema: CommandSchema
  ): Promise<void> {
    if (this.roleAndCooldownValidation(event, joinSchema, adminRole)) {
      return;
    }

    return this.playListHandler.changeBotVoiceChanel(event);
  }
}
