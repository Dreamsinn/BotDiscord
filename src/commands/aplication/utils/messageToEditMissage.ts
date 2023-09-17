import { MessageOptions, MessageEditOptions } from "discord.js";

export default function messageToEditMissage(message: MessageOptions): MessageEditOptions {
    return {
        attachments: message.attachments,
        content: message.content,
        embeds: message.embeds,
        allowedMentions: message.allowedMentions,
        components: message.components,
        files: message.files,
    }
}
