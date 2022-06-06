import { DiscordRequestRepo } from "../../../domain/interfaces/discordRequestRepo";
import { DisconnectCommandSchema } from "../../../domain/commandSchema/DisconnectCommandSchema";
import { PlayListHandler } from "../../playListHandler"
import { CoolDown } from "../../utils/coolDown";
import { Command } from "../../Command";

export class DisconnectCommand extends Command {
    private BotDisconnectSchema: DiscordRequestRepo = DisconnectCommandSchema;
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
        const interrupt = this.coolDown.call(this.BotDisconnectSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown')
            return;
        }

        return this.playListHandler.botDisconnect()
    }
}