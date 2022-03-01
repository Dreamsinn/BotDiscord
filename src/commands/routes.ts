import {CommandOutput} from "./domain/interfaces/commandOutput";
import {PlayCommand} from "./aplication/prefixCommands/musicCommands/playCommand";
import {PlayListCommand} from "./aplication/prefixCommands/musicCommands/playListCommand";

export interface Route {
    alias: string[],
    command: (event: any) => any;
}

export const routes: Route[] = [
    {
        alias: PlayCommand.playSchema.aliases,
        command: PlayCommand.call,
    },
    {
        alias: PlayListCommand.playListSchema.aliases,
        command: PlayCommand.call,
    }
]
