/* eslint-disable arrow-body-style */
import { Message, MessageOptions, Role } from 'discord.js';
import { ConnectionHandler } from '../../../database/connectionHandler';
import {
    ServerConfig,
    ServerConfigOptions,
} from '../../../database/server/domain/interfaces/serverConfig';
import { ErrorEnum } from '../../../database/shared/domain/enums/ErrorEnum';
import { discordEmojis } from '../../domain/discordEmojis';
import { ButtonsStyleEnum } from '../../domain/enums/buttonStyleEnum';
import { ConfigServerButtonsEnum } from '../../domain/enums/configServerButtonsEnum';
import { Command } from '../../domain/interfaces/Command';
import { CommandSchema } from '../../domain/interfaces/commandSchema';
import { MessageCreator } from '../utils/messageCreator';
import { PaginatedMessage } from '../utils/paginatedMessage';
import { UsersUsingACommand } from '../utils/usersUsingACommand';

export class ConfigServerCommand extends Command {
    private configChanges: ServerConfigOptions = {};

    constructor(
        private configSchema: CommandSchema,
        private databaseConnection: ConnectionHandler,
        private usersUsingACommand: UsersUsingACommand,
        private serverConfig: ServerConfig,
    ) {
        super();
    }

    async call(event: Message): Promise<void> {
        if (this.roleAndCooldownValidation(event, this.configSchema)) {
            return;
        }

        await this.createConfigOptionMessage(event);
    }

