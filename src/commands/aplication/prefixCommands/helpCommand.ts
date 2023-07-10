import { EmbedFieldData, Message, MessageOptions } from "discord.js";
import ls, { Languages } from "../../../languages/languageService";
import { CommandsCategoryEnum } from "../../domain/enums/commandsCategoryEnum";
import { HelpEmbedsTitlesEnum } from "../../domain/enums/helpEmbedsTitlesEnum";
import { Command } from "../../domain/interfaces/Command";
import { CommandSchema } from "../../domain/interfaces/commandSchema";
import { EmbedOptions } from "../../domain/interfaces/createEmbedOptions";
import {
  HelpCommandData,
  HelpCommandList,
  SubTypeCommandData,
} from "../../domain/interfaces/helpCommandData";
import { SchemaDictionary } from "../../domain/interfaces/schemaDictionary";
import { MessageCreator } from "../utils/messageCreator";
import { UsersUsingACommand } from "../utils/usersUsingACommand";

export class HelpCommand extends Command {
  private commandList: HelpCommandList;
  private prefix: string;
  private language: Languages;
  private commandSchemaList: CommandSchema[];

  constructor(private usersUsingACommand: UsersUsingACommand) {
    super();
  }

  public async call(
    event: Message,
    adminRole: string,
    helpSchema: CommandSchema,
    props: { prefix: string; schemaList: SchemaDictionary; language: Languages }
  ): Promise<void> {
    if (this.roleAndCooldownValidation(event, helpSchema, adminRole)) {
      return;
    }

    this.commandSchemaList = Object.values(props.schemaList);
    this.prefix = props.prefix;
    this.language = props.language;

    // creamos embed para elejir entre comandos de prfijo o no prefijo, y lo enviamos
    const output = this.createTypeOfCommandsEmbed();

    const typeCommandMessage = await event.channel.send(output);

    // sino esta hecho, crea las listas de comandos, con su informacion
    if (!this.commandList) {
      this.mapCommandListData();
    }

    this.messageResponseListener(
      typeCommandMessage,
      event,
      HelpEmbedsTitlesEnum.TYPES
    );
    return;
  }

  private mapCommandListData() {
    const prefixCommandList: HelpCommandData[] = [];
    const nonCommandList: HelpCommandData[] = [];
    const musicCommandList: HelpCommandData[] = [];
    const playListCommandList: HelpCommandData[] = [];

    this.commandSchemaList.forEach((schema: CommandSchema) => {
      const schemaData: HelpCommandData = {
        name: schema.name,
        description: schema.description,
        aliases: schema.aliases,
        coolDown: schema.coolDown,
        category: schema.category,
        roleRequired: schema.adminOnly,
      };
      if (schema.category === CommandsCategoryEnum.PREFIX) {
        prefixCommandList.push(schemaData);
      }

      if (schema.category === CommandsCategoryEnum.NONPREFIX) {
        nonCommandList.push(schemaData);
      }

      if (schema.category === CommandsCategoryEnum.MUSIC) {
        musicCommandList.push(schemaData);
      }

      if (schema.category === CommandsCategoryEnum.PLAYLIST) {
        playListCommandList.push(schemaData);
      }
    });
    return (this.commandList = {
      prefix: prefixCommandList,
      nonPrefix: nonCommandList,
      music: musicCommandList,
      playlist: playListCommandList,
    });
  }

  private createTypeOfCommandsEmbed(): MessageOptions {
    const output = new MessageCreator({
      embed: {
        color: "#BFFF00",
        description:
          "__Mientras help este activo no podra usar otro comando.__",
        title: HelpEmbedsTitlesEnum.TYPES,
        fields: [
          {
            name: "\u200b",
            value: `**1 - ${HelpEmbedsTitlesEnum.PREFIX}**`,
            inline: false,
          },
          {
            name: "\u200b",
            value: `**2 - ${HelpEmbedsTitlesEnum.NONPREFIX}**`,
            inline: false,
          },
        ],
        field: {
          name: "\u200b",
          value:
            "Escriba:\n" +
            "- El **número** del tipo de comando que desee consultar.\n" +
            `- **X** para cancelar el comando.`,
          inline: false,
        },
      },
    }).call();

    return output;
  }

