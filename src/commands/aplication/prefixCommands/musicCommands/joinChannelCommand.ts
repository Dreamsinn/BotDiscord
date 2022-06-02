import { DiscordRequestRepo } from "../../../domain/interfaces/discordRequestRepo";
import { JoinChannelCommandSchema } from "../../../domain/commandSchema/joinChannelCommandSchema";
import { PlayListHandler } from "../../playListHandler"
import { CoolDown } from "../../utils/coolDown";
import { Command } from "../../Command";

export class JoinChannelCommand extends Command {
    private joinSchema: DiscordRequestRepo = JoinChannelCommandSchema;
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
        const interrupt = this.coolDown.call(this.joinSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown')
            return;
        }

        return this.playListHandler.changeBotVoiceChanel(event)
    }
}