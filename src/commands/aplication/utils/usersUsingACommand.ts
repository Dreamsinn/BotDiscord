import { Message } from 'discord.js';

export class UsersUsingACommand {
    // esta clase es para cuando un comando espera una respuesta escrita no active otro comando
    private usersList: string[] = [];

    public updateUserList(userId: string) {
        this.usersList.push(userId);
    }

    public removeUserList(userId: string) {
        this.usersList = this.usersList.filter((id: string) => id !== userId);
    }

    public searchIdInUserList(userId: string, event: Message) {
        return this.usersList.find((id) => {
            if (id === userId) {
                console.log({
                    username: event.author.username,
                    nickname: event.member?.nickname,
                    error: 'User already using a command',
                });
                return id;
            }
        });
    }

    // no usada en este momento, pero importante para logs
    public readUserList() {
        return this.usersList;
    }
}
