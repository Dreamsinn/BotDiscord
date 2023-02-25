import { Message } from 'discord.js';
import { ConnectionHandler } from '../../../../database/connectionHandler';
import { discordEmojis } from '../../../domain/discordEmojis';
import { ButtonsStyleEnum } from '../../../domain/enums/buttonStyleEnum';
import { CommandsNameEnum } from '../../../domain/enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../../../domain/enums/commandsCategoryEnum';
import { ConfigSchemaCommandButtonsEnum } from '../../../domain/enums/configSchemaButtonsEnum';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { SchemaDictionary } from '../../../domain/interfaces/schemaDictionary';
import { MessageCreator } from '../../utils/messageCreator';
import { UsersUsingACommand } from '../../utils/usersUsingACommand';
import { ChangeAdminOnly } from './changeAdminOnly';
import { ChangeCoolDown } from './changeCoolDown';

interface CooldownModifiedSchema {
    command: CommandsNameEnum;
    coolDown: {
        before: number;
        after: number;
    };
}

export class ConfigSchemaCommand extends Command {
    private schemaList: SchemaDictionary;
    private cooldownModifiedSchemaList: CooldownModifiedSchema[];
    private adminOnlyModifiedSchemaList: CommandsNameEnum[];

    constructor(
        private databaseConnection: ConnectionHandler,
        private usersUsingACommand: UsersUsingACommand,
    ) {
        super();
    }

    public async call(
        event: Message,
        adminRole: string,
        configSchema: CommandSchema,
        props: { schemaList: SchemaDictionary },
    ): Promise<void> {
        if (this.roleAndCooldownValidation(event, configSchema, adminRole)) {
            return;
        }
        this.schemaList = props.schemaList;
        this.cooldownModifiedSchemaList = [];
        this.adminOnlyModifiedSchemaList = [];

        await this.configSchemaListMessage(event);
    }

    private async configSchemaListMessage(
        event: Message,
        configSchemaListMessage: Message | void = undefined,
    ) {
        this.usersUsingACommand.updateUserList(event.author.id);

        const configSchemaListEmbed = await this.createConfigSchemaListEmbed(event);

        if (configSchemaListMessage) {
            // if is called with a message, edit it to update it
            configSchemaListMessage = await configSchemaListMessage
                .edit(configSchemaListEmbed)
                .catch(async () => {
                    await event.channel.send('Ha habido un error, se guardarán los cambios efectuados');
                    // await this.saveChanges(event);
                });
        } else {
            // if first tame this method is called, create the message
            configSchemaListMessage = await event.channel.send(configSchemaListEmbed);
        }

        if (configSchemaListMessage) {
            this.buttonCollector(event, configSchemaListMessage);
        }
    }

    private async createConfigSchemaListEmbed(event: Message) {
        const userName = event.member?.nickname ?? event.author.username;

        const coolDownModfiedNameList: string[] = this.cooldownModifiedSchemaList.map(
            (schema: CooldownModifiedSchema) => schema.command,
        );
        const coolDownModfiedNameListString = String(coolDownModfiedNameList).replaceAll(',', ', ');

        const adminOnlyNames = String(this.adminOnlyModifiedSchemaList).replaceAll(',', ', ');

        return new MessageCreator({
            embed: {
                color: 'WHITE',
                title: 'Configuración de comandos',
                author: {
                    name: `${userName}`,
                    iconURL: `${event.member?.user.displayAvatarURL()}`,
                },
                description:
                    '**Solo** podrá interactuar la **persona** que haya **activado el comando**.\n' +
                    'Mientras este **comando** este **en uso no podrá usar otro comando**.\n\n' +
                    'Cuando apreté el botón de cerrar se guardan todos los cambios realizados.\n',
                field: {
                    name: 'Schemas modificados: ',
                    value:
                        `> **Cooldown:** ${coolDownModfiedNameListString}\n` +
                        `> **AdminRole:** ${adminOnlyNames}\n`,
                    inline: false,
                },
            },
            buttons: [
                [
                    {
                        style: ButtonsStyleEnum.BLUE,
                        label: 'Change cooldowns',
                        custom_id: ConfigSchemaCommandButtonsEnum.COOLDOWN,
                    },
                    {
                        style: ButtonsStyleEnum.BLUE,
                        label: 'Change admin needed',
                        custom_id: ConfigSchemaCommandButtonsEnum.ADMINONLY,
                    },
                    {
                        style: ButtonsStyleEnum.RED,
                        label: `${discordEmojis.x} Close / Guardar`,
                        custom_id: ConfigSchemaCommandButtonsEnum.CLOSE,
                    },
                ],
            ],
        }).call();
    }

