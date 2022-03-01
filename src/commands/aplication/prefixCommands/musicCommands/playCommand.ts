import {DiscordRequestRepo} from "../../../domain/interfaces/discordRequestRepo";
import {PlayCommandSchema} from "../../../domain/commandSchema/playCommandSchema";

export class PlayCommand {
    static playSchema: DiscordRequestRepo = PlayCommandSchema;



    public async call(event){
        console.log('play command')
    }
}