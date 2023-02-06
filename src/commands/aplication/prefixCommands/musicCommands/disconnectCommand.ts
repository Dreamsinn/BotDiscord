import { Message } from 'discord.js';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';

export class DisconnectCommand extends Command {
    private botDisconnectSchema: CommandSchema;
    private playListHandler: PlayListHandler;

    constructor(botDisconnectSchema: CommandSchema, playListHandler: PlayListHandler) {
        super();
        this.botDisconnectSchema = botDisconnectSchema;
        this.playListHandler = playListHandler;
    }

    public async call(event: Message): Promise<void> {
        if (this.roleAndCooldownValidation(event, this.botDisconnectSchema)) {
            return;
        }

        return this.playListHandler.botDisconnect();
    }
}
