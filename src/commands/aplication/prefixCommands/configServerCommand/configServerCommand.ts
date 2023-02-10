/* eslint-disable arrow-body-style */
import { Message } from 'discord.js';
import { ConnectionHandler } from '../../../../database/connectionHandler';
import { ServerConfig } from '../../../../database/server/domain/interfaces/serverConfig';
import { ErrorEnum } from '../../../../database/shared/domain/enums/ErrorEnum';
import { discordEmojis } from '../../../domain/discordEmojis';
import { ButtonsStyleEnum } from '../../../domain/enums/buttonStyleEnum';
import { ConfigServerButtonsEnum } from '../../../domain/enums/configServerButtonsEnum';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { MessageCreator } from '../../utils/messageCreator';
import { UsersUsingACommand } from '../../utils/usersUsingACommand';
import { ChangeAdminRole } from './changeAdminRole';
import { ChangePrefix } from './changePrefix';

export class ConfigServerCommand extends Command {
    private configChanges: ServerConfig = {};
    private serverConfig: {
        prefix: string;
        adminRole: string;
        blackList: string[];
    };

    constructor(
        private configSchema: CommandSchema,
        private databaseConnection: ConnectionHandler,
        private usersUsingACommand: UsersUsingACommand,
    ) {
        super();
    }

    async call(event: Message): Promise<void> {
        if (this.roleAndCooldownValidation(event, this.configSchema)) {
            return;
        }

        this.usersUsingACommand.updateUserList(event.author.id);

        const serverData = await this.databaseConnection.server.getById(event.guild!.id);

        if (serverData) {
            // this is to reset this 2 const every use
            this.configChanges = {};
            this.serverConfig = {
                prefix: serverData.prefix,
                adminRole: serverData.adminRole,
                blackList: serverData.blackList ? serverData.blackList.split(',') : [],
            };

            await this.createConfigOptionMessage(event);
        }
    }

