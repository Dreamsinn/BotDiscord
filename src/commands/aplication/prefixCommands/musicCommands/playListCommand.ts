import { Message } from 'discord.js';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';
import { PaginatedMessage } from '../../utils/paginatedMessage';

export class PlayListCommand extends Command {
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event: Message, adminRole: string, playListSchema: CommandSchema): Promise<void> {
        if (this.roleAndCooldownValidation(event, playListSchema, adminRole)) {
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