    private async buttonCollector(event: Message, configSchemaListMessage: Message) {
        const collector = configSchemaListMessage.createMessageComponentCollector({
            componentType: 'BUTTON',
            time: 60000,
        });

        collector.on('collect', async (collected) => {
            // anular mensage de Interacción fallida
            collected.deferUpdate();

            if (collected.user.id !== event.member?.id) {
                return;
            }

            // si close button, save changes
            if (collected.customId === ConfigSchemaCommandButtonsEnum.CLOSE) {
                collector.stop();
                await this.saveChanges(event);
                return;
            }

            if (collected.customId === ConfigSchemaCommandButtonsEnum.ADMINONLY) {
                collector.stop();
                await this.changeAdminOnly(event, configSchemaListMessage);
                return;
            }

            if (collected.customId === ConfigSchemaCommandButtonsEnum.COOLDOWN) {
                collector.stop();
                await this.changeCoolDown(event, configSchemaListMessage);
                return;
            }
        });

        collector.on('end', async () => {
            this.usersUsingACommand.removeUserList(event.author.id);

            // when collector end buttons will disapear
            await configSchemaListMessage.edit({ components: [] });
        });
    }

    private async changeAdminOnly(event: Message, configSchemaListMessage: Message): Promise<void> {
        const schemaArray = Object.values(this.schemaList).filter((schema: CommandSchema) => {
            return schema.category !== CommandsCategoryEnum.DEV;
        });

        this.usersUsingACommand.updateUserList(event.author.id);

        const response = await new ChangeAdminOnly().call(event, schemaArray);

        this.usersUsingACommand.removeUserList(event.author.id);

        if (response instanceof Error) {
            await event.channel.send(
                `Ha habido un error, se guardaran los cambios efectuados hasta el momento`,
            );
            await this.saveChanges(event);
            return;
        }

        if (response) {
            // if schema is in array, delete it, if not put it in
            this.adminOnlyModifiedSchemaList = response.flatMap((schema: CommandSchema) => {
                // if it is true, set it false
                this.schemaList[`${schema.command}`].adminOnly =
                    !this.schemaList[`${schema.command}`].adminOnly;

                if (
                    this.adminOnlyModifiedSchemaList.some(
                        (commandName) => commandName === schema.command,
                    )
                ) {
                    return [];
                }
                return schema.command;
            });
        }

        return await this.configSchemaListMessage(event, configSchemaListMessage);
    }

    private async changeCoolDown(event: Message, configSchemaListMessage: Message): Promise<void> {
        const schemaArray = Object.values(this.schemaList).filter((schema: CommandSchema) => {
            return schema.category !== CommandsCategoryEnum.DEV;
        });

        this.usersUsingACommand.updateUserList(event.author.id);

        const respose = await new ChangeCoolDown().call(event, schemaArray);

        this.usersUsingACommand.removeUserList(event.author.id);

        if (respose instanceof Error) {
            await event.channel.send(
                `Ha habido un error, se guardaran los cambios efectuados hasta el momento`,
            );
            await this.saveChanges(event);
            return;
        }

        if (respose) {
            // was the command already modified?
            const selectedSchema = this.cooldownModifiedSchemaList.find(
                (schema: CooldownModifiedSchema) => schema.command === respose.schema.command,
            );

            // if it was
            if (selectedSchema) {
                // set new cooldown
                this.schemaList[`${respose.schema.command}`].coolDown = respose.newCoolDown;
                selectedSchema.coolDown.after = respose.newCoolDown;
                // if new cooldown === first cooldown deleter it from modified array
                if (selectedSchema.coolDown.after === selectedSchema.coolDown.before) {
                    this.cooldownModifiedSchemaList = this.cooldownModifiedSchemaList.filter(
                        (schema: CooldownModifiedSchema) => schema.command !== respose.schema.command,
                    );
                }
            } else {
                // if not, put it in the array and set new cooldown
                this.cooldownModifiedSchemaList.push({
                    command: respose.schema.command,
                    coolDown: {
                        before: respose.schema.coolDown,
                        after: respose.newCoolDown,
                    },
                });
                this.schemaList[`${respose.schema.command}`].coolDown = respose.newCoolDown;
            }
        }
        return await this.configSchemaListMessage(event, configSchemaListMessage);
    }

    private async saveChanges(event: Message): Promise<void> {
        // check if ther is any change
        if (!this.isSaveNeeded()) {
            await event.channel.send('No se ha efectuado ningún cambio.');
            return;
        }

        const modifiedsSchemas: CommandsNameEnum[] = [...this.adminOnlyModifiedSchemaList];
        this.cooldownModifiedSchemaList.forEach((schema: CooldownModifiedSchema) => {
            modifiedsSchemas.push(schema.command);
        });

        const modifiedsSchemasSet = new Set(modifiedsSchemas);

        await this.databaseConnection.schema.update({
            modifiedsSchemaList: [...modifiedsSchemasSet],
            schemaDictionary: this.schemaList,
            guildId: event.guild!.id,
            userId: event.author.id,
        });

        // send a message that will be readded in main.ts to update the server instance
        const resetMessage = await event.channel.send(`UpdateSchema: ${event.guildId}`);
        await resetMessage
            .delete()
            .catch((err) => console.log('Error deleting resetSchemaMessage: ', err));
    }

    private isSaveNeeded(): boolean {
        if (this.cooldownModifiedSchemaList.length || this.adminOnlyModifiedSchemaList.length) {
            return true;
        }
        return false;
    }
}
