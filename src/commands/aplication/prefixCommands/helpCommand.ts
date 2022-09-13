import { EmbedFieldData, Message } from 'discord.js';
import { ClearPlayListCommandSchema } from '../../domain/commandSchema/clearPlayListCommandSchema';
import { DiceCommandSchema } from '../../domain/commandSchema/diceCommandSchema';
import { DiceCommandTogglerSchema } from '../../domain/commandSchema/diceCommandTogglerSchema';
import { DisconnectCommandSchema } from '../../domain/commandSchema/disconnectCommandSchema';
import { DisplayPlayListCommandSchema } from '../../domain/commandSchema/displayPlayListCommandSchema';
import { HelpCommandSchema } from '../../domain/commandSchema/helpCommandSchema';
import { JoinChannelCommandSchema } from '../../domain/commandSchema/joinChannelCommandSchema';
import { LoopPlayListModeCommandSchema } from '../../domain/commandSchema/loopPlayListModeCommandSchema';
import { PauseCommandSchema } from '../../domain/commandSchema/pauseCommandSchema';
import { PlayCommandSchema } from '../../domain/commandSchema/playCommandSchema';
import { PlayListCommandSchema } from '../../domain/commandSchema/playListCommandSchema';
import { RemoveSongsFromPlayListCommandSchema } from '../../domain/commandSchema/removeSongsFromPlayListCommandSchema';
import { ReplyCommandSchema } from '../../domain/commandSchema/replyCommandSchema';
import { ReplyCommandTogglerSchema } from '../../domain/commandSchema/replyCommandTogglerSchema';
import { ShufflePlayListCommandSchema } from '../../domain/commandSchema/shufflePlayListCommandSchema';
import { SkipMusicCommandSchema } from '../../domain/commandSchema/skipMusicCommandSchema';
import { CommandsCategoryEnum } from '../../domain/enums/commandsCategoryEnum';
import { HelpEmbedsTitlesEnum } from '../../domain/enums/helpEmbedsTitlesEnum';
import { Command } from '../../domain/interfaces/Command';
import { CommandSchema } from '../../domain/interfaces/commandSchema';
import { EmbedOptions } from '../../domain/interfaces/createEmbedOptions';
import { HelpCommandData } from '../../domain/interfaces/helpCommandData';
import { CoolDown } from '../utils/coolDown';
import { MessageCreator } from '../utils/messageCreator';
import { UsersUsingACommand } from '../utils/usersUsingACommand';
import { CheckDevRole } from '../utils/checkDevRole';

export class HelpCommand extends Command {
    // TODO, poner schemas como dependencias?
    private helpSchema: CommandSchema = HelpCommandSchema;
    private coolDown = new CoolDown();
    private checkDevRole = new CheckDevRole();
    private commandList = {
        prefix: prefixCommandList,
        nonPrefix: nonPrefixCommandList,
        music: musicCommandList,
    };
    private usersUsingACommand = UsersUsingACommand.usersUsingACommand;

    public async call(event: Message) {
        //role check
        if(this.helpSchema.devOnly){
            const interrupt = this.checkDevRole.call(event)
            if(!interrupt){
                return
            }
        }

        console.log('help command');
        // coolDown
        const interrupt = this.coolDown.call(this.helpSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown');
            return;
        }
        // creamos embed para elejir entre comandos de prfijo o no prefijo, y lo enviamos
        const output = this.createTypeOfCommandsEmbed();

        const typeCommandMessage = await event.channel.send(output);

        return this.messageResponseListener(typeCommandMessage, event, HelpEmbedsTitlesEnum.TYPES);
    }

    private createTypeOfCommandsEmbed() {
        const output = new MessageCreator({
            embed: {
                color: '#BFFF00',
                title: HelpEmbedsTitlesEnum.TYPES,
                fields: [
                    { name: '\u200b', value: `**1 - ${HelpEmbedsTitlesEnum.PREFIX}**`, inline: false },
                    {
                        name: '\u200b',
                        value: `**2 - ${HelpEmbedsTitlesEnum.NONPREFIX}**`,
                        inline: false,
                    },
                ],
                field: {
                    name: '\u200b',
                    value:
                        'Escriba: \n- El número del tipo de comando que desee consultar.\n' +
                        '- X para cancelar el comando. __Mientras help este activo no podra usar otro comando.__',
                    inline: false,
                },
            },
        }).call();

        return output;
    }

