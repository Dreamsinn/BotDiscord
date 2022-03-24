import {DiscordRequestRepo} from "../../../domain/interfaces/discordRequestRepo";
import {PlayCommandSchema} from "../../../domain/commandSchema/playCommandSchema";
import {Command} from "../../../aplication/Command";

export class PlayCommand extends Command {
    static playSchema: DiscordRequestRepo = PlayCommandSchema;



    public async call(event){
        console.log('play command')
    }
}