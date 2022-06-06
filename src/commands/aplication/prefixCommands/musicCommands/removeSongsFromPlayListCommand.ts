import { CommandSchema } from "../../../domain/interfaces/commandSchema";
import { RemoveSongsFromPlayListCommandSchema } from "../../../domain/commandSchema/removeSongsFromPlayListCommandSchema";
import { PlayListHandler } from "../../playListHandler"
import { CoolDown } from "../../utils/coolDown";
import { Command } from "../../Command";
import { PlayListCommand } from "./playListCommand";
import { UsersUsingACommand } from "../../utils/usersUsingACommand"
import { Message, MessageOptions } from 'discord.js';
import { MessageCreator } from "../../utils/messageCreator";
import { songData } from "../../../domain/interfaces/songData";



export class RemoveSongsFromPlayListCommand extends Command {
    private removeSchema: CommandSchema = RemoveSongsFromPlayListCommandSchema;
    private coolDown = new CoolDown();
    private playListHandler: PlayListHandler;
    private usersUsingACommand = UsersUsingACommand.usersUsingACommand;

    constructor(
        playListHandler: PlayListHandler,
    ) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event: Message): Promise<Message> {
        //comprobar coolDown
        const interrupt = this.coolDown.call(this.removeSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown')
            return;
        }

        // detecta y modifica el mensaje de PlayListCommand
        this.detectPlayListCommandMessage(event)

        // executamos PlayListCommand para tener la paginacion 
        new PlayListCommand(this.playListHandler).call(event);

        // usuario no pueda ejecutar otros comandos antes que se 
        this.usersUsingACommand.updateUserList(event.author.id)

        const playList = this.playListHandler.readPlayList();
        const lastSongIndex = playList.length;

        // deteta siguiente mensaje del usuario
        const filter = (message: Message) => {
            const userConditions = event.author.id === message.author.id;
            const numbersArray = message.content.split(",");
            const numbersConditions = (!numbersArray.find((n) => isNaN(Number(n))) && Math.max(Number(...numbersArray)) <= lastSongIndex && Math.min(Number(...numbersArray)) >= 1);
            const letterConditoin = (message.content === 'x' || message.content === 'X');

            // si la respuesta viene del mismo que el evento, todos son numeros, mayot que 0 y no mayor que el numero de items, o X
            return userConditions && (numbersConditions || letterConditoin);
        };

        event.channel.awaitMessages({ filter, time: 60000, max: 1, errors: ['time'] })
            .then((collected) => {
                // usuario ya puede usar otros comandos
                this.usersUsingACommand.removeUserList(event.author.id)
                let collectedMessage: Message;
                collected.map((e: Message) => collectedMessage = e);

                if (collectedMessage.content === 'x' || collectedMessage.content === 'X') {
                    // cancela el comando
                    console.log('Remove command cancelled')
                    event.channel.send('Remove command cancelled')
                    return
                }

                const output = this.removeSongFromPlayList(collectedMessage.content, event)

                return event.channel.send(output)
            })
            .catch((err) => {
                if (err instanceof TypeError) {
                    console.log(err)
                    event.channel.send(`Error: ${err.message}`)
                } else {
                    event.reply('Time out')
                }

                this.usersUsingACommand.removeUserList(event.author.id)
                return;
            })

    }

    private detectPlayListCommandMessage(event: Message) {
        const filter = (message: Message) => {
            return message.embeds[0].title === 'Playlist' && message.author.bot;
        };

        // Cambia el titulo del embed original y le pone una descripcion
        const collector = event.channel.createMessageCollector({ filter, max: 1, time: 5000 });
        collector.on('collect', message => {
            const newEmbed = message.embeds[0]
            newEmbed.setTitle('Remove song from playlist')
            newEmbed.setDescription('Write - X - to cancel operation');
            const output: MessageOptions = {
                embeds: [newEmbed],
            }
            message.edit(output)
        });
    }

    private removeSongFromPlayList(content: string, event: Message) {
        // pasa a playListHandler el indice(-1) de las canciones
        const stringNumbersArray = content.split(",");

        const numberArray: number[] = [];

        stringNumbersArray.forEach(str => {
            let n = Number(str);
            if (n !== 0) {
                numberArray.push(Number(str));
            }
        });
        // recive las canciones borradas 
        const removedMusic = this.playListHandler.removeSongsFromPlayList(numberArray);
        // hace embed de las canciones borradas
        return this.removedMusicEmbed(removedMusic, event)
    }

    private removedMusicEmbed(removedMusic: songData[], event: Message) {
        let removedMusicString = '';

        removedMusic.forEach((song) => {
            removedMusicString += `${song.songName}\n`
        })

        // TODO paginar
        const output = new MessageCreator({
            embed: {
                color: 'ORANGE',
                author: { name: `${event.member.user.username}`, iconURL: `${event.member.user.displayAvatarURL()}` },
                field: {
                    name: `Songs removeds from Playlist`,
                    value: removedMusicString,
                    inline: false
                }
            }
        }).call()

        return output;
    }
}