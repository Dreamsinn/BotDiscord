import { DiscordRequestRepo } from "../../../domain/interfaces/discordRequestRepo";
import { SkipMusicCommandSchema } from "../../../domain/commandSchema/SkipMusicCommandSchema";
import { PlayListHandler } from "../../playListHandler"
import { CoolDown } from "../../utils/coolDown";
import { Command } from "../../Command";
import { Message } from 'discord.js';
import { playListRepository } from '../../../domain/interfaces/playListRepository'
import { MessageCreator } from "../../utils/messageCreator";



export class SkipMusicCommand extends Command {
    private skipSchema: DiscordRequestRepo = SkipMusicCommandSchema;
    private coolDown = new CoolDown();
    private playListHandler: PlayListHandler;

    constructor(
        playListHandler: PlayListHandler,
    ) {
        super();
        this.playListHandler = playListHandler;
    }


    public async call(event): Promise<Message> {
        //comprobar coolDown
        const interrupt = this.coolDown.call(this.skipSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown')
            return;
        }

        const skipedMusic: playListRepository = this.playListHandler.skipMusic()

        if (!skipedMusic) {
            return
        }

        const output = new MessageCreator({
            embed: {
                color: 'ORANGE',
                author: { name: `${event.member.user.username}`, iconURL: `${event.member.user.displayAvatarURL()}` },
                URL: `https://www.youtube.com/watch?v=${skipedMusic.songId}`,
                title: 'Skipped music:',
                description: skipedMusic.songName,
            }
        }).call()

        return event.channel.send(output)
    }
}