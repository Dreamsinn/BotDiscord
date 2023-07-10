import { Message } from "discord.js";
import { SongData } from "../../../../../domain/interfaces/song";
import { PaginatedMessage } from "../../../../utils/paginatedMessage";

export class RemoveSongsFromPlayList {
  private returnSongsToRemove: boolean;

  public async call(
    event: Message,
    playList: SongData[],
    returnSongsToRemove = false
  ): Promise<SongData[] | void | Error> {
    if (!playList[0]) {
      event.channel.send("No hay canciones en la lista");
      return;
    }

    this.returnSongsToRemove = returnSongsToRemove;

    const removeSongsFromPlaylistMessage =
      await this.createRemoveSongsFromPlatlistMessage(event, playList);

    const lastSongIndex = playList.length;

    const filter = (message: Message) => {
      const userConditions = event.author.id === message.author.id;
      const numbersArray = message.content.split(",");
      const numbersConditions =
        !numbersArray.find((n) => isNaN(Number(n))) &&
        Math.max(Number(...numbersArray)) <= lastSongIndex &&
        Math.min(Number(...numbersArray)) >= 1;
      const letterConditoin =
        message.content === "x" || message.content === "X";

      // si la respuesta viene del mismo que el evento, todos son numeros, mayot que 0 y no mayor que el numero de items, o X
      return userConditions && (numbersConditions || letterConditoin);
    };

    return event.channel
      .awaitMessages({ filter, time: 60000, max: 1, errors: ["time"] })
      .then(async (collected) => {
        const collectedMessage = collected.map((e: Message) => e);

        // delete response message
        await collectedMessage[0].delete();
        await removeSongsFromPlaylistMessage.delete().catch((err) => {
          console.log("Error deleting removeSongsFromPlaylistMessage: ", err);
        });

        if (["x", "X"].includes(collectedMessage[0].content)) {
          return;
        }

        if (this.returnSongsToRemove) {
          return this.songsToRemoveFromPlaylist(
            collectedMessage[0].content,
            playList
          );
        } else {
          return this.removeSongFromPlayList(
            collectedMessage[0].content,
            playList
          );
        }
      })
      .catch(async (err) => {
        if (err instanceof Error) {
          console.log("Error in changePrefix collector: ", err);
          return err;
        }

        await removeSongsFromPlaylistMessage.delete().catch((err) => {
          console.log("Error deleting removeSongsFromPlaylistMessage: ", err);
        });

        return;
      });
  }

  private async createRemoveSongsFromPlatlistMessage(
    event: Message,
    playList: SongData[]
  ) {
    const playListString: string[] = playList.map(
      (song: SongData, i: number) => {
        return `${i + 1} - ${song.songName} '${song.duration.string}'\n`;
      }
    );

    const userName = event.member?.nickname ?? event.author.username;

    return new PaginatedMessage({
      embed: {
        color: "#d817ff",
        title: "Remove songs from playlist:",
        author: {
          name: `${userName}`,
          iconURL: `${event.member!.user.displayAvatarURL()}`,
        },
        description:
          "Escriba:\n" +
          '- Los **numeros** de las canciones que quiera eliminar separados por  " **,** " \n' +
          "- **x** para cancelar",
      },
      pagination: {
        channel: event.channel,
        dataToPaginate: [...playListString],
        dataPerPage: 10,
        timeOut: 60000,
        jsFormat: true,
        deleteWhenTimeOut: false,
        reply: false,
        closeButton: false,
        author: event.author,
      },
    }).call();
  }

  private songsToRemoveFromPlaylist(
    content: string,
    playList: SongData[]
  ): SongData[] {
    const stringOfNumbersArray = content.split(",");

    const songsIndex = stringOfNumbersArray.map((str) => Number(str));

    // hace una array con las canciones selecionas
    return playList.filter((n, i) => songsIndex.includes(i + 1));
  }

  private removeSongFromPlayList(
    content: string,
    playList: SongData[]
  ): SongData[] {
    const stringOfNumbersArray = content.split(",");

    const songsIndex = stringOfNumbersArray.map((str) => Number(str));

    // hace una array sin las canciones selecionas
    return playList.filter((n, i) => !songsIndex.includes(i + 1));
  }
}