  private messageResponseListener(
    helpEmbed: Message,
    event: Message,
    typeOfEmbed: HelpEmbedsTitlesEnum | CommandsCategoryEnum
  ): void {
    // usuario en la lista de no poder usar comandos
    this.usersUsingACommand.updateUserList(event.author.id);

    const filter = (reaction: Message): boolean => {
      const authorCondition = event.author.id === reaction.author.id;

      let letterCondition = ["x", "X", "b", "B", "back", "BACK"].includes(
        reaction.content
      );
      if (typeOfEmbed === HelpEmbedsTitlesEnum.TYPES) {
        letterCondition = ["x", "X"].includes(reaction.content);
      }

      // los embeds con la descripcion de comandos no tienen condicion numerica, porque no tienen que elegir nada llegado el punto
      if (
        Object.values(HelpEmbedsTitlesEnum).some((enumsTitle: string) =>
          typeOfEmbed.includes(enumsTitle)
        )
      ) {
        const numberCondition =
          Number(reaction.content) <= helpEmbed.embeds[0].fields.length - 1 &&
          Number(reaction.content) > 0;
        return authorCondition && (letterCondition || numberCondition);
      }

      return authorCondition && letterCondition;
    };

    event.channel
      .awaitMessages({ filter, time: 60000, max: 1, errors: ["time"] })
      .then(async (collected) => {
        this.usersUsingACommand.removeUserList(event.author.id);
        const collectedMessage = collected.map((e: Message) => e);

        collectedMessage[0].delete();

        // Si se responde una X se borra el mensaje
        if (["x", "X"].includes(collectedMessage[0].content)) {
          event.reply("Help Command ha expirado");
          return;
        }

        // ir al embed anterior
        if (["b", "B", "back", "BACK"].includes(collectedMessage[0].content)) {
          this.findPreviousEmbed(helpEmbed, event, typeOfEmbed);
          return;
        }

        // ir al siguiente embed
        this.findNextEmbedToCreate(collectedMessage[0], helpEmbed, event);
        return;
      })
      .catch((err) => {
        if (err instanceof TypeError) {
          console.log("Help colector error: ", err);
          event.channel.send(
            "Ha habido un error, por favor vuelvelo a intentar"
          );
        } else {
          // sino contesta
          event.reply("Time out");
        }

        this.usersUsingACommand.removeUserList(event.author.id);

        return;
      });
  }

  private async findPreviousEmbed(
    helpEmbed: Message,
    event: Message,
    typeOfEmbed: HelpEmbedsTitlesEnum | CommandsCategoryEnum
  ): Promise<void> {
    // creamos el embed anterior, lo enviamos y le escuchamos la respuesta
    const previousEmbedDictionary: {
      condition: boolean;
      methodData: SubTypeCommandData | undefined;
      prevType: HelpEmbedsTitlesEnum;
    }[] = [
      {
        condition:
          typeOfEmbed === HelpEmbedsTitlesEnum.PREFIX ||
          typeOfEmbed === HelpEmbedsTitlesEnum.NONPREFIX,
        methodData: undefined,
        prevType: HelpEmbedsTitlesEnum.TYPES,
      },
      {
        condition: typeOfEmbed === HelpEmbedsTitlesEnum.MUSIC,
        methodData: {
          title: HelpEmbedsTitlesEnum.PREFIX,
          commandArray: this.commandList.prefix,
        },
        prevType: HelpEmbedsTitlesEnum.PREFIX,
      },
      {
        condition: typeOfEmbed === HelpEmbedsTitlesEnum.PLAYLIST,
        methodData: {
          title: HelpEmbedsTitlesEnum.MUSIC,
          commandArray: this.commandList.music,
        },
        prevType: HelpEmbedsTitlesEnum.MUSIC,
      },
      {
        condition: typeOfEmbed === CommandsCategoryEnum.PREFIX,
        methodData: {
          title: HelpEmbedsTitlesEnum.PREFIX,
          commandArray: this.commandList.prefix,
        },
        prevType: HelpEmbedsTitlesEnum.PREFIX,
      },
      {
        condition: typeOfEmbed === CommandsCategoryEnum.NONPREFIX,
        methodData: {
          title: HelpEmbedsTitlesEnum.NONPREFIX,
          commandArray: this.commandList.nonPrefix,
        },
        prevType: HelpEmbedsTitlesEnum.NONPREFIX,
      },
      {
        condition: typeOfEmbed === CommandsCategoryEnum.MUSIC,
        methodData: {
          title: HelpEmbedsTitlesEnum.MUSIC,
          commandArray: this.commandList.music,
        },
        prevType: HelpEmbedsTitlesEnum.MUSIC,
      },
      {
        condition: typeOfEmbed === CommandsCategoryEnum.PLAYLIST,
        methodData: {
          title: HelpEmbedsTitlesEnum.PLAYLIST,
          commandArray: this.commandList.playlist,
        },
        prevType: HelpEmbedsTitlesEnum.PLAYLIST,
      },
    ];

    const previousEmbed = previousEmbedDictionary.find(
      (embed) => embed.condition
    );

    if (previousEmbed) {
      let response: {
        output: MessageOptions;
        type: HelpEmbedsTitlesEnum | CommandsCategoryEnum;
      };
      if (previousEmbed.methodData) {
        response = {
          output: await this.createSubTypeCommandsEmbed(
            previousEmbed.methodData
          ),
          type: previousEmbed.prevType,
        };
      } else {
        response = {
          output: this.createTypeOfCommandsEmbed(),
          type: previousEmbed.prevType,
        };
      }

      await helpEmbed
        .edit(response.output)
        .then((previousEmbedMessage) =>
          this.messageResponseListener(
            previousEmbedMessage,
            event,
            response.type
          )
        )
        .catch((err) => {
          console.log("Error editing findNextEmbedToCreate :", err);
        });
    }
  }

