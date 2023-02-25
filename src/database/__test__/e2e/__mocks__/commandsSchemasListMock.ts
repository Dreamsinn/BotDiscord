import { commandsSchemasList } from '../../../../commands/domain/commandSchema/schemasList';
import { CommandsNameEnum } from '../../../../commands/domain/enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../../../../commands/domain/enums/commandsCategoryEnum';
import { CommandSchema } from '../../../../commands/domain/interfaces/commandSchema';

let commandsSchemasListMock = [...commandsSchemasList];

commandsSchemasListMock = commandsSchemasListMock.filter((schema: CommandSchema) => {
    if (
        schema.command !== CommandsNameEnum.ClearPlaylistCommand &&
        schema.command !== CommandsNameEnum.DiceCommand
    ) {
        return true;
    }
});

commandsSchemasListMock.unshift(
    {
        name: 'Test schma 1',
        aliases: ['schema', 'list'],
        coolDown: 0,
        adminOnly: false,
        description: 'long description',
        category: CommandsCategoryEnum.MUSIC,
        command: CommandsNameEnum.ClearPlaylistCommand,
    },
    {
        name: 'Test schma 2',
        aliases: ['schema 2', 'commandSchema'],
        coolDown: 100,
        adminOnly: true,
        description: 'long description 2',
        category: CommandsCategoryEnum.PREFIX,
        command: CommandsNameEnum.DiceCommand,
    },
);

export { commandsSchemasListMock };