    private async createConfigOptionMessage(
        event: Message,
        changeConfigMessage: Message | null = null,
    ): Promise<void> {
        const userName = event.member?.nickname ?? event.author.username;

        const configOptionEmbed = new MessageCreator({
            embed: {
                color: 'WHITE',
                title: 'Configurar servidor',
                author: {
                    name: `${userName}`,
                    iconURL: `${event.member?.user.displayAvatarURL()}`,
                },
                description:
                    '**Solo podra interectuar la persona que haya activado el comando.**\n' +
                    'Cuando aprete el boton de cerrar se guardan todos los cambios realizados.',
                fields: [
                    {
                        name: 'Configuracion actual: ',
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
            configOptionsMessage = await changeConfigMessage.edit(configOptionEmbed).catch(async () => {
                await event.channel.send('Ha habido un error, se guardaran los cambios efectuados');
                // poner metodo de guardado
            });
        } else configOptionsMessage = await event.channel.send(configOptionEmbed);

        if (configOptionsMessage) {
            this.buttonCollector(event, configOptionsMessage);
        }
    }

    private buttonCollector(event: Message, configOptionMessage: Message) {
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
                await this.saveChanges(event);
                collector.stop();
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

        collector.on('end', async () => {
            console.log('-----------------');

            console.log(this.databaseConnection);
            return;
        });
    }

    private async changePrefix(event: Message, configOptionMessage: Message) {
        const changePrefixEmbed = this.createChangePrefixEmbed();
        const changePrefixMessage = await configOptionMessage.edit(changePrefixEmbed).catch((err) => {
            console.log('Error editing changePrefixMessage: ', err);
        });

        if (!changePrefixMessage) {
            await this.saveChanges(event);
            return;
        }

        const filter = (reaction: Message): boolean => {
            return reaction.author.id === event.author.id;
        };

        event.channel
            .awaitMessages({ filter, time: 60000, max: 1, errors: ['time'] })
            .then(async (collected) => {
                this.usersUsingACommand.removeUserList(event.author.id);
                const collectedMessage = collected.map((e: Message) => e);

                if (['x', 'X'].includes(collectedMessage[0].content)) {
                    await this.createConfigOptionMessage(event, changePrefixMessage);
                    return;
                }

                this.configChanges.prefix = collectedMessage[0].content;
                await this.createConfigOptionMessage(event, changePrefixMessage);
                return;
            })
            .catch(async (err) => {
                if (err instanceof TypeError) {
                    await this.saveChanges(event);
                    console.log(err);
                    await event.channel.send(
                        `Ha habido un error, se han guardado los cambios efectuados hasta el momento`,
                    );
                } else {
                    // sino contesta
                    await this.createConfigOptionMessage(event, changePrefixMessage);
                }
                this.usersUsingACommand.removeUserList(event.author.id);
                // message.delete();
                return;
            });
    }

    private createChangePrefixEmbed(): MessageOptions {
        const changePrefixEmbed = new MessageCreator({
            embed: {
                color: 'WHITE',
                title: 'Cambiar prefijo',
                description:
                    'Escriba el prefijo con el que quiera llamar al bot: \n' +
                    'Escriba **x** para cancelar',
            },
            buttons: [],
        }).call();
        return changePrefixEmbed;
    }

    private async changeAdminRole(event: Message, configOptionMessage: Message) {
        const roles = await this.fetchAndMapRoles(event);

        if (!roles) {
            await event.channel.send('No hay roles creados en el servidor');
            await this.createConfigOptionMessage(event, configOptionMessage);
            return;
        }

        const changeAdminRoleMessage = await this.createChangeAdminRoleMessage(event, roles);

        this.usersUsingACommand.updateUserList(event.author.id);

        const filter = (reaction: Message): boolean => {
            const userCondition = reaction.author.id === event.author.id;
            const numberCondition =
                Number(reaction.content) <= Object.keys(roles).length - 1 &&
                Number(reaction.content) > 0;
            const letterCondition = ['x', 'X'].includes(reaction.content);
            console.log(reaction);
            return userCondition && (numberCondition || letterCondition);
        };

        event.channel
            .awaitMessages({ filter, time: 60000, max: 1, errors: ['time'] })
            .then(async (collected) => {
                const collectedMessage = collected.map((e: Message) => e);

                await changeAdminRoleMessage.delete().catch(() => console.log('close'));

                if (['x', 'X'].includes(collectedMessage[0].content)) {
                    await this.createConfigOptionMessage(event, configOptionMessage);
                    return;
                }

                const selectedRoll = Object.keys(roles)[Number(collectedMessage[0].content)];

                this.configChanges.adminRole = selectedRoll;
                await this.createConfigOptionMessage(event, configOptionMessage);
                return;
            })
            .catch(async (err) => {
                if (err instanceof TypeError) {
                    console.log(err);
                    await event.channel.send(`Ha habido un error, por favor vuelvelo a intentar`);
                    // guardar cambios
                } else {
                    // sino contesta
                    await this.createConfigOptionMessage(event, configOptionMessage);
                }
                this.usersUsingACommand.removeUserList(event.author.id);
                await changeAdminRoleMessage.delete().catch(() => console.log('close'));
                return;
            });
    }

    private async fetchAndMapRoles(event: Message): Promise<void | { [key: string]: string }> {
        const fetchedRoles = await event.guild?.roles.fetch();

        if (!fetchedRoles) {
            return;
        }

        const roles: { [key: string]: string } = {};

        fetchedRoles!.forEach((role: Role) => {
            return (roles[`${role.name}`] = role.id);
        });

        return roles;
    }

    private async createChangeAdminRoleMessage(
        event: Message,
        roles: { [key: string]: string },
    ): Promise<Message<boolean>> {
        const indexedRoles = Object.keys(roles).map((key: string, i: number) => {
            return `${i + 1} - ${key}\n`;
        });
        // segunda vez peta
        return await new PaginatedMessage({
            embed: {
                color: 'WHITE',
                title: 'Cambiar admin role',
                author: {
                    name: `${event.member?.user.username}`,
                    iconURL: `${event.member?.user.displayAvatarURL()}`,
                },
                description:
                    'Escriba:\n' +
                    '- El **numero** del rol que quiera selecionar: \n' +
                    '- **x** para cancelar',
            },
            pagination: {
                channel: event.channel,
                dataToPaginate: indexedRoles,
                dataPerPage: 10,
                timeOut: 60000,
                deleteWhenTimeOut: true,
                jsFormat: true,
                reply: false,
            },
        }).call();
    }

    private async saveChanges(event: Message) {
        const changes = await this.databaseConnection.server.updateConfig(
            event.guildId!,
            event.author.id,
            this.configChanges,
        );
        if (changes === ErrorEnum.NotFound) {
            await event.channel.send(
                'Ha habido un problema determiando la id del servidor, porfavor vuelvalo a intentar',
            );
        }
    }
}
