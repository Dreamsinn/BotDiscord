import { ConfigSchemaCommand } from './aplication/prefixCommands/configSchemaCommand/configSchemaCommand';
import { ConfigServerCommand } from './aplication/prefixCommands/configServerCommand/configServerCommand';
import { DiceCommandToggler } from './aplication/prefixCommands/diceCommandToggler';
import { HelpCommand } from './aplication/prefixCommands/helpCommand';
import { ClearPlayListCommand } from './aplication/prefixCommands/musicCommands/clearPlayListCommand';
import { DisconnectCommand } from './aplication/prefixCommands/musicCommands/disconnectCommand';
import { DisplayPlayListCommand } from './aplication/prefixCommands/musicCommands/displayPlayListCommand';
import { JoinChannelCommand } from './aplication/prefixCommands/musicCommands/joinChannelCommand';
import { LogPlaylistStatusCommand } from './aplication/prefixCommands/musicCommands/logPlaylistStatusCommand';
import { LoopPlayListModeCommand } from './aplication/prefixCommands/musicCommands/loopPlayListModeCommand';
import { PauseCommand } from './aplication/prefixCommands/musicCommands/pauseCommand';
import { PlayCommand } from './aplication/prefixCommands/musicCommands/playCommand';
import { CreatePlaylistCommand } from './aplication/prefixCommands/musicCommands/playlist/createPlaylistCommand';
import { DeletePlaylistCommand } from './aplication/prefixCommands/musicCommands/playlist/deletePlaylistCommand';
import { PlayPlaylistCommand } from './aplication/prefixCommands/musicCommands/playlist/playPlaylistCommand';
import { ShowPlaylistCommand } from './aplication/prefixCommands/musicCommands/playlist/showPlaylistCommand';
import { UpdatePlaylistCommand } from './aplication/prefixCommands/musicCommands/playlist/updatePlaylistCommand';
import { PlayListCommand } from './aplication/prefixCommands/musicCommands/playListCommand';
import { PlayNowCommand } from './aplication/prefixCommands/musicCommands/playNowCommand';
import { RemoveSongsFromPlayListCommand } from './aplication/prefixCommands/musicCommands/removeSongsFromPlayListCommand';
import { ShufflePlayListCommand } from './aplication/prefixCommands/musicCommands/shufflePlayListCommand';
import { SkipMusicCommand } from './aplication/prefixCommands/musicCommands/skipMusicCommand';
import { ReplyCommandToggler } from './aplication/prefixCommands/replyCommandToggler';
import { CommandsDependencies } from './commandsDependencies';
import { CommandsServerDependencies } from './commandsServerDependencies';
import { Command } from './domain/interfaces/Command';
import { CommandSchema } from './domain/interfaces/commandSchema';
import { SchemaDictionary } from './domain/interfaces/schemaDictionary';

interface RawRoute {
    schema: CommandSchema;
    command: new (...args: any[]) => Command;
}

interface Route {
    schema: CommandSchema;
    command: new (...args: any[]) => Command;
    dependencies: any[];
}

export class Routes extends CommandsServerDependencies {
    constructor(schemaDictionary: SchemaDictionary, commandsDependencies: CommandsDependencies) {
        super(schemaDictionary, commandsDependencies);
        this.routeList = this.findDependenciesOfCommands();
    }

    private findDependenciesOfCommands(): Route[] {
        const routes = this.rawRouteList.map((route) => {
            const dependencies = [];

            if (route.command && route.command.prototype && route.command.prototype.constructor) {
                const constructorParams = route.command.prototype.constructor.toString();
                const constructorParamsMatch = constructorParams.match(/\((.*?)\)/);

                if (constructorParamsMatch && constructorParamsMatch[1]) {
                    const constructorParamNames = constructorParamsMatch[1]
                        .split(',')
                        .map((param: any) => param.trim());

                    for (const paramName of constructorParamNames) {
                        const dependency = this[paramName as keyof typeof this];
                        if (dependency) {
                            dependencies.push(dependency);
                        }
                    }
                }
            }

            return {
                ...route,
                dependencies,
            };
        });

        return routes;
    }

    public routeList: Route[];

    private rawRouteList: RawRoute[] = [
        {
            schema: this.schemaDictionary['Play Command'],
            command: PlayCommand,
        },
        {
            schema: this.schemaDictionary['Playlist Command'],
            command: PlayListCommand,
        },
        {
            schema: this.schemaDictionary['Help Command'],
            command: HelpCommand,
        },
        {
            schema: this.schemaDictionary['Pause Command'],
            command: PauseCommand,
        },
        {
            schema: this.schemaDictionary['Skip Music Command'],
            command: SkipMusicCommand,
        },
        {
            schema: this.schemaDictionary['Disconnect Command'],
            command: DisconnectCommand,
        },
        {
            schema: this.schemaDictionary['Join Channel Command'],
            command: JoinChannelCommand,
        },
        {
            schema: this.schemaDictionary['Clear Playlist Command'],
            command: ClearPlayListCommand,
        },
        {
            schema: this.schemaDictionary['Remove Songs From Playlist Command'],
            command: RemoveSongsFromPlayListCommand,
        },
        {
            schema: this.schemaDictionary['Shuffle Playlist Command'],
            command: ShufflePlayListCommand,
        },
        {
            schema: this.schemaDictionary['Loop Playlist Mode Command'],
            command: LoopPlayListModeCommand,
        },
        {
            schema: this.schemaDictionary['Display Playlist Command'],
            command: DisplayPlayListCommand,
        },
        {
            schema: this.schemaDictionary['Dice Command Toggler'],
            command: DiceCommandToggler,
        },
        {
            schema: this.schemaDictionary['Reply Command Toggler'],
            command: ReplyCommandToggler,
        },
        {
            schema: this.schemaDictionary['Log Playlist Status Command'],
            command: LogPlaylistStatusCommand,
        },
        {
            schema: this.schemaDictionary['Play Now Command'],
            command: PlayNowCommand,
        },
        {
            schema: this.schemaDictionary['Config Server Command'],
            command: ConfigServerCommand,
        },
        {
            schema: this.schemaDictionary['Config Schema Command'],
            command: ConfigSchemaCommand,
        },
        {
            schema: this.schemaDictionary['Create Playlist Command'],
            command: CreatePlaylistCommand,
        },
        {
            schema: this.schemaDictionary['Show Playlist Command'],
            command: ShowPlaylistCommand,
        },
        {
            schema: this.schemaDictionary['Delete Playlist Command'],
            command: DeletePlaylistCommand,
        },
        {
            schema: this.schemaDictionary['Update Playlist Command'],
            command: UpdatePlaylistCommand,
        },
        {
            schema: this.schemaDictionary['Play Playlist Command'],
            command: PlayPlaylistCommand,
        },
    ];
}
