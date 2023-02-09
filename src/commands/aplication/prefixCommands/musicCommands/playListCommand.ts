import { Message } from 'discord.js';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';
import { PaginatedMessage } from '../../utils/paginatedMessage';

export class PlayListCommand extends Command {
    private playListSchema: CommandSchema;
    private playListHandler: PlayListHandler;

    constructor(playListSchema: CommandSchema, playListHandler: PlayListHandler) {
        super();
        this.playListSchema = playListSchema;
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
                deleteWhenTimeOut: false,
                jsFormat: true,
                closeButton: true,
                reply: false,
            },
        }).call();
        return;
    }
}
