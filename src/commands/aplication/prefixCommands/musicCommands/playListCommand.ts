import { DiscordRequestRepo } from "../../../domain/interfaces/discordRequestRepo";
import { PlayListCommandSchema } from "../../../domain/commandSchema/playListCommandSchema";
import { PlayListHandler } from "../../playListHandler"
import { CoolDown } from "../../utils/coolDown";
import { Command } from "../../Command";
import { discordEmojis } from "../../../domain/discordEmojis"
import { playListRepository } from '../../../domain/interfaces/playListRepository'
import { MessageEmbed } from 'discord.js';
import { CommandOutput } from "../../../domain/interfaces/commandOutput";


export class PlayListCommand extends Command {
    private playListSchema: DiscordRequestRepo = PlayListCommandSchema;
    private coolDown = new CoolDown();
    private playListHandler: PlayListHandler;
    private page = 0;
    private playListPages;

    constructor(
        playListHandler: PlayListHandler,
    ) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event) {
        //comprobar coolDown
        const interrupt = this.coolDown.call(this.playListSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown')
            return;
        }

        // conseguimos la playList
        const playList: playListRepository[] = this.playListHandler.readPlayList()

        // si esta vacia
        if (!playList[0]) {
            return event.channel.send('There is not a playlist')
        }

        // inializamos si no lo esta, y si lo esta se reinicia
        this.playListPages = [];

        // la partimos en grupos de 10, para la paginacion
        while (playList.length > 0) {
            this.playListPages.push(playList.splice(0, 10))
        }


        const embed = this.createPlayListEmbed()

        const output: CommandOutput = {
            embeds: [embed],
        }

        //  si solo hay una pagina, se acaba
        if (!(this.playListPages.length > 1)) {
            return event.reply(output)
        }

        const message = await event.channel.send(output)

        return this.messageReaction(message)
    }

    private createPlayListEmbed() {
        let songsInThePage = '```js\n';
        for (let i = 0; this.playListPages[this.page].length > i; i++) {
            // songNumber -> pagina 0 = 0, 1 = 10, etc, el cual le sumaremos el indice del cancion el pagina 0 + 1 = 1,...
            const songNumber = this.page * 10;
            songsInThePage += `${songNumber + i + 1} - ${this.playListPages[this.page][i].songName} \'${this.playListPages[this.page][i].duration.string}\'\n`
        }
        songsInThePage += '```'

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Playlist')
            .addFields(
                { name: `Page [${this.page + 1}/${this.playListPages.length}]`, value: `${songsInThePage}` },
            )

        return embed;
    }

    private messageReaction(message: any) {
        message.react(discordEmojis["<-"])
        message.react(discordEmojis["->"])
        message.react(discordEmojis.x)

        const filter = (reaction: any, user: any) => {
            return [discordEmojis["<-"], discordEmojis["->"], discordEmojis.x].includes(reaction.emoji.name) && user.bot !== true;
        };

        const collector = message.createReactionCollector({ filter, time: 60000 })
        collector.on('collect', (collected, user) => {
            if (collected._emoji.name === discordEmojis.x) {
                // kill collector
                return collector.stop()
            }
            return this.reactionHandler(message, collected, user)
        });

        collector.on('end', () => {
            console.log(`Time Out`);
            return
        });

    }

    private reactionHandler(message: any, collected: any, user: any) {
        // eleminamos la reaccion
        this.deleteUserReaction(message, user)

        const maxPage = this.playListPages.length - 1;
        let pageChanged: boolean;
        const emoji = collected._emoji.name
        // si se ha tirado hacia atras, y la pagina es superior a 0: disminuimos pagina
        if (emoji === discordEmojis["<-"] && this.page > 0) {
            pageChanged = true;
            this.page--;
        }
        // si se ha tiarado hacia delante, y la pagina es inferior a la pagina maxima: aumentamos pagina
        if (emoji === discordEmojis["->"] && this.page < maxPage) {
            pageChanged = true;
            this.page++;
        }

        // si se ha cambiado la pagina
        if (pageChanged) {
            const embed = this.createPlayListEmbed()

            const output: CommandOutput = {
                embeds: [embed],
            }
            message.edit(output)
        }
    }

    private async deleteUserReaction(message: any, user: any) {
        const userReactions = message.reactions.cache.filter(reaction => reaction.users.cache.has(user.id));

        try {
            userReactions.map(async (reaction) => await reaction.users.remove(user.id))
        } catch (error) {
            console.error('Failed to remove reactions.');
        }
    }
}