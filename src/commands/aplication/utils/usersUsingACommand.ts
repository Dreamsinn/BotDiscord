export class UsersUsingACommand {
  // esta clase es para cuando un comando espera una respuesta escrita no active otro comando
  private usersList: string[] = [];

  public updateUserList(userId: string): void {
    this.usersList.push(userId);
  }

  public removeUserList(userId: string): void {
    this.usersList = this.usersList.filter((id: string) => id !== userId);
  }

  public searchIdInUserList(userId: string): string | void {
    return this.usersList.find(id => {
      if (id === userId) {
        return id;
      }
    });
  }

  // no usada en este momento, pero importante para logs
  public readUserList() {
    return this.usersList;
  }
}
