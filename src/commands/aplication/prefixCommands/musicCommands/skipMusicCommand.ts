import { Message } from 'discord.js';
import { SkipMusicCommandSchema } from '../../../domain/commandSchema/skipMusicCommandSchema';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { SongData } from '../../../domain/interfaces/songData';
import { PlayListHandler } from '../../playListHandler';
import { MessageCreator } from '../../utils/messageCreator';

export class SkipMusicCommand extends Command {
    private skipSchema: CommandSchema = SkipMusicCommandSchema;
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event: Message): Promise<Message | undefined> {
        if (this.roleAndCooldownValidation(event, this.skipSchema)) {
            return;
        }

        const skipedMusic: SongData = await this.playListHandler.skipMusic();

        if (!skipedMusic) {
            return event.reply('There is no playList');
        }

        const output = new MessageCreator({
            embed: {
                color: 'ORANGE',
                author: {
                    name: `${event.member.user.username}`,
                    iconURL: `${event.member.user.displayAvatarURL()}`,
                },
                URL: `https://www.youtube.com/watch?v=${skipedMusic.songId}`,
                title: 'Skipped music:',
                description: skipedMusic.songName,
            },
        }).call();

        return event.channel.send(output);
    }
}
