import { DiscordRequestRepo } from "../../../domain/interfaces/discordRequestRepo";
import { PlayListCommandSchema } from "../../../domain/commandSchema/playListCommandSchema";
import { Command } from "../../Command";

export class PlayListCommand extends Command {
    static playListSchema: DiscordRequestRepo = PlayListCommandSchema;
    public async call(event) {
        console.log('playList command')
    }
}