import { DiscordRequestRepo } from "../../../domain/interfaces/discordRequestRepo";
import { ClearPlayListCommandSchema } from "../../../domain/commandSchema/clearPlayListCommandSchema";
import { PlayListHandler } from "../../playListHandler"
import { CoolDown } from "../../utils/coolDown";
import { Command } from "../../Command";

export class ClearPlayListCommand extends Command {
    private clearSchema: DiscordRequestRepo = ClearPlayListCommandSchema;
    private coolDown = new CoolDown();
    private playListHandler: PlayListHandler;

    constructor(
        playListHandler: PlayListHandler,
    ) {
        super();
        this.playListHandler = playListHandler;
    }


    public async call(event) {
        //comprobar coolDown
        const interrupt = this.coolDown.call(this.clearSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown')
            return;
        }

        return this.playListHandler.deletePlayList()
    }
}