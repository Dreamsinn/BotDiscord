import { DiscordRequestRepo } from "../../../domain/interfaces/discordRequestRepo";
import { SkipMusicCommandSchema } from "../../../domain/commandSchema/SkipMusicCommandSchema";
import { PlayListHandler } from "../../playListHandler"
import { CoolDown } from "../../utils/coolDown";
import { Command } from "../../Command";
import { CommandOutput } from "../../../domain/interfaces/commandOutput";
import { MessageEmbed } from 'discord.js';
import { playListRepository } from '../../../domain/interfaces/playListRepository'



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


    public async call(event) {
        //comprobar coolDown
        const interrupt = this.coolDown.call(this.skipSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown')
            return;
        }

        const skipedMusic = this.playListHandler.skipMusic()

        if (!skipedMusic) {
            return
        }

        const embed = this.skipSongEmbed(event, skipedMusic)

        const output: CommandOutput = {
            embeds: [embed],
        }

        return event.channel.send(output)
    }


    private skipSongEmbed(event, skipedMusic: playListRepository) {
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setAuthor({ name: `${event.member.user.username}`, iconURL: `${event.member.user.displayAvatarURL()}` })
            .setDescription(`Skip: ${skipedMusic.songName}`)

        // devuelve el embed
        return embed;
    }
}