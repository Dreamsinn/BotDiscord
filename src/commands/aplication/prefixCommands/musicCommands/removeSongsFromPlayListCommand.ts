import { DiscordRequestRepo } from "../../../domain/interfaces/discordRequestRepo";
import { RemoveSongsFromPlayListCommandSchema } from "../../../domain/commandSchema/removeSongsFromPlayListCommandSchema";
import { PlayListHandler } from "../../playListHandler"
import { CoolDown } from "../../utils/coolDown";
import { Command } from "../../Command";
import { PlayListCommand } from "./playListCommand";
import { UsersUsingACommand } from "../../utils/usersUsingACommand"
import { CommandOutput } from "../../../domain/interfaces/commandOutput";
import { MessageEmbed } from 'discord.js';



export class RemoveSongsFromPlayListCommand extends Command {
    private removeSchema: DiscordRequestRepo = RemoveSongsFromPlayListCommandSchema;
    private coolDown = new CoolDown();
    private playListHandler: PlayListHandler;
    private usersUsingACommand = UsersUsingACommand.usersUsingACommand;

    constructor(
        playListHandler: PlayListHandler,
    ) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event) {
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
        const filter = (message) => {
            const userConditions = event.author.id === message.author.id;
            const numbersArray = message.content.split(",");
            const numbersConditions = (!numbersArray.find((n) => isNaN(n)) && Math.max(Number(...numbersArray)) <= lastSongIndex && Math.min(Number(...numbersArray)) >= 1);
            const letterConditoin = (message.content === 'x' || message.content === 'X');

            // si la respuesta viene del mismo que el evento, todos son numeros, mayot que 0 y no mayor que el numero de items, o X
            return userConditions && (numbersConditions || letterConditoin);
        };

        event.channel.awaitMessages({ filter, time: 60000, max: 1, errors: ['time'] })
            .then((collected: any) => {
                // usuario ya puede usar otros comandos
                this.usersUsingACommand.removeUserList(event.author.id)
                let collectedMessage: any;
                collected.map((e: any) => collectedMessage = e);

                if (collectedMessage.content === 'x' || collectedMessage.content === 'X') {
                    // cancela el comando
                    console.log('Remove command cancelled')
                    event.channel.send('Remove command cancelled')
                    return
                }

                const embed = this.removeSongFromPlayList(collectedMessage.content, event)

                const output: CommandOutput = {
                    embeds: [embed],
                }

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

    private detectPlayListCommandMessage(event: any) {
        const filter = (message: any) => {
            return message.embeds[0].title === 'Playlist' && message.author.bot;
        };

        // Cambia el titulo del embed original y le pone una descripcion
        const collector = event.channel.createMessageCollector({ filter, max: 1, time: 5000 });
        collector.on('collect', message => {
            const newEmbed = message.embeds[0]
            newEmbed.setTitle('Remove song from playlist')
            newEmbed.setDescription('Write - X - to cancel operation', false);
            const output: CommandOutput = {
                embeds: [newEmbed],
            }
            message.edit(output)
        });
    }

    private removeSongFromPlayList(content: string, event: any) {
        // pasa a playListHandler el indice(-1) de las canciones
        const stringNumbersArray = content.split(",");

        const numberArray = [];

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

    private removedMusicEmbed(removedMusic, event) {
        let removedMusicString = '';

        removedMusic.forEach((song) => {
            removedMusicString += `${song.songName}\n`
        })

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setAuthor({ name: `${event.member.user.username}`, iconURL: `${event.member.user.displayAvatarURL()}` })
            .addFields(
                { name: `Songs removeds from Playlist`, value: `${removedMusicString}` },
            )

        return embed;
    }
}