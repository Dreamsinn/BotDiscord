import { CommandSchema } from "../../../domain/interfaces/commandSchema";
import { PauseCommandSchema } from "../../../domain/commandSchema/PauseCommandSchema";
import { PlayListHandler } from "../../playListHandler"
import { CoolDown } from "../../utils/coolDown";
import { Command } from "../../Command";

export class PauseCommand extends Command {
    private pauseSchema: CommandSchema = PauseCommandSchema;
    private coolDown = new CoolDown();
    private playListHandler: PlayListHandler;

    constructor(
        playListHandler: PlayListHandler,
    ) {
        super();
        this.playListHandler = playListHandler;
    }


    public async call() {
        //comprobar coolDown
        const interrupt = this.coolDown.call(this.pauseSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown')
            return;
        }

        return this.playListHandler.pauseMusic()
    }
}