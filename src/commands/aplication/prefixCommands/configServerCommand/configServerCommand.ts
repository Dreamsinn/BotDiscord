/* eslint-disable arrow-body-style */
import { GuildMember, Message, MessageOptions, Role } from "discord.js";
import { ConnectionHandler } from "../../../../database/connectionHandler";
import { ServerConfig } from "../../../../database/server/domain/interfaces/serverConfig";
import { ErrorEnum } from "../../../../database/shared/domain/enums/ErrorEnum";
import {
  Languages,
  languagesArray,
} from "../../../../languages/languageService";
import { discordEmojis } from "../../../domain/discordEmojis";
import { ButtonsStyleEnum } from "../../../domain/enums/buttonStyleEnum";
import { ConfigServerButtonsEnum } from "../../../domain/enums/configServerButtonsEnum";
import { Command } from "../../../domain/interfaces/Command";
import { CommandSchema } from "../../../domain/interfaces/commandSchema";
import { MessageCreator } from "../../utils/messageCreator";
import { UsersUsingACommand } from "../../utils/usersUsingACommand";
import { AddUserToBlacklist } from "./utils/addUserToBlacklist";
import { ChangeAdminRole } from "./utils/changeAdminRole";
import { ChangeLanguage } from "./utils/changeLanguage";
import { ChangePrefix } from "./utils/changePrefix";
import { RemoveUserFromBlacklist } from "./utils/removeUserFromBlacklist";

interface BlackListUser {
  id: string;
  name: string;
}

export class ConfigServerCommand extends Command {
  private configChanges: ServerConfig = {};
  // in config change have to be adminRole Id
  private configAdminRoleName: string;
  private serverConfig: {
    prefix: string;
    adminRole: {
      name: string;
      id: string;
    };
    blackList: string[];
    language: Languages;
  };

  private blacklistUsers: {
    serverBlacklist: BlackListUser[];
    configBlacklist: {
      added: BlackListUser[];
      removed: BlackListUser[];
    };
  };

  constructor(
    private databaseConnection: ConnectionHandler,
    private usersUsingACommand: UsersUsingACommand
  ) {
    super();
  }

  async call(
    event: Message,
    adminRole: string,
    configSchema: CommandSchema
  ): Promise<void> {
    if (this.roleAndCooldownValidation(event, configSchema, adminRole)) {
      return;
    }

    this.usersUsingACommand.updateUserList(event.author.id);

    const serverData = await this.databaseConnection.server.getById(
      event.guild!.id
    );

    if (serverData) {
      // reset the values of the global variables
      this.configChanges = {};
      this.configAdminRoleName = "";
      this.blacklistUsers = {
        serverBlacklist: [],
        configBlacklist: {
          added: [],
          removed: [],
        },
      };

      // if blacklist map it in this.blacklistUsers.serverBlacklist
      if (serverData.blackList.length) {
        await this.fetchAndMapServerBlacklistUsers(event, serverData.blackList);
      }

      this.serverConfig = {
        prefix: serverData.prefix,
        adminRole: {
          name: await this.fetchAdminRole(event, serverData.adminRole),
          id: serverData.adminRole,
        },
        blackList: serverData.blackList,
        language: serverData.language,
      };

      await this.createConfigOptionMessage(event);
    }
  }

  private async fetchAndMapServerBlacklistUsers(
    event: Message,
    serverBlacklist: string[]
  ) {
    const blacklistUserList = await event.guild?.members.fetch({
      user: serverBlacklist,
    });

    if (blacklistUserList) {
      this.blacklistUsers.serverBlacklist = blacklistUserList.map(
        (member: GuildMember) => {
          if (member.nickname) {
            return {
              id: member.id,
              name: member.nickname,
            };
          }
          return {
            id: member.id,
            name: member.user.username,
          };
        }
      );
    }
  }

  private async fetchAdminRole(
    event: Message,
    adminRoleId: string | undefined
  ) {
    const adminRole: Role | undefined = event.guild?.roles.cache.find(
      (role: Role) => {
        return role.id === adminRoleId;
      }
    );

    if (adminRole) {
      return adminRole.name;
    }
    return "";
  }

  private async createConfigOptionMessage(
    event: Message,
    changeConfigMessage: Message | null = null
  ): Promise<void> {
    const configOptionEmbed = this.createConfigOptionEmbed(event);

    let configOptionsMessage: Message<boolean> | void;
    if (changeConfigMessage) {
      // if is called with a message, edit it to update it
      configOptionsMessage = await changeConfigMessage
        .edit(configOptionEmbed)
        .catch(async () => {
          await event.channel.send(
            "Ha habido un error, se guardarán los cambios efectuados"
          );
          await this.saveChanges(event);
        });
    } else {
      // if first tame this method is called, create the message
      configOptionsMessage = await event.channel.send(configOptionEmbed);
    }

    if (configOptionsMessage) {
      this.buttonCollector(event, configOptionsMessage);
    }
  }