    private messageResponseListener(helpEmbed: Message, event: Message, typeOfEmbed: string) {
        // usuario en la lista de no poder usar comandos
        this.usersUsingACommand.updateUserList(event.author.id);

        const filter = (reaction: Message) => {
            const authorCondition = event.author.id === reaction.author.id;

            // el primer embed de todos no tiene 'b', porque no puede ir para atras
            let letterCondition = ['x', 'X', 'b', 'B', 'back', 'BACK'].includes(reaction.content);
            if (typeOfEmbed === HelpEmbedsTitlesEnum.TYPES) {
                letterCondition = ['x', 'X'].includes(reaction.content);
            }
            // los embeds con la descripcion de comandos no tienen condicion numerica, porque no tienen que elegir nada llegado el punto
            if (
                typeOfEmbed === HelpEmbedsTitlesEnum.TYPES ||
                typeOfEmbed === HelpEmbedsTitlesEnum.PREFIX ||
                typeOfEmbed === HelpEmbedsTitlesEnum.MUSIC ||
                typeOfEmbed === HelpEmbedsTitlesEnum.NONPREFIX
            ) {
                const numberCondition =
                    Number(reaction.content) <= helpEmbed.embeds[0].fields.length &&
                    Number(reaction.content) > 0;
                return authorCondition && (letterCondition || numberCondition);
            }

            return authorCondition && letterCondition;
        };

        event.channel
            .awaitMessages({ filter, time: 60000, max: 1, errors: ['time'] })
            .then(async (collected) => {
                // eliminamos a la persona de la lista de no poder usar comandos
                this.usersUsingACommand.removeUserList(event.author.id);
                let collectedMessage: Message;
                collected.map((e: Message) => (collectedMessage = e));

                collectedMessage.delete();
                // quitamos usuario de la lista de no poder usar comandos
                this.usersUsingACommand.removeUserList(event.author.id);

                // Si se responde una X se borra el mensaje
                if (['x', 'X'].includes(collectedMessage.content)) {
                    console.log('Help Command cancelled');
                    event.reply('Help Command ha expirado');

                    return;
                }
                // ir al embed anterior
                if (['b', 'B', 'back', 'BACK'].includes(collectedMessage.content)) {
                    return this.findPreviousEmbed(helpEmbed, event, typeOfEmbed);
                }
                // ir al siguiente embed
                return this.findNextEmbedToCreate(collectedMessage, helpEmbed, event);
            })
            .catch((err) => {
                if (err instanceof TypeError) {
                    console.log(err);
                    event.channel.send(`Error: ${err.message}`);
                } else {
                    // sino contesta
                    console.log(`Help Command time out`);
                    event.reply('Time out');
                }
                // quitamos usuario de la lista de no poder usar comandos
                this.usersUsingACommand.removeUserList(event.author.id);

                return;
            });
    }

