import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Colors, EmbedBuilder, Guild, Message, RepliableInteraction, Snowflake } from "discord.js";
import { DEFAULT_SERVER_LANGUAGE, GuildModules, RequestsToIntegrateBase, TextsLocalizationsIds, Util, getGuildLanguage, getLocalizationForText, RequestData, findGuildInClient, LocalizationsLanguages, sendMessageIntoChannel, ModulesSystem } from "../../../index.js";
import { ButtonComponent, Discord } from "discordx";

export class IntegrationRequest {
	constructor(
		private _interaction: RepliableInteraction,
		private _moduleName: GuildModules
	) {

	}

	public async send(targetChannelId: Snowflake, targetGuildlId: Snowflake): Promise<void> {
		if (!this._interaction.guild || !this._interaction.channel) return;

		const message = await this._sendRequestMessage(targetChannelId, targetGuildlId);
		if (!message) return;

		const language = (
			this._interaction.guild
			? await getGuildLanguage(this._interaction.guild.id)
			: DEFAULT_SERVER_LANGUAGE
		);
		await this._interaction.editReply({ content: getLocalizationForText(TextsLocalizationsIds.REQUEST_SUCCESS_SENT, language) });

		const base = new RequestsToIntegrateBase();
		await base.init();
		await base.addRequest(
			this._interaction.guild.id,
			this._moduleName,
			{
				guildId: this._interaction.guild.id,
				requestMessageId: message.id,
				senderChannelId: this._interaction.channel.id,
				moduleName: this._moduleName
			}
		);
	}

	private async _sendRequestMessage(targetChannelId: Snowflake, targetGuildlId: Snowflake): Promise<Message | null> {
		const promisedMessage = await this._interaction.client.shard?.broadcastEval(
			sendMessageIntoChannel,
			{context: {
				guildId: targetGuildlId,
				channelId: targetChannelId,
				messageOptions: { embeds: [this._getEmbed()], components: [this._getButtons()] }
			} }
		).catch(() => {}) as unknown as Promise<Message>[];
		if (!promisedMessage) return null;

		return await promisedMessage[0];
	} 

	private _getEmbed(): EmbedBuilder {
		return new EmbedBuilder()
			.setTitle(`Запрос из ${this._interaction.guild?.name}`)
			.setFields(
				{ name: 'Название модуля', value: `${this._moduleName}` }
			)
			.setFooter({
				text: `${this._interaction.user.username}`,
				iconURL: Util.getUserAvatarUrl(this._interaction.user)
			})
			.setColor(Colors.DarkPurple)
	}

	private _getButtons(): ActionRowBuilder<ButtonBuilder> {
		const row: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder();

		row.addComponents(
			new ButtonBuilder()
				.setLabel('Одобрить')
				.setStyle(ButtonStyle.Success)
				.setCustomId('approve'),
			new ButtonBuilder()
				.setLabel('Отлклонить')
				.setStyle(ButtonStyle.Danger)
				.setCustomId('reject')
		)

		return row;
	}
}

@Discord()
class IntegrationRequestButtonsInteraction {
	@ButtonComponent({ id: 'approve' })
	async approveHandler(interaction: ButtonInteraction) {
		this._handler(interaction, 'approve');
	}

	@ButtonComponent({ id: 'reject' })
	async rejectHandler(interaction: ButtonInteraction) {
		this._handler(interaction, 'reject');
	}

	private async _handler(interaction: ButtonInteraction, status: 'approve' | 'reject') {
		await interaction.deferUpdate();
		
		const requestData = await this._getRequestData(interaction);
		if (!requestData) return;

		const compleetedIntegrationRequest = new CompleetedIntegrationRequest(requestData, interaction,	status);
		await compleetedIntegrationRequest.handle();
	}

	private async _getRequestData(interaction: ButtonInteraction): Promise<RequestData | null> {
		const base = new RequestsToIntegrateBase();
		const guildRquests = await base.getByGuildId(interaction.guild?.id ?? '');
		if (!guildRquests) return null;

		const request = Object.values(guildRquests.requests).filter(
			(request) => (request.requestMessageId === interaction.message.id)
		)[0];

		return request;
	}
}

class CompleetedIntegrationRequest {
	private _targetGuild: Guild | null = null;
	private _targetGuildLanguage: LocalizationsLanguages | null = null;

	constructor (
		private _requestData: RequestData,
		private _interaction: ButtonInteraction,
		private _status: 'approve' | 'reject'
	) {}

	public async handle(): Promise<void> {
		this._targetGuild = await this._getGuild();
		if (!this._targetGuild) return;

		if (this._status === 'approve') await this._changeModuleStateInBase();

		await this._sendResultMessage();
		await this._removeRequestFromBase();
		await this._interaction.message.delete();
	}

	private async _getGuild(): Promise<Guild | null> {
		const guilds = await this._interaction.client.shard?.broadcastEval(
			findGuildInClient,
			{context: { id: this._requestData.guildId } }
		).catch(() => {}) as unknown as Guild[];

		if (!guilds) return null;
		else return guilds[0];
	}

	private async _changeModuleStateInBase(): Promise<void> {
		if (!this._targetGuild) throw new Error('Something went wrong in _changeModuleStateInBase');

		await ModulesSystem.changeModuleState(this._targetGuild.id, this._requestData.moduleName, true);
	}

	private async _sendResultMessage(): Promise<void> {
		if (!this._targetGuild) throw new Error('Something went wrong in _sendResultMessage');

		this._targetGuildLanguage = await getGuildLanguage(this._targetGuild.id);
		const contetnLocalizationsId = (this._status === 'approve' ? TextsLocalizationsIds.REQUEST_APPROVED_TEXT : TextsLocalizationsIds.REQUEST_REJECTED_TEXT);
		const content = getLocalizationForText(contetnLocalizationsId, this._targetGuildLanguage);
		
		await this._interaction.client.shard?.broadcastEval(
			sendMessageIntoChannel,
			{context: {
				guildId: this._requestData.guildId,
				channelId: this._requestData.senderChannelId,
				messageOptions: { content }
			} }
		).catch(() => {}) as unknown as Promise<Message>[];
	}

	private async _removeRequestFromBase(): Promise<void> {
		if (!this._targetGuild) throw new Error('Something went wrong in _sendResultMessage');

		const base = new RequestsToIntegrateBase();
		await base.removeRequest(this._targetGuild.id, this._requestData.moduleName);
	}
}
