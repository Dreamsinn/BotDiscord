import { Message } from 'discord.js';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { SongData, SongsToPlaylist } from '../../../domain/interfaces/song';
import { PlayListHandler } from '../../playListHandler';
import { FindMusicByName } from '../../utils/findMusic/findMusicByName';
import { FindMusicBySpotifySongURL } from '../../utils/findMusic/findMusicBySpotifySongURL';
import { FindMusicByYouTubeMobileURL } from '../../utils/findMusic/findMusicByYouTubeMobileURL';
import { FindMusicByYouTubeURL } from '../../utils/findMusic/findMusicByYouTubeURL';
import { FindPlayListByYoutubeURL } from '../../utils/findMusic/findPlayListByYoutubeURL';
import { FindPlaylistBySpotifyURL } from '../../utils/findMusic/findPlaylistBySpotifyURL';

export class PlayCommand extends Command {
  constructor(
    private playListHandler: PlayListHandler,
    private findMusicByName: FindMusicByName,
    private findMusicByYouTubeMobileURL: FindMusicByYouTubeMobileURL,
    private findPlayListByYoutubeURL: FindPlayListByYoutubeURL,
    private findMusicByYouTubeURL: FindMusicByYouTubeURL,
    private findMusicBySpotifySongURL: FindMusicBySpotifySongURL,
    private findMusicBySpotifyPlaylistURL: FindPlaylistBySpotifyURL,
  ) {
    super();
  }

  public async call(
    event: Message,
    adminRole: string,
    playSchema: CommandSchema,
  ): Promise<void> {
    if (this.roleAndCooldownValidation(event, playSchema, adminRole)) {
      return;
    }

    // si no hay espacio vacio es que no hay argumento
    const emptySpacePosition = event.content.search(' ');
    if (emptySpacePosition === -1) {
      return;
    }

    // si no estas en un canal de voz
    if (!event.member?.voice.channel) {
      event.channel.send('Tienes que estar en un canal de voz!');
      return;
    }

    const argument = event.content.substring(emptySpacePosition);
    console.log({ argument });

    const songs = await this.findSongByArgumentType(argument, event);

    if (!songs || (Array.isArray(songs) && !songs.length)) {
      return;
    }

    return this.updatePlayList(event, songs);
  }

  private async findSongByArgumentType(
    argument: string,
    event: Message,
  ): Promise<void | SongData | SongData[]> {
    const argumentTypeDictionary = {
      mobil: {
        condition: argument.includes('youtu.be/'),
        route: this.findMusicByYouTubeMobileURL,
      },
      youtubePlayListURl: {
        condition: Boolean(
          argument.includes('youtube.com/playlist?list=') ||
            (argument.includes('youtube.com') && argument.includes('&list=')),
        ),
        route: this.findPlayListByYoutubeURL,
      },
      youtubeSongURL: {
        condition: argument.includes('youtube.com/watch?v='),
        route: this.findMusicByYouTubeURL,
      },
      spotifySong: {
        condition: argument.includes('spotify') && argument.includes('track'),
        route: this.findMusicBySpotifySongURL,
      },
      spotifyPlaylist: {
        condition: argument.includes('spotify') && argument.includes('playlist'),
        route: this.findMusicBySpotifyPlaylistURL,
      },
      songName: {
        //default
        condition: true,
        route: this.findMusicByName,
      },
    };

    const argumentType = Object.values(argumentTypeDictionary).find(
      value => value.condition,
    );

    return await argumentType?.route.call(event, argument);
  }

  private async updatePlayList(
    event: Message,
    songsData: SongData | SongData[],
  ): Promise<void> {
    if (event.member) {
      const newSongList: SongsToPlaylist = {
        newSongs: songsData,
        channel: event.channel,
        member: event.member,
      };

      this.playListHandler.update(newSongList);
    }
  }
}
