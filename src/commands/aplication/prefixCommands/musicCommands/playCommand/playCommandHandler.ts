import { Message } from 'discord.js';
import { PlayCommandSchema } from '../../../../domain/commandSchema/playCommandSchema';
import { Command } from '../../../../domain/interfaces/Command';
import { CommandSchema } from '../../../../domain/interfaces/commandSchema';
import { NewSongData, RawSongData, SongData } from '../../../../domain/interfaces/songData';
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
        const song = await argumentType?.route.call(event, argument);

        if (!song) {
            return;
        }

        if (song instanceof Message) {
            return song;
        }

        // unificar tipos de respuesta no pot se que una sigui SongData y laltre RawSongData

        if (Array.isArray(song)) {
            return this.updatePlayListWithAPlayList(event, song);
        }

        return this.updateToPlayList(event, song);
    }

    private async updateToPlayList(event: Message, songData: RawSongData) {
        // const songData: RawSongData = await this.mapSongData(event, song);
        if (songData.title && songData.durationData) {
            const newSong: NewSongData = {
                newSong: {
                    songName: songData.title,
                    songId: songData.id,
                    duration: songData.durationData,
                    thumbnails: songData.thumbnails,
                },
                channel: event.channel,
                member: event.member,
            };

            return this.playListHandler.update(newSong);
        }
        return;
    }

    private async updatePlayListWithAPlayList(event: Message, playList: SongData[]) {
        const newSongList: NewSongData = {
            songList: playList,
            channel: event.channel,
            member: event.member,
        };

        return this.playListHandler.update(newSongList);
    }
}
