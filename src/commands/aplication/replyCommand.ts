import { Message } from 'discord.js';
import { ReplyCommandSchema } from '../domain/commandSchema/replyCommandSchema';
import { CommandSchema } from '../domain/interfaces/commandSchema';
import { CheckAdminRole } from './utils/CheckAdminRole';
import { CoolDown } from './utils/coolDown';
import { MessageCreator } from './utils/messageCreator';

export class ReplyCommand {
    private replySchema: CommandSchema = ReplyCommandSchema;
    private coolDown = new CoolDown();
    private checkAdminRole = new CheckAdminRole();
    public isReplyCommandActive = false;

    public toggleReplyCommand(active: boolean): boolean {
        if (this.isReplyCommandActive === active) {
            return false;
        }
        this.isReplyCommandActive = active;
        return true;
    }

    public async call(event): Promise<Message> {
        if (this.replySchema.adminOnly) {
            const interrupt = this.checkAdminRole.call(event);
            if (!interrupt) {
                return;
            }
        }

        const interrupt = this.coolDown.call(this.replySchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown');
            return;
        }

        this.replySchema.aliases.forEach((alias) => {
            if (event.content.startsWith(alias) || event.content.includes(` ${alias} `)) {

                console.log('alias founded');

                const output = new MessageCreator({
                    message: {
                        content: `${event.author.username} a dicho: ${event.content}!`,
                    },
                    embed: {
                        color: '#0099ff',
                        title: `${event.author.username} te falta calle`,
                        description: `${this.mapAliases(alias)}`,
                    },
                }).call();
                console.log('ReplyCommand executed');
                console.log(event.guild.name);
                console.log(event.channel.name);
                return event.reply(output);
            }
        });
        return;
    }

    private mapAliases(alias: string) {
        console.log(alias);
        if (alias.charAt(alias.length - 1) === ' ') {
            const aliasModified = alias.slice(0, -1);
            return replyCommandOptions[aliasModified];
        }

        return replyCommandOptions[alias];
    }
}

export const replyCommandOptions = {
    cinco: 'POR EL CULO TE LA HINCO',
    5: 'POR EL CULO TE LA HINCO',
    trece: 'AGARRAMELA QUE ME CRECE',
    13: 'AGARRAMELA QUE ME CRECE',
    // javi: 'HAMBURGESSA',
    // hamburgessa: 'AMBULANCIA',
};