  private async findNextEmbedToCreate(
    collectedMessage: Message,
    helpEmbed: Message,
    event: Message
  ): Promise<void> {
    // creamos el embed selecionado, lo enviamos y le escuchamos la respuesta
    const nextEmbedDictionary: {
      condition: boolean;
      methodData: SubTypeCommandData;
      nextType: HelpEmbedsTitlesEnum;
    }[] = [
      {
        condition:
          helpEmbed.embeds[0].title === HelpEmbedsTitlesEnum.TYPES &&
          collectedMessage.content === "1",
        methodData: {
          title: HelpEmbedsTitlesEnum.PREFIX,
          commandArray: [...this.commandList.prefix],
        },
        nextType: HelpEmbedsTitlesEnum.PREFIX,
      },
      {
        condition:
          helpEmbed.embeds[0].title === HelpEmbedsTitlesEnum.TYPES &&
          collectedMessage.content === "2",
        methodData: {
          title: HelpEmbedsTitlesEnum.NONPREFIX,
          commandArray: [...this.commandList.nonPrefix],
        },
        nextType: HelpEmbedsTitlesEnum.NONPREFIX,
      },
      {
        condition:
          helpEmbed.embeds[0].title === HelpEmbedsTitlesEnum.PREFIX &&
          collectedMessage.content === "1",
        methodData: {
          title: HelpEmbedsTitlesEnum.MUSIC,
          commandArray: [...this.commandList.music],
        },
        nextType: HelpEmbedsTitlesEnum.MUSIC,
      },
      {
        condition:
          helpEmbed.embeds[0].title === HelpEmbedsTitlesEnum.MUSIC &&
          collectedMessage.content === "1",
        methodData: {
          title: HelpEmbedsTitlesEnum.PLAYLIST,
          commandArray: [...this.commandList.playlist],
        },
        nextType: HelpEmbedsTitlesEnum.PLAYLIST,
      },
    ];

    const nextEmbed = nextEmbedDictionary.find((option) => option.condition);

    let response: {
      output: MessageOptions;
      type: HelpEmbedsTitlesEnum | CommandsCategoryEnum;
    };

    if (nextEmbed) {
      response = {
        output: await this.createSubTypeCommandsEmbed(nextEmbed.methodData),
        type: nextEmbed.nextType,
      };
    } else {
      // default - commandEmbed
      const commandEmbed = await this.createCommandEmbed(
        helpEmbed,
        Number(collectedMessage.content)
      );
      if (!commandEmbed) {
        return;
      }
      response = {
        output: commandEmbed.output,
        type: commandEmbed.category,
      };
    }
    await helpEmbed
      .edit(response.output)
      .then((nextEmbedMessage) =>
        this.messageResponseListener(nextEmbedMessage, event, response.type)
      )
      .catch((err) => {
        console.log("Error editing findNextEmbedToCreate :", err);
      });
    return;
  }

  private async createSubTypeCommandsEmbed(
    commandCategory: SubTypeCommandData
  ): Promise<MessageOptions> {
    const embedFileds: EmbedFieldData[] = [];
    let index = 0;
    if (commandCategory.title === HelpEmbedsTitlesEnum.PREFIX) {
      index = +1;
      embedFileds.push({
        name: "\u200b",
        value: `**${index} - ${HelpEmbedsTitlesEnum.MUSIC}**`,
        inline: false,
      });
    }

    if (commandCategory.title === HelpEmbedsTitlesEnum.MUSIC) {
      index = +1;
      embedFileds.push({
        name: "\u200b",
        value: `**${index} - ${HelpEmbedsTitlesEnum.PLAYLIST}**`,
        inline: false,
      });
    }

    for (const commandData of commandCategory.commandArray) {
      index += 1;
      embedFileds.push(
        await this.mapTypeCommandsFieldsData(commandData, index)
      );
    }

    const output = new MessageCreator({
      embed: {
        color: "#BFFF00",
        description:
          "__Mientras help este activo no podra usar otro comando.__",
        title: commandCategory.title,
        fields: embedFileds,
        field: {
          name: "\u200b",
          value:
            "Escriba:\n" +
            "- El **número** del tipo de comando que desee consultar.\n" +
            "- **b** o **back** para ir hacia atras.\n" +
            `- **X** para cancelar el comando.`,
          inline: false,
        },
      },
    }).call();

    return output;
  }

