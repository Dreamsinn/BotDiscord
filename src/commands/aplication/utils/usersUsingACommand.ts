export class UsersUsingACommand {
    private usersList: string[] = [];

    public updateUserList(userId: string) {
        this.usersList.push(userId);
    }

    public removeUserList(userId: string) {
        this.usersList = this.usersList.filter((id: string) => id !== userId);
    }

    public searchIdInUserList(userId: string) {
        return this.usersList.find((id) => id === userId);
    }

    public readUserList() {
        return this.usersList;
    }
}
