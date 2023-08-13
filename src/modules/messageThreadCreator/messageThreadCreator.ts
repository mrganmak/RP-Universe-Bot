import { Message } from "discord.js";
import { GuildsThreadsCreatorBase, TextsLocalizationsIds, getGuildLanguage, getLocalizationForText } from "../../index.js";

export class MessageThreadCreator {
	public static async hasMassageNeedToCreateAThread(message: Message): Promise<boolean> {
		const base = new GuildsThreadsCreatorBase();
		const guildSettings = await base.getByGuildId(message.guild?.id ?? '');

		return (guildSettings?.creators[message.channel.id] ? true : false);
	}

	public static async handleMessage(message: Message): Promise<void> {
		if (!MessageThreadCreator.hasMassageNeedToCreateAThread(message)) throw new Error(`Something went wrong with MessageThreadCreator handleMessage\nMessage text: ${message.content}`);

		const base = new GuildsThreadsCreatorBase();
		const guildSettings = await base.getByGuildId(message.guild?.id ?? '');
		const guildLanguage = await getGuildLanguage(message.guild?.id ?? '0');
		if (!guildSettings) return;

		const channelSettings = guildSettings.creators[message.channel.id];

		message.startThread({
			name: channelSettings.title ?? getLocalizationForText(TextsLocalizationsIds.RE_SENDERS_THREAD_DEFAULT_TITLE, guildLanguage)
		});
	}
}
