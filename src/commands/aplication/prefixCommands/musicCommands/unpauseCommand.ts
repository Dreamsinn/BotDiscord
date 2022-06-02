import { DiscordRequestRepo } from "../../../domain/interfaces/discordRequestRepo";
import { UnpauseCommandSchema } from "../../../domain/commandSchema/UnpauseCommandSchema";
import { PlayListHandler } from "../../playListHandler"
import { CoolDown } from "../../utils/coolDown";
import { Command } from "../../Command";

export class UnpauseCommand extends Command {
    private unpauseSchema: DiscordRequestRepo = UnpauseCommandSchema;
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
        const interrupt = this.coolDown.call(this.unpauseSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown')
            return;
        }

        return this.playListHandler.unpauseMusic()
    }
}