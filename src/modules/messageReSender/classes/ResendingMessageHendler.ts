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

		const contentOrEmbed = (
			this._message.content.length <= 0
			? null
			: (this._settings.isInEmbed ? await this._createEmbed(this._message.content) : this._message.content)
		);
		const replyedMessage = await this._message.fetchReference().catch(() => { });
		const attachments = this._message.attachments;

		const resolvedMessage = await sendingMessageFunction(Object.assign({ },
			(
				webhook != null
				? { }
				: (
					replyedMessage
					? { reply: { messageReference: replyedMessage, failIfNotExists: false } }
					: {}
				)
			),
			(
				contentOrEmbed != null
				? (
					typeof contentOrEmbed === 'string'
					? (
						attachments.size > 0
						? { content: contentOrEmbed, files: Array.from(attachments.values()) }
						: { content: contentOrEmbed }
					)
					: { embeds: [contentOrEmbed] }
				)
				: { files: Array.from(attachments.values()) }
			)
		));

		const message = await this._message.channel.messages.fetch(resolvedMessage.id).catch(() => { });
		if (!message) return;

		if (attachments.size > 0 && contentOrEmbed != null && typeof contentOrEmbed === 'object') {
			sendingMessageFunction(Object.assign({ files: Array.from(attachments.values()) }, 
				(
					webhook != null
					? { }
					: { reply: { messageReference: message, failIfNotExists: false }, }
				)
			));
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

		if (this._settings.logChannelId) {
			const channel = await this._message.guild?.channels.fetch(this._settings.logChannelId).catch(() => {});

			if (channel && channel.isTextBased()) {
				channel.send(`${this._message.author.toString()}: \n\`\`\`${this._message.content}\`\`\``).catch(() => {});
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

	private async _createEmbed(content: string, image?: Attachment): Promise<EmbedBuilder> {
		if (!this._settings.isInEmbed) throw new Error('Something went wrong in ResendingMessageHendler _createEmbed');
		const guildLanguage = await getGuildLanguage(this._message.guild?.id ?? '0');

		const embed = new EmbedBuilder();

		embed
			.setTimestamp(new Date())
			.setColor((this._settings.colorInHex == 'random' ? resolveColor('Random') : resolveColor(this._settings.colorInHex)))
			.setDescription(content)
			.setFooter(
				this._settings.isAnonymously
				? { 
					iconURL: process.env.ICON_FOR_ANONYMOUSLY_RE_SENDING_MESSAGE,
					text: getLocalizationForText(TextsLocalizationsIds.RE_SENDERS_EMBED_ANONYMOUS, guildLanguage)
				}
				: {
					iconURL: Util.getUserAvatarUrl(this._message.author),
					text: (
						this._message.member?.nickname
						?? this._message.author.username
						?? getLocalizationForText(TextsLocalizationsIds.RE_SENDERS_EMBED_ANONYMOUS, guildLanguage)
					)
				}
			);

		if (this._settings.title) embed.setTitle(this._settings.title.replace('{COUNTER}', String(this._settings.counter ?? 0)));

		if (image) embed.setImage(image.proxyURL);

		return embed;
	}
}
