import { Message } from 'discord.js';
import { DisconnectCommandSchema } from '../../../domain/commandSchema/disconnectCommandSchema';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';

export class DisconnectCommand extends Command {
    private BotDisconnectSchema: CommandSchema = DisconnectCommandSchema;
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event: Message): Promise<void> {
        if (this.roleAndCooldownValidation(event, this.BotDisconnectSchema)) {
            return;
        }

        return this.playListHandler.botDisconnect();
    }
}