  private async mapTypeCommandsFieldsData(
    commandData: HelpCommandData,
    index: number
  ): Promise<EmbedFieldData> {
    return {
      name: "\u200b",
      value: `**${index} - ${await ls.t(this.language, commandData.name)}**`,
      inline: false,
    };
  }

  private async createCommandEmbed(
    helpEmbed: Message,
    selected: number
  ): Promise<void | {
    output: MessageOptions;
    category: CommandsCategoryEnum;
  }> {
    const selectedCommand = this.findSelectedCommand(helpEmbed, selected);
    if (!selectedCommand) {
      return;
    }

    let description =
      "__Mientras help este activo no podra usar otro comando.__\n\n";
    if (selectedCommand.category !== CommandsCategoryEnum.NONPREFIX) {
      description += `**Este comando requiere del prefijo: \`${this.prefix}\` delante del alias para ser llamado**.\n`;
    }
    description +=
      "El alias es la parte necesaria para llamar a un comando, " +
      "el comando puede tener mas de un alias.\n";

    let aliases = "";
    selectedCommand.aliases.forEach((alias: string, i: number) => {
      if (i === 0) {
        aliases += alias;
      } else {
        aliases += `, ${alias}`;
      }
    });

    let rol = "No";
    if (selectedCommand.roleRequired) {
      if (process.env.ADMIN_ROL) {
        rol = process.env.ADMIN_ROL;
      } else {
        rol = "Requerido, pero no se ha definido el nombre del rol.";
      }
    }
    const embed: EmbedOptions = {
      color: "#BFFF00",
      title: await ls.t(this.language, selectedCommand.name),
      description,
      fields: [
        { name: "Alias", value: aliases, inline: false },
        {
          name: "Descripcion",
          value: await ls.t(this.language, selectedCommand.description, {
            prefix: this.prefix,
          }),
          inline: false,
        },
        {
          name: "Cooldown",
          value: `${selectedCommand.coolDown} ms`,
          inline: false,
        },
        { name: "Rol requerido", value: rol, inline: false },
      ],
      field: {
        name: "\u200b",
        value:
          "Escriba:\n" +
          "- El **número** del tipo de comando que desee consultar.\n" +
          "- **b** o **back** para ir hacia atras.\n" +
          `- **X** para cancelar el comando.`,
        inline: false,
      },
    };

    const output = new MessageCreator({
      embed,
    }).call();

    return { output, category: selectedCommand.category };
  }

  private findSelectedCommand(
    helpEmbed: Message,
    selected: number
  ): HelpCommandData | void {
    const fields = helpEmbed.embeds[0].fields;
    const typeOfComand = helpEmbed.embeds[0].title;
    const commandTitile = fields[selected - 1].value;

    const typeCommandDictionary = {
      [HelpEmbedsTitlesEnum.PREFIX]: this.commandList.prefix,
      [HelpEmbedsTitlesEnum.NONPREFIX]: this.commandList.nonPrefix,
      [HelpEmbedsTitlesEnum.MUSIC]: this.commandList.music,
      [HelpEmbedsTitlesEnum.PLAYLIST]: this.commandList.playlist,
    };

    const typeCommandSelected = Object.values(HelpEmbedsTitlesEnum).find(
      (enumsTitle: string) => enumsTitle.includes(String(typeOfComand))
    );

    if (
      typeCommandSelected &&
      typeCommandSelected !== HelpEmbedsTitlesEnum.TYPES
    ) {
      // this regex look for the first number in a string
      const regex = /\d+/g;

      // that number was the index + 1, so it is needed to -1
      let number = Number(commandTitile.match(regex)![0]) - 1;

      if (
        typeCommandSelected === HelpEmbedsTitlesEnum.PREFIX ||
        typeCommandSelected === HelpEmbedsTitlesEnum.MUSIC
      ) {
        // in case of type prefix, first option is music commands, so i have to -1 another one
        // same with music and playlist
        number -= 1;
      }

      return typeCommandDictionary[typeCommandSelected][number];
    }
  }
}
