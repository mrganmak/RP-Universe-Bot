import { Attachment, EmbedBuilder, Message, WebhookClient, resolveColor } from "discord.js";
import { GuildReSender, GuildsReSendingSettingsBase, TextsLocalizationsIds, Util, getGuildLanguage, getLocalizationForText } from "../../../index.js";

export class ResendingMessageHendler {
	constructor(private _message: Message, private _settings: GuildReSender) {}

	public async handle(): Promise<void> {
		setTimeout(() => (this._message.delete()), 1000);

		if (this._settings.isInEmbed && this._settings.counter != null) await this._handleEmbedCounter();
		const guildLanguage = await getGuildLanguage(this._message.guild?.id ?? '0');
		
		const webhook = (
			this._settings.webhookSettings
			? new WebhookClient({ id: this._settings.webhookSettings.id, token: this._settings.webhookSettings.token })
			: null
		);

		const sendingMessageFunction = (
			webhook
			? webhook.send.bind(webhook)
			: this._message.channel.send.bind(this._message.channel)
		);

		const contentOrEmbed = (this._settings.isInEmbed ? this._createEmbed(this._message.content) : this._message.content);
		const replyedMessage = await this._message.fetchReference().catch(() => { });

		const resolvedMessage = await sendingMessageFunction(Object.assign({ },
			(
				replyedMessage
				? { reply: { messageReference: replyedMessage, failIfNotExists: false } }
				: {}
			),
			(
				typeof contentOrEmbed === 'string'
				? { content: contentOrEmbed }
				: { embeds: [contentOrEmbed] }
			),
		));

		const message = await this._message.channel.messages.fetch(resolvedMessage.id).catch(() => { });
		if (!message) return;

		const attachments = this._message.attachments;
		if (attachments.size > 0) {	
			sendingMessageFunction({
				reply: { messageReference: message, failIfNotExists: false },
				files: Array.from(attachments.values())
			});
		}

		if (this._settings.isNeedToCreateAThread) message.startThread({
			name: (
				this._settings.isInEmbed
				? (
					this._settings.title?.replace('{COUNTER}', String(this._settings.counter ?? 0)) ??
					getLocalizationForText(TextsLocalizationsIds.RE_SENDERS_THREAD_DEFAULT_TITLE, guildLanguage)
				)
				: getLocalizationForText(TextsLocalizationsIds.RE_SENDERS_THREAD_DEFAULT_TITLE, guildLanguage)
			)
		});

		if (this._settings.emojisForStartReactions && this._settings.emojisForStartReactions?.length > 0) {
			for (const emoji of this._settings.emojisForStartReactions) {
				await message.react(emoji).catch(console.error);
			}
		}
	}

	private async _handleEmbedCounter(): Promise<void> {
		if (!this._settings.isInEmbed) throw new Error('Something went wrong in ResendingMessageHendler _handleEmbedCounter');

		if (this._settings.counter != null) {
			const base = new GuildsReSendingSettingsBase();
			const guildSettings = await base.getByGuildId(this._message.guild?.id ?? '0');
			if (!guildSettings) return;

			this._settings.counter += 1;
			base.changeSettings(guildSettings);
		}
	}

	private _createEmbed(content: string, image?: Attachment): EmbedBuilder {
		if (!this._settings.isInEmbed) throw new Error('Something went wrong in ResendingMessageHendler _createEmbed');

		const embed = new EmbedBuilder();

		embed
			.setTimestamp(new Date())
			.setColor((this._settings.colorInHex == 'random' ? resolveColor('Random') : resolveColor(this._settings.colorInHex)))
			.setDescription(content)
			.setFooter(
				this._settings.isAnonymously
				? { iconURL: process.env.ICON_FOR_ANONYMOUSLY_RE_SENDING_MESSAGE, text: 'Аноним' }
				: { iconURL: Util.getUserAvatarUrl(this._message.author), text: this._message.member?.nickname ?? 'Аноним' }
			);

		if (this._settings.title) embed.setTitle(this._settings.title.replace('{COUNTER}', String(this._settings.counter ?? 0)));

		if (image) embed.setImage(image.proxyURL);

		return embed;
	}
}
