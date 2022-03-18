import {CommandOutput} from "./domain/interfaces/commandOutput";
import {PlayCommand} from "./aplication/prefixCommands/musicCommands/playCommand";
import {PlayListCommand} from "./aplication/prefixCommands/musicCommands/playListCommand";
import { PlayCommandSchema } from "./domain/commandSchema/playCommandSchema";
import { PlayListCommandSchema } from "./domain/commandSchema/playListCommandSchema";

export interface Route {
    alias: string[],
    command: (event: any) => any;
}

// se podria tambien un switch
export const routes: Route[] = [
    {
        alias: PlayCommandSchema.aliases,
        command: new PlayCommand().call,
    },
    {
        alias: PlayListCommandSchema.aliases,
        command: new PlayListCommand().call,
    }
]
