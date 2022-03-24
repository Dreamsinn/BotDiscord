import {CommandOutput} from "./domain/interfaces/commandOutput";
import {PlayCommand} from "./aplication/prefixCommands/musicCommands/playCommand";
import {PlayListCommand} from "./aplication/prefixCommands/musicCommands/playListCommand";
import {HelpCommand} from "./aplication/prefixCommands/helpCommand";
import { PlayCommandSchema } from "./domain/commandSchema/playCommandSchema";
import { PlayListCommandSchema } from "./domain/commandSchema/playListCommandSchema";
import { HelpCommandSchema } from "./domain/commandSchema/helpCommandSchema";
import { Command } from "./aplication/Command";

export interface Route {
    alias: string[],
    command: Command;
}

// se podria tambien un switch
export const routes: Route[] = [
    {
        alias: PlayCommandSchema.aliases,
        command: new PlayCommand(),
    },
    {
        alias: PlayListCommandSchema.aliases,
        command: new PlayListCommand(),
    },
    {
        alias: HelpCommandSchema.aliases,
        command: new HelpCommand(),
    }
]
