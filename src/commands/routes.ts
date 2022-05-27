import { CommandOutput } from "./domain/interfaces/commandOutput";
import { PlayCommand } from "./aplication/prefixCommands/musicCommands/playCommand";
import { PlayListCommand } from "./aplication/prefixCommands/musicCommands/playListCommand";
import { HelpCommand } from "./aplication/prefixCommands/helpCommand";
import { PlayCommandSchema } from "./domain/commandSchema/playCommandSchema";
import { PlayListCommandSchema } from "./domain/commandSchema/playListCommandSchema";
import { HelpCommandSchema } from "./domain/commandSchema/helpCommandSchema";
import { Command } from "./aplication/Command";
import { YoutubeSearch } from "./infrastructure/youtube.ts/youtubeHandler"
import { PlayListHandler } from "./aplication/playListHandler"

export interface Route {
    alias: string[],
    command: Command;
}

const youtubeSearch = new YoutubeSearch();
const playListHandler = new PlayListHandler(youtubeSearch);

// se podria tambien un switch
export const routes: Route[] = [
    {
        alias: PlayCommandSchema.aliases,
        command: new PlayCommand(youtubeSearch, playListHandler),
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
