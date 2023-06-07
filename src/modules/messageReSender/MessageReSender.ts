import { Message } from "discord.js";
import { GuildsReSendingSettingsBase, ResendingMessageHendler } from "../../index.js";

export class MessageReSender {
	public static async hasMassageNeedToReSend(message: Message): Promise<boolean> {
		const base = new GuildsReSendingSettingsBase();
		const guildSettings = await base.getByGuildId(message.guild?.id ?? '');

		return (guildSettings?.reSenders[message.channel.id] ? true : false);
	}

	public static async handleMessage(message: Message): Promise<void> {
		if (!MessageReSender.hasMassageNeedToReSend(message)) throw new Error(`Something went wrong with MessageReSender handleMessage\nMessage text: ${message.content}`);

		const base = new GuildsReSendingSettingsBase();
		const guildSettings = await base.getByGuildId(message.guild?.id ?? '');
		if (!guildSettings) return;

		const channelSettings = guildSettings.reSenders[message.channel.id];

		const handler = new ResendingMessageHendler(message, channelSettings);
		handler.handle();
	}
}
