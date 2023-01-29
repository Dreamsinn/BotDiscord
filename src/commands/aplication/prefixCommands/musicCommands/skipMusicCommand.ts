import { Message } from 'discord.js';
import { SkipMusicCommandSchema } from '../../../domain/commandSchema/skipMusicCommandSchema';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';
import { MessageCreator } from '../../utils/messageCreator';

export class SkipMusicCommand extends Command {
    private skipSchema: CommandSchema = SkipMusicCommandSchema;
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event: Message): Promise<void> {
        if (this.roleAndCooldownValidation(event, this.skipSchema)) {
            return;
        }

        const skipedMusic = await this.playListHandler.skipMusic();

        if (!skipedMusic) {
            event.reply('There is no playList');
            return;
        }

        const output = new MessageCreator({
            embed: {
                color: 'ORANGE',
                author: {
                    name: `${event.member!.user.username}`,
                    iconURL: `${event.member!.user.displayAvatarURL()}`,
                },
                URL: `https://www.youtube.com/watch?v=${skipedMusic.songId}`,
                title: 'Skipped music:',
                description: skipedMusic.songName,
            },
        }).call();

        event.channel.send(output);
        return;
    }
}