  private createConfigOptionEmbed(event: Message): MessageOptions {
    const userName = event.member?.nickname ?? event.author.username;

    const serverBlacklist = this.blacklistUsers.serverBlacklist;
    const configBlacklist = this.blacklistUsers.configBlacklist;

    return new MessageCreator({
      message: { content: "  " },
      embed: {
        color: "WHITE",
        title: "Configuración del bot",
        author: {
          name: `${userName}`,
          iconURL: `${event.member?.user.displayAvatarURL()}`,
        },
        description:
          "**Solo** podrá interactuar la **persona** que haya **activado el comando**.\n" +
          "Mientras este **comando** este **en uso no podrá usar otro comando**.\n\n" +
          "Cuando apreté el botón de cerrar se guardan todos los cambios realizados.\n",
        fields: [
          {
            name: "Configuración actual: ",
            value:
              `> **Prefijo:** ${this.serverConfig.prefix}\n` +
              `> **AdminRole:** ${this.serverConfig.adminRole.name}\n` +
              `> **Language:** ${this.serverConfig.language}\n` +
              `> **BlackList:** ${this.mapBlackListUserNames(serverBlacklist)}`,
            inline: false,
          },
          {
            name: "Cambios: ",
            value:
              `> **Prefijo:** ${this.configChanges.prefix ?? ""}\n` +
              `> **AdminRole:** ${this.configAdminRoleName}\n` +
              `> **Language:** ${this.configChanges.language ?? ""}\n` +
              `> **BlackList:** \n` +
              `> -  *Añadidos*: ${this.mapBlackListUserNames(
                configBlacklist.added
              )}\n` +
              `> -  *Quitados*: ${this.mapBlackListUserNames(
                configBlacklist.removed
              )}`,
            inline: false,
          },
        ],
      },
      buttons: [
        [
          {
            style: ButtonsStyleEnum.BLUE,
            label: "Change Prefix",
            custom_id: ConfigServerButtonsEnum.PREFIX,
          },
          {
            style: ButtonsStyleEnum.BLUE,
            label: "Change admin role",
            custom_id: ConfigServerButtonsEnum.ADMINROLE,
          },
          {
            style: ButtonsStyleEnum.BLUE,
            label: "Add to blacklist",
            custom_id: ConfigServerButtonsEnum.ADDBLACKLIST,
          },
          {
            style: ButtonsStyleEnum.BLUE,
            label: "Remove from blacklist",
            custom_id: ConfigServerButtonsEnum.REMOVEBLACKLIST,
          },
          {
            style: ButtonsStyleEnum.BLUE,
            label: "Change lenguage",
            custom_id: ConfigServerButtonsEnum.LANGUAGE,
          },
        ],
        [
          {
            style: ButtonsStyleEnum.RED,
            label: `${discordEmojis.x} Close`,
            custom_id: ConfigServerButtonsEnum.CLOSE,
          },
          {
            style: ButtonsStyleEnum.GRENN,
            label: `${discordEmojis.save} Save`,
            custom_id: ConfigServerButtonsEnum.SAVE,
          },
        ],
      ],
    }).call();
  }

  private mapBlackListUserNames(blackList: BlackListUser[]): string {
    if (!blackList.length) {
      return "";
    }
    const blackListNames: string[] = blackList.map(
      (user: BlackListUser) => user.name
    );

    return String(blackListNames).replaceAll(",", ", ");
  }

