import { Message } from 'discord.js';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';
import { MessageCreator } from '../../utils/messageCreator';

export class SkipMusicCommand extends Command {
    private skipSchema: CommandSchema;
    private playListHandler: PlayListHandler;

    constructor(skipSchema: CommandSchema, playListHandler: PlayListHandler) {
        super();
        this.skipSchema = skipSchema;
        this.playListHandler = playListHandler;
    }

    public async call(event: Message, adminRole: string): Promise<void> {
        if (this.roleAndCooldownValidation(event, this.skipSchema, adminRole)) {
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
