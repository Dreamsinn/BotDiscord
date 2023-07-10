export class UsersUsingACommand {
    private usersList: string[] = [];

    public updateUserList(userId: string): void {
        this.usersList.push(userId);
    }

    public removeUserList(userId: string): void {
        this.usersList = this.usersList.filter((id: string) => id !== userId);
    }

    public searchIdInUserList(userId: string): string | void {
        return this.usersList.find((id) => {
            if (id === userId) {
                return id;
            }
        });
    }

    public readUserList() {
        return this.usersList;
    }
}
