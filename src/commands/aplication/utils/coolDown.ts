import { Message } from 'discord.js';

export class CoolDown {
  private lastCall: Date;
  private newCall: Date;

  public call(coolDown: number, event: Message): boolean {
    if (coolDown > 0) {
      if (this.lastCall) {
        this.newCall = new Date();
        const timeLapse = this.newCall.getTime() - this.lastCall.getTime();

        if (timeLapse < coolDown) {
          console.log({
            username: event.author.username,
            nickname: event.member?.nickname,
            timeLapse,
            coolDown,
            error: 'Iterrupted for spam',
          });
          return true;
        }
      }
      this.lastCall = new Date();
    }
    return false;
  }
}