  private buttonCollector(event: Message, configOptionMessage: Message): void {
    const collector = configOptionMessage.createMessageComponentCollector({
      componentType: "BUTTON",
      time: 60000,
    });

    collector.on("collect", async (collected) => {
      // anular mensage de Interacción fallida
      collected.deferUpdate();

      if (collected.user.id !== event.member?.id) {
        return;
      }

      collector.stop();

      if (collected.customId === ConfigServerButtonsEnum.CLOSE) {
        return;
      }

      if (collected.customId === ConfigServerButtonsEnum.SAVE) {
        return this.saveChanges(event);
      }

      if (collected.customId === ConfigServerButtonsEnum.PREFIX) {
        return this.changePrefix(event, configOptionMessage);
      }

      if (collected.customId === ConfigServerButtonsEnum.ADMINROLE) {
        return this.changeAdminRole(event, configOptionMessage);
      }

      if (collected.customId === ConfigServerButtonsEnum.ADDBLACKLIST) {
        return this.addUserToBlacklist(event, configOptionMessage);
      }

      if (collected.customId === ConfigServerButtonsEnum.REMOVEBLACKLIST) {
        return this.removeUserFromBlacklist(event, configOptionMessage);
      }

      if (collected.customId === ConfigServerButtonsEnum.LANGUAGE) {
        return this.changeLenguage(event, configOptionMessage);
      }
    });

    collector.on("end", async () => {
      // when collector end buttons will disapear
      await configOptionMessage.edit({ components: [] });

      this.usersUsingACommand.removeUserList(event.author.id);
    });
  }

  private async changePrefix(
    event: Message,
    configOptionMessage: Message
  ): Promise<void> {
    // it is in every route becouse if it were at the start and the end of collector, it would be not working when the changes are selected
    // if it were at start and saving, if this time out the user would be for ever in the list
    this.usersUsingACommand.updateUserList(event.author.id);

    const response = await new ChangePrefix().call(event);

    this.usersUsingACommand.removeUserList(event.author.id);

    if (response instanceof Error) {
      await event.channel.send(
        `Ha habido un error, se guardaran los cambios efectuados hasta el momento`
      );
      await this.saveChanges(event);
      return;
    }

    // writen this way because if (response && this.serverConfig.prefix !== response.prefix), if i change the prefix i can't the one in serverConfig again
    if (response) {
      this.configChanges.prefix = response.prefix;

      if (this.serverConfig.prefix === response.prefix) {
        this.configChanges.prefix = undefined;
      }
    }

    // no response
    await this.createConfigOptionMessage(event, configOptionMessage);
    return;
  }

  private async changeAdminRole(
    event: Message,
    configOptionMessage: Message
  ): Promise<void> {
    this.usersUsingACommand.updateUserList(event.author.id);

    const response = await new ChangeAdminRole().call(event);

    this.usersUsingACommand.removeUserList(event.author.id);

    if (response instanceof Error) {
      await event.channel.send(
        `Ha habido un error, se guardaran los cambios efectuados hasta el momento`
      );
      await this.saveChanges(event);
      return;
    }

    if (response) {
      // find role id
      const adminRole = event.guild?.roles.cache.find(
        (role: Role) => role.name === response.adminRole
      );

      // writen this way because if (this.serverConfig.adminRole.id !== adminRole?.id) and in ther i set adminId and name, if i change the adminRole for a new one, i can't get the one in serverConfig again
      this.configChanges.adminRole = adminRole?.id;
      // this constant is to shwo the user name in the message
      this.configAdminRoleName = response.adminRole;

      // if actual adminRole is not the same than the chosen one
      if (this.serverConfig.adminRole.id === adminRole?.id) {
        this.configChanges.adminRole = undefined;
        this.configAdminRoleName = "";
      }
    }

    await this.createConfigOptionMessage(event, configOptionMessage);
    return;
  }

  private async addUserToBlacklist(
    event: Message,
    configOptionMessage: Message
  ): Promise<void> {
    this.usersUsingACommand.updateUserList(event.author.id);

    const response = await new AddUserToBlacklist().call(event);

    this.usersUsingACommand.removeUserList(event.author.id);

    if (response instanceof Error) {
      await event.channel.send(
        `Ha habido un error, se guardaran los cambios efectuados hasta el momento`
      );
      await this.saveChanges(event);
      return;
    }

    if (response) {
      // if it is in remove array, remove it from ir
      const removedUssersToBlacklist =
        this.blacklistUsers.configBlacklist.removed;
      this.blacklistUsers.configBlacklist.removed =
        removedUssersToBlacklist.filter(
          (user: BlackListUser) => user.name !== response.user.name
        );

      // if the user is not already in blacklist in DB
      if (
        !this.serverConfig.blackList.some(
          (user: string) => user === response.user.id
        )
      ) {
        // if it is not already in add array put it in
        const addedUserBlacklist = this.blacklistUsers.configBlacklist.added;
        if (
          !addedUserBlacklist.some(
            (user: BlackListUser) => user.name === response.user.name
          )
        ) {
          addedUserBlacklist.push(response.user);
        }
      }
    }

    await this.createConfigOptionMessage(event, configOptionMessage);
    return;
  }

