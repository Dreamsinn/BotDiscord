import { Message } from 'discord.js';
import { PlayCommandSchema } from '../../../../domain/commandSchema/playCommandSchema';
import { Command } from '../../../../domain/interfaces/Command';
import { CommandSchema } from '../../../../domain/interfaces/commandSchema';
import { NewSong, Song } from '../../../../domain/interfaces/song';
import { PlayListHandler } from '../../../playListHandler';
import { PlayMusicByName } from './playMusicByName';
import { PlayMusicByYouTubeMobileURL } from './playMusicByYouTubeMobileURL';
import { PlayMusicByYouTubeURL } from './playMusicByYouTubeURL';
import { PlayPlayListByYoutubeURL } from './playPlayListByYoutubeURL';

export class PlayCommandHandler extends Command {
    private playSchema: CommandSchema = PlayCommandSchema;

    constructor(
        private playListHandler: PlayListHandler,
        private playMusicByName: PlayMusicByName,
        private playMusicByYouTubeMobileURL: PlayMusicByYouTubeMobileURL,
        private playPlayListByYoutubeURL: PlayPlayListByYoutubeURL,
        private playMusicByYouTubeURL: PlayMusicByYouTubeURL,
    ) {
        super();
    }

    public async call(event: Message): Promise<Message | void> {
        if (this.roleAndCooldownValidation(event, this.playSchema)) {
            return;
        }

        // si no hay espacio vacio es que no hay argumento
        const emptySpacePosition = event.content.search(' ');
        if (emptySpacePosition === -1) {
            return;
        }

        // si no estas en un canal de voz
        if (!event.member?.voice.channel) {
            return event.channel.send('Tienes que estar en un canal de voz!');
        }

        const argument = event.content.substring(emptySpacePosition);

        const songs = await this.findSongByArgumentType(argument, event)

        if (!songs || (Array.isArray(songs) && !songs.length)) {
            return;
        }

        if (songs instanceof Message) {
            return songs;
        }

        return this.updatePlayList(event, songs);
    }

    private async findSongByArgumentType(argument: string, event: Message) {
        const argumentTypeDictionary = {
            mobil: {
                condition: argument.includes('youtu.be/'),
                route: this.playMusicByYouTubeMobileURL,
            },
            youtubePlayListURl: {
                condition: Boolean(
                    argument.includes('youtube.com/playlist?list=') ||
                    (argument.includes('youtube.com') && argument.includes('&list=')),
                ),
                route: this.playPlayListByYoutubeURL,
            },
            youtubeSongURL: {
                condition: argument.includes('youtube.com/watch?v='),
                route: this.playMusicByYouTubeURL,
            },
            songName: {
                //default
                condition: true,
                route: this.playMusicByName,
            },
        };

        const argumentType = Object.values(argumentTypeDictionary).find((value) => value.condition);

        return await argumentType?.route.call(event, argument);
    }

    private async updatePlayList(event: Message, songsData: Song | Song[]): Promise<void> {
        if (songsData instanceof Array) {
            const newSongList: NewSong = {
                newSongs: songsData,
                channel: event.channel,
                member: event.member,
            };

            return this.playListHandler.update(newSongList);
        }

        const newSongList: NewSong = {
            newSongs: songsData,
            channel: event.channel,
            member: event.member,
        };

        return this.playListHandler.update(newSongList);
    }
}
