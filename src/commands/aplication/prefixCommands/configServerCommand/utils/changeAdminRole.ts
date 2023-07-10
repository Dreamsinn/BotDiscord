import { Message, Role } from "discord.js";
import { PaginatedMessage } from "../../../utils/paginatedMessage";

type Response = {
  adminRole: string;
};

export class ChangeAdminRole {
  public async call(event: Message): Promise<void | Response | Error> {
    const roles = await this.fetchAndMapRoles(event);

    if (!roles) {
      await event.channel.send("No hay roles creados en el servidor");
      return;
    }

    const changeAdminRoleMessage = await this.createChangeAdminRoleMessage(
      event,
      roles
    );

    const filter = (reaction: Message): boolean => {
      const userCondition = reaction.author.id === event.author.id;
      // number condition = write a number equal to the index of the role wanted
      const numberCondition =
        Number(reaction.content) <= roles.length &&
        Number(reaction.content) > 0;
      const letterCondition = ["x", "X"].includes(reaction.content);

      return userCondition && (numberCondition || letterCondition);
    };

    return event.channel
      .awaitMessages({ filter, time: 60000, max: 1, errors: ["time"] })
      .then(async (collected) => {
        const collectedMessage = collected.map((e: Message) => e);

        // delete response message
        await collectedMessage[0].delete();

        await changeAdminRoleMessage
          .delete()
          .catch((err) =>
            console.log("Error deleting changeAdminRoleMessage:", err)
          );

        if (!["x", "X"].includes(collectedMessage[0].content)) {
          const selectedRoll = roles[Number(collectedMessage[0].content) - 1];
          return { adminRole: selectedRoll };
        }

        return;
      })
      .catch(async (err) => {
        if (err instanceof Error) {
          console.log("Error in changeAdminRole collector: ", err);
          return err;
        }

        await changeAdminRoleMessage
          .delete()
          .catch((err) =>
            console.log("Error deleting changeAdminRoleMessage:", err)
          );

        return;
      });
  }

  private async fetchAndMapRoles(event: Message): Promise<void | string[]> {
    const fetchedRoles = await event.guild?.roles.fetch();

    if (!fetchedRoles) {
      return;
    }

    const roles: string[] = fetchedRoles!.map((role: Role) => role.name);

    return roles;
  }

  private async createChangeAdminRoleMessage(
    event: Message,
    roles: string[]
  ): Promise<Message<boolean>> {
    const indexedRoles = roles.map(
      (roleName: string, i: number) => `${i + 1} - ${roleName}\n`
    );

    const userName = event.member?.nickname ?? event.author.username;

    return await new PaginatedMessage({
      embed: {
        color: "WHITE",
        title: "Cambiar admin role",
        author: {
          name: `${userName}`,
          iconURL: `${event.member?.user.displayAvatarURL()}`,
        },
        description:
          "Escriba:\n" +
          "- El **numero** del rol que quiera selecionar: \n" +
          "- **x** para cancelar",
      },
      pagination: {
        channel: event.channel,
        dataToPaginate: indexedRoles,
        dataPerPage: 10,
        timeOut: 60000,
        deleteWhenTimeOut: true,
        jsFormat: true,
        closeButton: false,
        reply: false,
      },
    }).call();
  }
}
