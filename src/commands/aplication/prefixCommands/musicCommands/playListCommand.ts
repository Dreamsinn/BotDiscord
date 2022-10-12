import { Message } from 'discord.js';
import { PlayListCommandSchema } from '../../../domain/commandSchema/playListCommandSchema';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { SongData } from '../../../domain/interfaces/songData';
import { PlayListHandler } from '../../playListHandler';
import { CheckAdminRole } from '../../utils/CheckAdminRole';
import { CoolDown } from '../../utils/coolDown';
import { PaginatedMessage } from '../../utils/paginatedMessage';

export class PlayListCommand extends Command {
    private playListSchema: CommandSchema = PlayListCommandSchema;
    private coolDown = new CoolDown();
    private checkAdminRole = new CheckAdminRole();
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event: Message) {
        if (this.playListSchema.adminOnly) {
            const interrupt = this.checkAdminRole.call(event);
            if (!interrupt) {
                return;
            }
        }

        const interrupt = this.coolDown.call(this.playListSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown');
            return;
        }

        const playList: SongData[] = this.playListHandler.readPlayList();

        return await new PaginatedMessage({
            embed: {
                color: '#FFE4C4',
                title: `Playlist: ${playList.length} songs`,
            },
            pagination: {
                event: event,
                rawDataToPaginate: playList,
                dataPerPage: 10,
                timeOut: 60000,
                jsFormat: true,
                reply: false,
            },
        }).call();
    }
}