    private async findPreviousEmbed(helpEmbed: Message, event: Message, typeOfEmbed: string) {
        // creamos el embed anterior, lo enviamos y le escuchamos la respuesta
        if (
            typeOfEmbed === HelpEmbedsTitlesEnum.PREFIX ||
            typeOfEmbed === HelpEmbedsTitlesEnum.NONPREFIX
        ) {
            const output = this.createTypeOfCommandsEmbed();
            const message = await helpEmbed.edit(output);
            return this.messageResponseListener(message, event, HelpEmbedsTitlesEnum.TYPES);
        }

        if (typeOfEmbed === HelpEmbedsTitlesEnum.MUSIC) {
            const prefixOutput = this.createSubTypeCommandsEmbed(CommandsCategoryEnum.PREFIX);
            const prefixMessage = await helpEmbed.edit(prefixOutput);
            return this.messageResponseListener(prefixMessage, event, HelpEmbedsTitlesEnum.PREFIX);
        }

        if (typeOfEmbed === CommandsCategoryEnum.PREFIX) {
            const prefixOutput = this.createSubTypeCommandsEmbed(CommandsCategoryEnum.PREFIX);
            const prefixMessage = await helpEmbed.edit(prefixOutput);
            return this.messageResponseListener(prefixMessage, event, HelpEmbedsTitlesEnum.PREFIX);
        }

        if (typeOfEmbed === CommandsCategoryEnum.NONPREFIX) {
            const nonPrefixOutput = this.createSubTypeCommandsEmbed(CommandsCategoryEnum.NONPREFIX);
            const nonPrefixMessage = await helpEmbed.edit(nonPrefixOutput);
            return this.messageResponseListener(nonPrefixMessage, event, HelpEmbedsTitlesEnum.NONPREFIX);
        }

        if (typeOfEmbed === CommandsCategoryEnum.MUSIC) {
            const prefixOutput = this.createSubTypeCommandsEmbed(CommandsCategoryEnum.MUSIC);
            const prefixMessage = await helpEmbed.edit(prefixOutput);
            return this.messageResponseListener(prefixMessage, event, HelpEmbedsTitlesEnum.MUSIC);
        }
    }

    private async findNextEmbedToCreate(collectedMessage: Message, helpEmbed: Message, event: Message) {
        // creamos el embed selecionado, lo enviamos y le escuchamos la respuesta
        if (helpEmbed.embeds[0].title === HelpEmbedsTitlesEnum.TYPES) {
            if (collectedMessage.content === '1') {
                const prefixOutput = this.createSubTypeCommandsEmbed(CommandsCategoryEnum.PREFIX);
                const prefixMessage = await helpEmbed.edit(prefixOutput);
                return this.messageResponseListener(prefixMessage, event, HelpEmbedsTitlesEnum.PREFIX);
            }

            if (collectedMessage.content === '2') {
                const nonPrefixOutput = this.createSubTypeCommandsEmbed(CommandsCategoryEnum.NONPREFIX);
                const nonPrefixMessage = await helpEmbed.edit(nonPrefixOutput);
                return this.messageResponseListener(
                    nonPrefixMessage,
                    event,
                    HelpEmbedsTitlesEnum.NONPREFIX,
                );
            }
        }

        if (helpEmbed.embeds[0].title === HelpEmbedsTitlesEnum.PREFIX) {
            if (collectedMessage.content === '1') {
                const musicOutput = this.createSubTypeCommandsEmbed(CommandsCategoryEnum.MUSIC);
                const musicMessage = await helpEmbed.edit(musicOutput);
                return this.messageResponseListener(musicMessage, event, HelpEmbedsTitlesEnum.MUSIC);
            }
        }

        const { output, category } = this.createCommandEmbed(
            helpEmbed,
            Number(collectedMessage.content),
        );
        const commandMessage = await helpEmbed.edit(output);
        return this.messageResponseListener(commandMessage, event, category);
    }

    private createSubTypeCommandsEmbed(commandCategory: string) {
        let index = 0;
        const embedFileds: EmbedFieldData[] = [];
        let title: string;

        if (commandCategory === CommandsCategoryEnum.PREFIX) {
            title = HelpEmbedsTitlesEnum.PREFIX;
            index += 1;
            embedFileds.push({
                name: '\u200b',
                value: `**${index} - ${HelpEmbedsTitlesEnum.MUSIC}**`,
                inline: false,
            });
            this.commandList.prefix.forEach((commandData: HelpCommandData) => {
                index += 1;
                embedFileds.push(this.mapTypeCommandsFieldsData(commandData, index));
            });
        }

        if (commandCategory === CommandsCategoryEnum.MUSIC) {
            title = HelpEmbedsTitlesEnum.MUSIC;
            this.commandList.music.forEach((commandData: HelpCommandData) => {
                index += 1;
                embedFileds.push(this.mapTypeCommandsFieldsData(commandData, index));
            });
        }

        if (commandCategory === CommandsCategoryEnum.NONPREFIX) {
            title = HelpEmbedsTitlesEnum.NONPREFIX;
            this.commandList.nonPrefix.forEach((commandData: HelpCommandData) => {
                index += 1;
                embedFileds.push(this.mapTypeCommandsFieldsData(commandData, index));
            });
        }

        const output = new MessageCreator({
            embed: {
                color: '#BFFF00',
                title,
                fields: embedFileds,
                field: {
                    name: '\u200b',
                    value:
                        'Escriba:\n' +
                        '- El número del tipo de comando que desee consultar.\n' +
                        '- b o back para ir hacia atras.\n' +
                        '- X para cancelar el comando. __Mientras help este activo no podra usar otro comando.__',
                    inline: false,
                },
            },
        }).call();

        return output;
    }

