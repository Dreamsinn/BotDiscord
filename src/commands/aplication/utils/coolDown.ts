export class CoolDown {
    private lastCall: Date;
    private newCall: Date;

    public call(coolDown: number): boolean {
        if (coolDown > 0) {
            if (this.lastCall) {
                this.newCall = new Date();
                const timeLapse = this.newCall.getTime() - this.lastCall.getTime();

                if (timeLapse < coolDown) {
                    console.log({ timeLapse, coolDown });
                    return true;
                }
            }
            this.lastCall = new Date();
        }
        return false;
    }
}
