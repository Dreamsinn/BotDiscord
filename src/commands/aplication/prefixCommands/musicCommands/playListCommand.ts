import {DiscordRequestRepo} from "../../../domain/interfaces/discordRequestRepo";
import {PlayListCommandSchema} from "../../../domain/commandSchema/playListCommandSchema";

export class PlayListCommand{
    static playListSchema: DiscordRequestRepo = PlayListCommandSchema;
    public async call (event){
        console.log('playList command')
    }
}