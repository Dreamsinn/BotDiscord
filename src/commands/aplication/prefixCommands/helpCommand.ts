import { MessageEmbed } from 'discord.js';
import {HelpCommandSchema} from '../../domain/commandSchema/helpCommandSchema'
import {DiscordRequestRepo} from "../../domain/interfaces/discordRequestRepo";
import {CoolDown} from "../utils/coolDown"
import {CommandOutput} from "../../domain/interfaces/commandOutput"
import { Command } from '../Command';
import { PlayCommandSchema } from '../../domain/commandSchema/playCommandSchema';
import { PlayListCommandSchema } from '../../domain/commandSchema/playListCommandSchema';
import { DiceCommandSchema } from '../../domain/commandSchema/diceCommandSchema';
import { ReplyCommandSchema } from '../../domain/commandSchema/replyCommandSchema';

export class HelpCommand  extends Command {
    // TODO, poner schemas como dependencias?
    helpSchema: DiscordRequestRepo = HelpCommandSchema;
    coolDown = new CoolDown();

    public async call (event): Promise<CommandOutput>{
        console.log('help command')
        // coolDown
        const interrupt = this.coolDown.call(this.helpSchema.coolDown);
        if(interrupt === 1){
            console.log('command interrupted by cooldown')
            return
        }

        // construir mensaje
        const embed = this.createTypeOfCommandsEmbed();

        const output: CommandOutput = {
            embeds: [embed],
        }
        const message = await event.reply(output)

        // crear botones de reaccion
        this.messageReaction(message, event, 'typeOFCommand')
    }

    private createTypeOfCommandsEmbed(){
        const embedContent = Object.entries(typesOfCommands).map((typeCommand, i) => this.mapTypeCommandsAddFiledsEmbed(typeCommand, i));

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`Tipos de comandos`)
            // .setDescription(`1 - Commandos con prefijo\n` + `2 - Commando de dado\n` + `3 - Commando de respuesta\n`)
            .addFields( embedContent
                // [
                // {name: '\u200b', value: '1 - Commandos con prefijo', inline: false},
                // {name: '\u200b', value: '2 - Commando de dado', inline: false},
                // {name: '\u200b', value: '3 - Commando de respuesta', inline: false}
                // ]
            )

        return embed;
    }

    private mapTypeCommandsAddFiledsEmbed(typeCommand, index) {
            return {name: '\u200b', value: `${index + 1} - ${typeCommand[1].typeDescription}`, inline: false}
    }

    private messageReaction(message, event, type){
        let dataLength: number;
        // determinar cuando se ha ejecutado el metodo
        if(type === 'typeOFCommand'){
            dataLength = Object.keys(typesOfCommands).length
        }
        if(type === 'prefix'){
            message.reactions.removeAll()
            dataLength = Object.keys(typesOfCommands.prefixCommand).length -1
        }

        // crear reaccion
        for(let i = 0; i < dataLength; i++){
                message.react(numberEmojis[i])
            }
            // message.react('1️⃣')
            // message.react('2️⃣')
            // message.react('3️⃣')

        // detectar cuando el usuario reaciona
        const filter = (reaction, user) => {
            return  numberEmojis.find(e => e === reaction.emoji.name) && user.id === event.author.id;
        };

        message.awaitReactions({ filter, max: 1, time: 20000, errors: ['time'] })
            .then(collected => this.createCommandsEmbed(collected, message, event))
            .catch(collected => {
                console.log(`No reaction`);
                return
            });
    }

    private async createCommandsEmbed(collected: any, message: any, event){
        // determinar a que ha reaccionado
        const typeCommand = this.commandSelected(collected, message)
        let embed;
        let needReaction: boolean;
        if(typeCommand[0] === 'prefixCommand'){
            needReaction = true;
            embed = this.createPrefixTypeEmbed()
        } else {
            // crear embed de comando
            embed = this.createCommandEmbed(typeCommand, message)
        }

        const output: CommandOutput = {
            embeds: [embed],
        }

        await message.edit(output)
        // const newMessage = await event.reply(output)

        if(needReaction){
            this.messageReaction(message, event, 'prefix')
        }
    }

    private commandSelected(collected: any, message: any) {
        let emoji: string;
        collected.map(d => emoji = d._emoji.name)

        const arrayIndex = numberEmojis.findIndex(e => e === emoji)

        if(message.embeds[0].title === 'Tipos de comandos'){
            return Object.entries(typesOfCommands)[arrayIndex]
        }
        if(message.embeds[0].title === `${typesOfCommands.prefixCommand.typeDescription}`){
            const prefixCommands = typesOfCommands.prefixCommand
            return Object.entries(prefixCommands)[arrayIndex + 1]
        }
    }

    private createPrefixTypeEmbed() {
        const embedContent = [];
        for(let i = 0; i < Object.entries(typesOfCommands.prefixCommand).length; i++){
            // el 0 seria typeDescription: 'Commandos con prefijo',
            if (i != 0){
                const typeCommand = Object.entries(typesOfCommands.prefixCommand)[i];
                embedContent.push(this.mapTypeCommandsAddFiledsEmbed(typeCommand, (i -1)))
            }
        }

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${typesOfCommands.prefixCommand.typeDescription}`)
            .setDescription(`Estos comandos requieren de '${process.env.PREFIX}' antes del alias`)
            .addFields(
                embedContent
            )

        return embed;
    }

    private createCommandEmbed(typeCommand, message) {
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${typeCommand[1].typeDescription}`)
            .setDescription(`El alias es la parte necesaria para llamar a un comando`)
            .addFields(
                // {name: 'Nombre', value: `${typeCommand[1].name}`, inline: false},
                {name: 'Descripcion', value: `${typeCommand[1].description}`, inline: false},
                {name: 'Alias', value: `${typeCommand[1].aliases}`, inline: false},
                {name: 'Cooldown', value: `${typeCommand[1].coolDown} ms`, inline: false},
            )

        return embed;
    }
}

const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']

const typesOfCommands = {
    prefixCommand: {
        typeDescription: 'Commandos con prefijo',
        helpCommand: {
            typeDescription: 'Commando de ayuda',
            name: HelpCommandSchema.name,
            description: HelpCommandSchema.description,
            aliases: HelpCommandSchema.aliases,
            coolDown: HelpCommandSchema.coolDown,
        },
        playCommand: {
            typeDescription: 'Commando de play',
            name: PlayCommandSchema.name,
            description: PlayCommandSchema.description,
            aliases: PlayCommandSchema.aliases,
            coolDown: PlayCommandSchema.coolDown,
        },
        playListCommand: {
            typeDescription: 'Commando de playList',
            name: PlayListCommandSchema.name,
            description: PlayListCommandSchema.description,
            aliases: PlayListCommandSchema.aliases,
            coolDown: PlayListCommandSchema.coolDown,
        },
    },
    diceCommand:{
        typeDescription: 'Commando de dados',
        name: DiceCommandSchema.name,
        description: DiceCommandSchema.description,
        aliases: DiceCommandSchema.aliases,
        coolDown: DiceCommandSchema.coolDown,
    },
    replyCommand:{
        typeDescription: 'Commando de respuesta',
        name: ReplyCommandSchema.name,
        description: ReplyCommandSchema.description,
        aliases: ReplyCommandSchema.aliases,
        coolDown: ReplyCommandSchema.coolDown,
    },
}