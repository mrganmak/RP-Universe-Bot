import { ButtonInteraction, GuildMember, Message, Snowflake, TextChannel, VoiceChannel } from "discord.js";
import { ButtosPanelsSettingsIds, EmbedsLocalizationsIds, GuildsTicketsBase, PrivateChannel, PrivateChannelTypes, TextsLocalizationsIds, Ticket, TicketData, Util, buttonsPanelsSettings, createButtonsPanel, getButtonsPanel, getGuildLanguage, getLocalizationForEmbed, getLocalizationForText } from "../../index.js";
import { ButtonComponent, Discord } from "discordx";

@Discord()
export class Tickets {
	private static _tickets: Map<string, Ticket> = new Map();

	public static async getTicket(interaction: ButtonInteraction): Promise<Ticket | null> {
		const localTicket = this._tickets.get(interaction.channelId);
		if (localTicket) return localTicket;

		return await this._getTicketFromBase(interaction);
	}

	private static async _getTicketFromBase(interaction: ButtonInteraction): Promise<Ticket | null> {
		if (!interaction.guild || !(interaction.member instanceof GuildMember)) return null;
		const base = new GuildsTicketsBase();

		const ticketData = await base.getTicketByChannelId(interaction.guild.id, interaction.channelId);
		const guildTicketsData = await base.getTicketsByGuildId(interaction.guild.id);
		if (!ticketData || !guildTicketsData) return null;

		const guildLanguage = await getGuildLanguage(interaction.guild.id);
		const properties = await this._convertIdsToPropertiesForTicketCreate(interaction, ticketData);
		if (!properties) return null;

		const privateTextChannel = new PrivateChannel(
			PrivateChannelTypes.TEXT,
			properties.author,
			guildTicketsData.options.adminsRolesIds,
			properties.textChannel
		);

		const privateVoiceChannel = properties.voiceChannel
			? new PrivateChannel(
				PrivateChannelTypes.VOICE,
				properties.author,
				guildTicketsData.options.adminsRolesIds,
				properties.voiceChannel
			)
			: undefined;

		const buttonPanel = getButtonsPanel(
			properties.message,
			ButtosPanelsSettingsIds.TICKET,
			guildLanguage,
			ticketData.buttonsPanelCategory
		);

		const ticket = new Ticket(
			properties.author,
			privateTextChannel,
			buttonPanel,
			guildTicketsData.counter,
			properties.message,
			privateVoiceChannel
		);

		this._tickets.set(privateTextChannel.id, ticket);

		return ticket;
	}

	private static async _convertIdsToPropertiesForTicketCreate(
		interaction: ButtonInteraction,
		ticketData: TicketData,
	): Promise<PropertiesForTicketCreate | null> {
		if (!interaction.guild || !(interaction.member instanceof GuildMember)) return null;

		const textChannel = await interaction.client.channels.fetch(ticketData.ticketChannelId).catch(() => null);
		const author = await interaction.guild.members.fetch(ticketData.authorId).catch(() => null);
		const voiceChannel = ticketData.ticketVoiceChannelId
			? await interaction.client.channels.fetch(ticketData.ticketVoiceChannelId).catch(() => null)
			: undefined;

		if (
			!textChannel ||
			!author ||
			!(textChannel instanceof TextChannel) ||
			(voiceChannel && !(voiceChannel instanceof VoiceChannel))
		) return null;

		const message = await textChannel.messages.fetch(interaction.message.id).catch(() => null);
		if (!message) return null;

		return { 
			message, 
			textChannel, 
			voiceChannel: voiceChannel instanceof VoiceChannel ? voiceChannel : undefined, 
			author 
		};
	}
}

interface PropertiesForTicketCreate {
	textChannel: TextChannel;
	voiceChannel?: VoiceChannel;
	author: GuildMember;
	message: Message;
}
