import { Message } from "discord.js";
import { ConnectionHandler } from "../../../../../database/connectionHandler";
import { PlaylistDTO } from "../../../../../database/playlist/domain/playlistDTO";
import { SongDTO } from "../../../../../database/song/domain/SongDTO";
import { Command } from "../../../../domain/interfaces/Command";
import { CommandSchema } from "../../../../domain/interfaces/commandSchema";
import { PaginatedMessage } from "../../../utils/paginatedMessage";
import { UsersUsingACommand } from "../../../utils/usersUsingACommand";

type SongDictionary = { [key: string]: SongDTO };

export class ShowPlaylistCommand extends Command {
  private privatePlaylist: boolean;

  constructor(
    private databaseConnection: ConnectionHandler,
    private usersUsingACommand: UsersUsingACommand
  ) {
    super();
  }

  public async call(
    event: Message,
    adminRole: string,
    showPlSchema: CommandSchema
  ): Promise<void> {
    if (this.roleAndCooldownValidation(event, showPlSchema, adminRole)) {
      return;
    }

    // reset parameters
    this.privatePlaylist = true;

    // if command was runed with guild, is mandatory admin role
    if (event.content.includes("guild")) {
      if (!this.checkAdminRole.call(event, adminRole)) {
        event.channel.send("Para esta accion es obligatorio el rol de admin");
        return;
      }
      this.privatePlaylist = false;
    }

    this.usersUsingACommand.updateUserList(event.author.id);

    await this.createMessageCollector(event);
  }

  private async createMessageCollector(event: Message) {
    const author = this.privatePlaylist ? event.author.id : event.guild!.id;

    const playListArray = await this.databaseConnection.playlist.getByAuthor(
      author
    );

    // if there are no playlist
    if (!playListArray.length) {
      this.usersUsingACommand.removeUserList(event.author.id);
      if (this.privatePlaylist) {
        return event.reply("No dispones de ninguna playlist.");
      } else {
        return event.reply("El servidor no dispone de ninguna playlist.");
      }
    }

    const { playListArrayString, songDictionary } = await this.mapPlaylistArray(
      playListArray
    );

    const paginatedPlaylistArrayMessage =
      await this.createPaginatedPlaylistArrayMessage(
        event,
        playListArrayString
      );

    const filter = (reaction: Message): boolean => {
      const userCondition = reaction.author.id === event.author.id;
      // number condition = write a number equal to the index of the role wanted
      const numberCondition =
        Number(reaction.content) <= playListArray.length &&
        Number(reaction.content) > 0;
      const letterCondition = ["x", "X"].includes(reaction.content);

      return userCondition && (numberCondition || letterCondition);
    };

    return event.channel
      .awaitMessages({ filter, time: 60000, max: 1, errors: ["time"] })
      .then(async (collected) => {
        const collectedMessage = collected.map((e: Message) => e);

        // delete response message
        await collectedMessage[0].delete();
        this.usersUsingACommand.removeUserList(event.author.id);

        if (["x", "X"].includes(collectedMessage[0].content)) {
          return;
        }

        await paginatedPlaylistArrayMessage
          .delete()
          .catch((err) =>
            console.log("Error deleting paginatedPlaylistArrayMessage:", err)
          );

        const playlistSelected =
          playListArray[Number(collectedMessage[0].content) - 1];
        return this.createPlayListDataMessage(
          event,
          playlistSelected,
          songDictionary
        );
      })
      .catch(async (err) => {
        this.usersUsingACommand.removeUserList(event.author.id);

        if (err instanceof Error) {
          console.log("Error in changeAdminRole collector: ", err);
          return err;
        }

        await event.reply("Time out");

        return;
      });
  }

  private async createPaginatedPlaylistArrayMessage(
    event: Message,
    playListArray: string[]
  ): Promise<Message<boolean>> {
    const userName = event.member?.nickname ?? event.author.username;

    return new PaginatedMessage({
      embed: {
        color: "#FFE4C4",
        title: `Playlist de: ${
          this.privatePlaylist ? userName : event.guild?.name
        }`,
        author: {
          name: `${userName}`,
          iconURL: `${event.member!.user.displayAvatarURL()}`,
        },
        description:
          "Escriba:\n" +
          "- El **numero** de la playlist que quiera ver \n" +
          "- **x** para cancelar",
      },
      pagination: {
        channel: event.channel,
        dataToPaginate: [...playListArray],
        dataPerPage: 9,
        timeOut: 60000,
        jsFormat: true,
        deleteWhenTimeOut: false,
        reply: false,
        closeButton: false,
        author: event.author,
      },
    }).call();
  }