    private mapTypeCommandsFieldsData(commandData: HelpCommandData, index: number) {
        return { name: '\u200b', value: `**${index} - ${commandData.name}**`, inline: false };
    }

    private createCommandEmbed(helpEmbed: Message, selected: number) {
        const selectedCommand = this.findSelectedCommand(helpEmbed, selected);

        let description = '';
        if (selectedCommand.category !== CommandsCategoryEnum.NONPREFIX) {
            description += `**Este comando requiere del prefijo: \`${process.env.PREFIX}\` delante del alias para ser llamado**.\n`;
        }
        description +=
            'El alias es la parte necesaria para llamar a un comando, ' +
            'el comando puede tener mas de un alias.\n';

        let aliases = '';
        selectedCommand.aliases.forEach((alias: string, i: number) => {
            if (i === 0) {
                aliases += alias;
            } else {
                aliases += `, ${alias}`;
            }
        });

        const embed: EmbedOptions = {
            color: '#BFFF00',
            title: selectedCommand.name,
            description,
            fields: [
                { name: 'Alias', value: aliases, inline: false },
                { name: 'Descripcion', value: selectedCommand.description, inline: false },
                { name: 'Cooldown', value: `${selectedCommand.coolDown} ms`, inline: false },
            ],
            field: {
                name: '\u200b',
                value:
                    'Escriba:\n' +
                    '- El número del tipo de comando que desee consultar.\n' +
                    '- b o back para ir hacia atras.\n' +
                    '- X para cancelar el comando. __Mientras help este activo no podra usar otro comando.__',
                inline: false,
            },
        };

        const output = new MessageCreator({
            embed,
        }).call();

        return { output, category: selectedCommand.category };
    }

    private findSelectedCommand(helpEmbed: Message, selected: number) {
        const fields = helpEmbed.embeds[0].fields;
        const typeOfComand = helpEmbed.embeds[0].title;

        const rawCommandTitile = fields[selected - 1].value;

        let commandSelected: HelpCommandData;

        if (typeOfComand === HelpEmbedsTitlesEnum.PREFIX) {
            this.commandList.prefix.forEach((commandData: HelpCommandData) => {
                if (rawCommandTitile.includes(commandData.name)) {
                    commandSelected = commandData;
                }
            });
        }

        if (typeOfComand === HelpEmbedsTitlesEnum.NONPREFIX) {
            this.commandList.nonPrefix.forEach((commandData: HelpCommandData) => {
                if (rawCommandTitile.includes(commandData.name)) {
                    commandSelected = commandData;
                }
            });
        }

        if (typeOfComand === HelpEmbedsTitlesEnum.MUSIC) {
            this.commandList.music.forEach((commandData: HelpCommandData) => {
                if (rawCommandTitile.includes(commandData.name)) {
                    commandSelected = commandData;
                }
            });
        }

        return commandSelected;
    }
}

const nonPrefixCommandList: HelpCommandData[] = [
    {
        name: DiceCommandSchema.name,
        description: DiceCommandSchema.description,
        aliases: DiceCommandSchema.aliases,
        coolDown: DiceCommandSchema.coolDown,
        category: DiceCommandSchema.category,
    },
    {
        name: ReplyCommandSchema.name,
        description: ReplyCommandSchema.description,
        aliases: ReplyCommandSchema.aliases,
        coolDown: ReplyCommandSchema.coolDown,
        category: ReplyCommandSchema.category,
    },
];

