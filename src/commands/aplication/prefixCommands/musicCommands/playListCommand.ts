import { Message } from 'discord.js';
import { PlayListCommandSchema } from '../../../domain/commandSchema/playListCommandSchema';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';
import { PaginatedMessage } from '../../utils/paginatedMessage';

export class PlayListCommand extends Command {
    private playListSchema: CommandSchema = PlayListCommandSchema;
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event: Message): Promise<void> {
        if (this.roleAndCooldownValidation(event, this.playListSchema)) {
            return;
        }

        const playList: string[] = this.playListHandler.readPlayList();

        await new PaginatedMessage({
            embed: {
                color: '#FFE4C4',
                title: `Playlist: ${playList.length} songs`,
            },
            pagination: {
                channel: event.channel,
                dataToPaginate: playList,
                dataPerPage: 10,
                timeOut: 60000,
                jsFormat: true,
                reply: false,
            },
        }).call();
        return;
    }
}
