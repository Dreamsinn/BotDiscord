import { Message, MessageOptions } from "discord.js";
import { SongData } from "../../../../../domain/interfaces/song";
import { FindMusicByName } from "../../../../utils/findMusic/findMusicByName";
import { FindMusicBySpotifySongURL } from "../../../../utils/findMusic/findMusicBySpotifySongURL";
import { FindMusicByYouTubeMobileURL } from "../../../../utils/findMusic/findMusicByYouTubeMobileURL";
import { FindMusicByYouTubeURL } from "../../../../utils/findMusic/findMusicByYouTubeURL";
import { FindPlaylistBySpotifyURL } from "../../../../utils/findMusic/findPlaylistBySpotifyURL";
import { FindPlayListByYoutubeURL } from "../../../../utils/findMusic/findPlayListByYoutubeURL";
import { MessageCreator } from "../../../../utils/messageCreator";

export class AddSongsToPlaylist {
  constructor(
    private findMusicByName: FindMusicByName,
    private findMusicByYouTubeMobileURL: FindMusicByYouTubeMobileURL,
    private findPlayListByYoutubeURL: FindPlayListByYoutubeURL,
    private findMusicByYouTubeURL: FindMusicByYouTubeURL,
    private findMusicBySpotifySongURL: FindMusicBySpotifySongURL,
    private findMusicBySpotifyPlaylistURL: FindPlaylistBySpotifyURL
  ) {}

  async call(event: Message): Promise<SongData | SongData[] | void | Error> {
    const addSongToPlaylistEmbed = this.createDddSongToPlaylistEmbed(event);

    const addSongToPlaylistMessage = await event.channel.send(
      addSongToPlaylistEmbed
    );

    const filter = (reaction: Message): boolean => {
      return reaction.author.id === event.author.id;
    };

    return event.channel
      .awaitMessages({ filter, time: 60000, max: 1, errors: ["time"] })
      .then(async (collected) => {
        const collectedMessage = collected.map((e: Message) => e);

        // delete response message
        await collectedMessage[0].delete();
        await addSongToPlaylistMessage.delete().catch((err) => {
          console.log("Error deleting addSongToPlaylistMessage: ", err);
        });

        if (["x", "X"].includes(collectedMessage[0].content)) {
          return;
        }

        return this.findSongByArgumentType(collectedMessage[0].content, event);
      })
      .catch(async (err) => {
        if (err instanceof Error) {
          console.log("Error in changePrefix collector: ", err);
          return err;
        }

        await addSongToPlaylistMessage.delete().catch((err) => {
          console.log("Error deleting addSongToPlaylistMessage: ", err);
        });

        return;
      });
  }

  private createDddSongToPlaylistEmbed(event: Message): MessageOptions {
    const userName = event.member?.nickname ?? event.author.username;

    return new MessageCreator({
      embed: {
        color: "#d817ff",
        title: "Añadir canciones a la playlist:",
        description:
          "Escriba:\n" +
          "- El nombre o la URL de la playlist o cancion que quiera añadir.\n" +
          "- **x** para cancelar",
        author: {
          name: `${userName}`,
          iconURL: `${event.member?.user.displayAvatarURL()}`,
        },
      },
      buttons: [],
    }).call();
  }

  private async findSongByArgumentType(
    argument: string,
    event: Message
  ): Promise<void | SongData | SongData[]> {
    const argumentTypeDictionary = {
      mobil: {
        condition: argument.includes("youtu.be/"),
        route: this.findMusicByYouTubeMobileURL,
      },
      youtubePlayListURl: {
        condition: Boolean(
          argument.includes("youtube.com/playlist?list=") ||
            (argument.includes("youtube.com") && argument.includes("&list="))
        ),
        route: this.findPlayListByYoutubeURL,
      },
      youtubeSongURL: {
        condition: argument.includes("youtube.com/watch?v="),
        route: this.findMusicByYouTubeURL,
      },
      spotifySong: {
        condition: argument.includes("spotify") && argument.includes("track"),
        route: this.findMusicBySpotifySongURL,
      },
      spotifyPlaylist: {
        condition:
          argument.includes("spotify") && argument.includes("playlist"),
        route: this.findMusicBySpotifyPlaylistURL,
      },
      songName: {
        //default
        condition: true,
        route: this.findMusicByName,
      },
    };

    const argumentType = Object.values(argumentTypeDictionary).find(
      (value) => value.condition
    );

    return await argumentType?.route.call(event, argument);
  }
}
