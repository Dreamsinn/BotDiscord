export class UsersUsingACommand {
    // se llama a la instancia primero, para que solo haya una
    public static usersUsingACommand = new UsersUsingACommand()

    private usersList = [];

    public updateUserList(userId: string) {
        this.usersList.push(userId)
    }

    public removeUserList(userId: string) {
        this.usersList = this.usersList.filter((id: string) => id !== userId)
    }

    public searchIdInUserList(userId: string) {
        return this.usersList.find((id) => id === userId)
    }

    // no usada en este momento, pero importante para logs
    public readUserList() {
        return this.usersList;
    }
}