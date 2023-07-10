import { Message } from "discord.js";
import { Command } from "../../../domain/interfaces/Command";
import { CommandSchema } from "../../../domain/interfaces/commandSchema";
import { PlayListHandler } from "../../playListHandler";

export class DisconnectCommand extends Command {
  private playListHandler: PlayListHandler;

  constructor(playListHandler: PlayListHandler) {
    super();
    this.playListHandler = playListHandler;
  }

  public async call(
    event: Message,
    adminRole: string,
    botDisconnectSchema: CommandSchema
  ): Promise<void> {
    if (this.roleAndCooldownValidation(event, botDisconnectSchema, adminRole)) {
      return;
    }

    return this.playListHandler.botDisconnect();
  }
}