  private async removeUserFromBlacklist(
    event: Message,
    configOptionMessage: Message
  ): Promise<void> {
    this.usersUsingACommand.updateUserList(event.author.id);

    // pass both arrays to name[] and remove repeated values
    const namesFromBlacklist = [
      ...this.blacklistUsers.serverBlacklist,
      ...this.blacklistUsers.configBlacklist.added,
    ].map((user: BlackListUser) => user.name);
    const namesFromBlacklistSet = new Set(namesFromBlacklist);

    // remove from set the values that are already in remove array
    this.blacklistUsers.configBlacklist.removed.forEach(
      (user: BlackListUser) => {
        if (namesFromBlacklistSet.has(user.name)) {
          namesFromBlacklistSet.delete(user.name);
        }
      }
    );

    if (!namesFromBlacklistSet.size) {
      await this.createConfigOptionMessage(event, configOptionMessage);
      event.channel.send("Actualmente, no hay usuarios en la blacklist.");
      return;
    }

    const response = await new RemoveUserFromBlacklist().call(event, [
      ...namesFromBlacklistSet,
    ]);

    this.usersUsingACommand.removeUserList(event.author.id);

    if (response instanceof Error) {
      await event.channel.send(
        `Ha habido un error, se guardaran los cambios efectuados hasta el momento`
      );
      await this.saveChanges(event);
      return;
    }

    if (response) {
      // if the user selected to be removed from blacklist is in the added array, remove it
      const addedUssersToBlacklist = this.blacklistUsers.configBlacklist.added;
      this.blacklistUsers.configBlacklist.added = addedUssersToBlacklist.filter(
        (user: BlackListUser) => user.name !== response.user
      );

      // look for the user, to get id
      const userToRemove = this.blacklistUsers.serverBlacklist.find(
        (user: BlackListUser) => user.name === response.user
      );

      if (userToRemove) {
        this.blacklistUsers.configBlacklist.removed.push(userToRemove);
      }
    }

    await this.createConfigOptionMessage(event, configOptionMessage);
    return;
  }

  private async changeLenguage(
    event: Message,
    configOptionMessage: Message
  ): Promise<void> {
    this.usersUsingACommand.updateUserList(event.author.id);

    const response = await new ChangeLanguage().call(event, languagesArray);

    this.usersUsingACommand.removeUserList(event.author.id);

    if (response instanceof Error) {
      await event.channel.send(
        `Ha habido un error, se guardaran los cambios efectuados hasta el momento`
      );
      await this.saveChanges(event);
      return;
    }

    if (response && this.serverConfig.language !== response.language) {
      this.configChanges.language = response.language;
    }

    await this.createConfigOptionMessage(event, configOptionMessage);
    return;
  }

  private async saveChanges(event: Message): Promise<void> {
    // check if ther is any change
    if (!this.isSaveNeeded()) {
      await event.channel.send("No se ha efectuado ningún cambio.");
      return;
    }

    const changes = await this.databaseConnection.server.updateConfig(
      event.guildId!,
      event.author.id,
      this.configChanges
    );

    if (changes === ErrorEnum.NotFound) {
      await event.channel.send(
        "Ha habido un problema determinando la id del servidor, por favor vuélvalo a intentar"
      );
      return;
    }

    // send a message that will be readded in main.ts to update the server instance
    const resetMessage = await event.channel.send(`Update: ${event.guildId}`);
    await resetMessage
      .delete()
      .catch((err) => console.log("Error deleting resetMessage: ", err));
  }

  private isSaveNeeded(): boolean {
    if (
      this.blacklistUsers.configBlacklist.added.length ||
      this.blacklistUsers.configBlacklist.removed.length
    ) {
      this.createNewBlacklist();
      return true;
    }

    if (
      !this.configChanges.adminRole &&
      !this.configChanges.prefix &&
      !this.configChanges.language
    ) {
      return false;
    }

    return true;
  }

  private createNewBlacklist() {
    const removedToRemove = this.blacklistUsers.configBlacklist.removed;
    const usersToAdd = this.blacklistUsers.configBlacklist.added;
    let serverBlacklist = this.blacklistUsers.serverBlacklist;

    if (removedToRemove.length) {
      removedToRemove.forEach((userToRemove: BlackListUser) => {
        serverBlacklist = serverBlacklist.filter(
          (user: BlackListUser) => user.id !== userToRemove.id
        );
      });
    }

    const blackListUsersIds = [...usersToAdd, ...serverBlacklist].map(
      (user: BlackListUser) => user.id
    );

    // set cant have repeated values
    const blacklistIdsSet = new Set(blackListUsersIds);
    this.configChanges.blackList = [...blacklistIdsSet];
  }
}
