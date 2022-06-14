import { Message } from 'discord.js';
import { SkipMusicCommandSchema } from '../../../domain/commandSchema/skipMusicCommandSchema';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { songData } from '../../../domain/interfaces/songData';
import { PlayListHandler } from '../../playListHandler';
import { CoolDown } from '../../utils/coolDown';
import { MessageCreator } from '../../utils/messageCreator';

export class SkipMusicCommand extends Command {
    private skipSchema: CommandSchema = SkipMusicCommandSchema;
    private coolDown = new CoolDown();
    private playListHandler: PlayListHandler;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event: Message): Promise<Message> {
        //comprobar coolDown
        const interrupt = this.coolDown.call(this.skipSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown');
            return;
        }

        const skipedMusic: songData = this.playListHandler.skipMusic();

        if (!skipedMusic) {
            return;
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