  private async mapPlaylistArray(playListArray: PlaylistDTO[]): Promise<{
    playListArrayString: string[];
    songDictionary: SongDictionary;
  }> {
    const songDictionary = await this.createSongDictionary(playListArray);

    // numerated array of playlist created by this author
    const playListArrayString: string[] = playListArray.map(
      (playList: PlaylistDTO, i: number) => {
        const playlistDuration = this.calculatePlaylistDuration(
          playList.songsId,
          songDictionary
        );

        return (
          `${i + 1} - ${playList.name} 'Nº canciones:' ${
            playList.songsId.length
          }\n` + `     Duración: ${playlistDuration} \n\n`
        );
      }
    );

    return { playListArrayString, songDictionary };
  }

  private async createSongDictionary(
    playListArray: PlaylistDTO[]
  ): Promise<SongDictionary> {
    // this is only to make only 1 search to database, else I should make 1 search for each playlist
    const songIdInAllPlaylist: string[] = [];

    playListArray.forEach((playlist: PlaylistDTO) => {
      songIdInAllPlaylist.push(...playlist.songsId);
    });

    // delete repeated songs
    const songIdInAllPlaylistSet = new Set(songIdInAllPlaylist);

    const songArray = await this.databaseConnection.song.getById([
      ...songIdInAllPlaylistSet,
    ]);

    const songDictionary: SongDictionary = {};

    songArray.forEach((song: SongDTO) => {
      songDictionary[song.id] = song;
    });

    return songDictionary;
  }

  private calculatePlaylistDuration(
    soingsId: string[],
    songDictionary: SongDictionary
  ): string {
    const duration = {
      days: 0,
      hours: 0,
      mins: 0,
      seconds: 0,
    };

    soingsId.forEach((id: string) => {
      const song = songDictionary[id];
      duration.hours += song.duration.hours;
      duration.mins += song.duration.minutes;
      duration.seconds += song.duration.seconds;

      if (duration.seconds >= 60) {
        duration.seconds -= 60;
        duration.mins += 1;
      }

      if (duration.mins >= 60) {
        duration.mins -= 60;
        duration.hours += 1;
      }

      if (duration.hours >= 24) {
        duration.hours -= 24;
        duration.days += 1;
      }
    });

    if (duration.days !== 0) {
      return `${duration.hours}days ${duration.hours}h ${duration.mins}m ${duration.seconds}s`;
    }

    if (duration.hours !== 0) {
      return `${duration.hours}h ${duration.mins}m ${duration.seconds}s`;
    }

    if (duration.mins !== 0) {
      return `${duration.mins}m ${duration.seconds}s`;
    }

    return `${duration.seconds}s`;
  }

  private async createPlayListDataMessage(
    event: Message,
    playlistSelected: PlaylistDTO,
    songDictionary: SongDictionary
  ): Promise<Message<boolean>> {
    // numerated array of songs in the chosen playlist
    const songsString = playlistSelected.songsId.map(
      (id: string, i: number) => {
        const song = songDictionary[id];
        return `${i + 1} - ${song.name} '${song.duration.string}' \n`;
      }
    );

    const userName = event.member?.nickname ?? event.author.username;

    return new PaginatedMessage({
      embed: {
        color: "#FFE4C4",
        title: `${playlistSelected.name}`,
        author: {
          name: `${userName}`,
          iconURL: `${event.member!.user.displayAvatarURL()}`,
        },
        description:
          `Autor: **${
            this.privatePlaylist ? userName : event.guild?.name
          }** \n` + "Canciones:",
      },
      pagination: {
        channel: event.channel,
        dataToPaginate: [...songsString],
        dataPerPage: 10,
        timeOut: 60000,
        jsFormat: true,
        deleteWhenTimeOut: false,
        reply: false,
        closeButton: true,
        author: event.author,
      },
    }).call();
  }
}