const prefixCommandList: HelpCommandData[] = [
    {
        name: HelpCommandSchema.name,
        description: HelpCommandSchema.description,
        aliases: HelpCommandSchema.aliases,
        coolDown: HelpCommandSchema.coolDown,
        category: HelpCommandSchema.category,
    },
    {
        name: DiceCommandTogglerSchema.name,
        description: DiceCommandTogglerSchema.description,
        aliases: DiceCommandTogglerSchema.aliases,
        coolDown: DiceCommandTogglerSchema.coolDown,
        category: DiceCommandTogglerSchema.category,
    },
    {
        name: ReplyCommandTogglerSchema.name,
        description: ReplyCommandTogglerSchema.description,
        aliases: ReplyCommandTogglerSchema.aliases,
        coolDown: ReplyCommandTogglerSchema.coolDown,
        category: ReplyCommandTogglerSchema.category,
    },
];

const musicCommandList: HelpCommandData[] = [
    {
        name: PlayCommandSchema.name,
        description: PlayCommandSchema.description,
        aliases: PlayCommandSchema.aliases,
        coolDown: PlayCommandSchema.coolDown,
        category: PlayCommandSchema.category,
    },
    {
        name: PlayListCommandSchema.name,
        description: PlayListCommandSchema.description,
        aliases: PlayListCommandSchema.aliases,
        coolDown: PlayListCommandSchema.coolDown,
        category: PlayListCommandSchema.category,
    },
    {
        name: PauseCommandSchema.name,
        description: PauseCommandSchema.description,
        aliases: PauseCommandSchema.aliases,
        coolDown: PauseCommandSchema.coolDown,
        category: PauseCommandSchema.category,
    },
    {
        name: SkipMusicCommandSchema.name,
        description: SkipMusicCommandSchema.description,
        aliases: SkipMusicCommandSchema.aliases,
        coolDown: SkipMusicCommandSchema.coolDown,
        category: SkipMusicCommandSchema.category,
    },
    {
        name: RemoveSongsFromPlayListCommandSchema.name,
        description: RemoveSongsFromPlayListCommandSchema.description,
        aliases: RemoveSongsFromPlayListCommandSchema.aliases,
        coolDown: RemoveSongsFromPlayListCommandSchema.coolDown,
        category: RemoveSongsFromPlayListCommandSchema.category,
    },
    {
        name: ClearPlayListCommandSchema.name,
        description: ClearPlayListCommandSchema.description,
        aliases: ClearPlayListCommandSchema.aliases,
        coolDown: ClearPlayListCommandSchema.coolDown,
        category: ClearPlayListCommandSchema.category,
    },
    {
        name: DisplayPlayListCommandSchema.name,
        description: DisplayPlayListCommandSchema.description,
        aliases: DisplayPlayListCommandSchema.aliases,
        coolDown: DisplayPlayListCommandSchema.coolDown,
        category: DisplayPlayListCommandSchema.category,
    },
    {
        name: LoopPlayListModeCommandSchema.name,
        description: LoopPlayListModeCommandSchema.description,
        aliases: LoopPlayListModeCommandSchema.aliases,
        coolDown: LoopPlayListModeCommandSchema.coolDown,
        category: LoopPlayListModeCommandSchema.category,
    },
    {
        name: ShufflePlayListCommandSchema.name,
        description: ShufflePlayListCommandSchema.description,
        aliases: ShufflePlayListCommandSchema.aliases,
        coolDown: ShufflePlayListCommandSchema.coolDown,
        category: ShufflePlayListCommandSchema.category,
    },
    {
        name: JoinChannelCommandSchema.name,
        description: JoinChannelCommandSchema.description,
        aliases: JoinChannelCommandSchema.aliases,
        coolDown: JoinChannelCommandSchema.coolDown,
        category: JoinChannelCommandSchema.category,
    },
    {
        name: DisconnectCommandSchema.name,
        description: DisconnectCommandSchema.description,
        aliases: DisconnectCommandSchema.aliases,
        coolDown: DisconnectCommandSchema.coolDown,
        category: DisconnectCommandSchema.category,
    },
];