    private async createConfigOptionMessage(
        event: Message,
        changeConfigMessage: Message | null = null,
    ): Promise<void> {
        const userName = event.member?.nickname ?? event.author.username;

        const configOptionEmbed = new MessageCreator({
            embed: {
                color: 'WHITE',
                title: 'Configuración del bot',
                author: {
                    name: `${userName}`,
                    iconURL: `${event.member?.user.displayAvatarURL()}`,
                },
                description:
                    '**Solo podrá interactuar la persona que haya activado el comando.**\n' +
                    'Cuando apreté el botón de cerrar se guardan todos los cambios realizados.',
                fields: [
                    {
                        name: 'Configuración actual: ',
                        value:
                            `> **Prefijo:** ${this.serverConfig.prefix}\n` +
                            `> **AdminRole:** ${this.serverConfig.adminRole}\n` +
                            `> **BlackList:** ${this.serverConfig.blackList}`,
                        inline: false,
                    },
                    {
                        name: 'Cambios: ',
                        value:
                            `> **Prefijo:** ${this.configChanges.prefix ?? ''}\n` +
                            `> **AdminRole:** ${this.configChanges.adminRole ?? ''}\n` +
                            `> **BlackList:** ${this.configChanges.blackList ?? ''}`,
                        inline: false,
                    },
                ],
            },
            buttons: [
                [
                    {
                        style: ButtonsStyleEnum.BLUE,
                        label: 'Change Prefix',
                        custom_id: ConfigServerButtonsEnum.PREFIX,
                    },
                    {
                        style: ButtonsStyleEnum.BLUE,
                        label: 'Change admin role',
                        custom_id: ConfigServerButtonsEnum.ADMINROLE,
                    },
                    {
                        style: ButtonsStyleEnum.BLUE,
                        label: 'Add to blacklist',
                        custom_id: ConfigServerButtonsEnum.BLACKLIST,
                    },
                ],
                [
                    {
                        style: ButtonsStyleEnum.RED,
                        label: `${discordEmojis.x} Close / Guardar`,
                        custom_id: ConfigServerButtonsEnum.CLOSE,
                    },
                ],
            ],
        }).call();

        let configOptionsMessage: Message<boolean> | void;
        if (changeConfigMessage) {
            // if is called with a message, edit it
            configOptionsMessage = await changeConfigMessage.edit(configOptionEmbed).catch(async () => {
                await event.channel.send('Ha habido un error, se guardarán los cambios efectuados');
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

    private buttonCollector(event: Message, configOptionMessage: Message): void {
        const collector = configOptionMessage.createMessageComponentCollector({
            componentType: 'BUTTON',
            time: 60000,
        });

        collector.on('collect', async (collected) => {
            // anular mensage de Interacción fallida
            collected.deferUpdate();

            if (collected.user.id !== event.member?.id) {
                return;
            }

            // si x borra el msenaje
            if (collected.customId === ConfigServerButtonsEnum.CLOSE) {
                collector.stop();
                await this.saveChanges(event);
                return;
            }

            if (collected.customId === ConfigServerButtonsEnum.PREFIX) {
                collector.stop();
                await this.changePrefix(event, configOptionMessage);
                return;
            }

            if (collected.customId === ConfigServerButtonsEnum.ADMINROLE) {
                collector.stop();
                await this.changeAdminRole(event, configOptionMessage);
                return;
            }
        });
    }

    private async changePrefix(event: Message, configOptionMessage: Message): Promise<void> {
        const response = await new ChangePrefix().call(event, configOptionMessage);
        // no response
        if (!response) {
            this.createConfigOptionMessage(event, configOptionMessage);
            return;
        }

        if (response.message) {
            this.configChanges.prefix = response.prefix;
            this.createConfigOptionMessage(event, response.message);
            return;
        }
        // if no message but response = error
        await event.channel.send(
            `Ha habido un error, se guardaran los cambios efectuados hasta el momento`,
        );
        await this.saveChanges(event);
    }

    private async changeAdminRole(event: Message, configOptionMessage: Message): Promise<void> {
        const response = await new ChangeAdminRole().call(event, configOptionMessage);

        if (!response) {
            this.createConfigOptionMessage(event, configOptionMessage);
            return;
        }

        if (response.message) {
            this.configChanges.adminRole = response.adminRole;

            this.createConfigOptionMessage(event, response.message);
            return;
        }
        await event.channel.send(
            `Ha habido un error, se guardaran los cambios efectuados hasta el momento`,
        );
        await this.saveChanges(event);
    }

    private async saveChanges(event: Message): Promise<void> {
        this.usersUsingACommand.removeUserList(event.author.id);
        // check if ther is any change
        if (!this.isSaveNeeded()) {
            await event.channel.send('No se ha efectuado ningún cambio.');
            return;
        }

        const changes = await this.databaseConnection.server.updateConfig(
            event.guildId!,
            event.author.id,
            this.configChanges,
        );

        console.log(changes);
        if (changes === ErrorEnum.NotFound) {
            await event.channel.send(
                'Ha habido un problema determinando la id del servidor, por favor vuélvalo a intentar',
            );
            return;
        }

        // send a message that will be redded in main.ts to update the server instance
        const resetMessage = await event.channel.send(`Update: ${event.guildId}`);
        await resetMessage.delete().catch((err) => console.log('Error sending resetMessage: ', err));
    }

    private isSaveNeeded(): boolean {
        if (!this.configChanges.adminRole) {
            this.configChanges.adminRole = this.serverConfig.adminRole;
        }

        if (!this.configChanges.prefix) {
            this.configChanges.prefix = this.serverConfig.prefix;
        }

        if (!this.configChanges.blackList) {
            this.configChanges.blackList = this.serverConfig.blackList;
        }

        if (
            this.configChanges.adminRole === this.serverConfig.adminRole &&
            this.configChanges.prefix === this.serverConfig.prefix &&
            this.configChanges.blackList === this.serverConfig.blackList
        ) {
            return false;
        }
        return true;
    }
}
