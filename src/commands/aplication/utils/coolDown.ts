export class CoolDown {
    lastCall: Date;
    newCall: Date;
    public call(coolDown: number){
        if (coolDown > 0){
            console.log('lastCall', this.lastCall)
            if(this.lastCall){
                this.newCall = new Date();
                const timeLapse = this.newCall.getTime() - this.lastCall.getTime();
                console.log('timeLapse =', timeLapse)
                console.log('coolDown =', coolDown)
                console.log(coolDown)
                if(timeLapse < coolDown){
                    return   1;
                }
            }
            this.lastCall = new Date();
        }


    }
}
