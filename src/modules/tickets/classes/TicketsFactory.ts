import { ButtonInteraction } from "discord.js";
import { ButtosPanelsSettingsIds, createButtonsPanel, EmbedsLocalizationsIds, getGuildLanguage, getLocalizationForEmbed, getLocalizationForText, GuildsTicketsBase, PrivateChannel, PrivateChannelTypes, TextsLocalizationsIds, Ticket } from "../../../index.js";

export class TicketsFactory {
	private _base = new GuildsTicketsBase();

	public async create(interaction: ButtonInteraction): Promise<Ticket | null> {
		if (!interaction.inCachedGuild()) return null;

		const guildLanguage = await getGuildLanguage(interaction.guild.id);
		const guildTicketsData = await this._base.getTicketsByGuildId(interaction.guild.id);
		if (!guildTicketsData) return null;

		const ticketNumber = guildTicketsData.counter + 1;

		const privateChannel = await PrivateChannel.create(
			PrivateChannelTypes.TEXT,
			getLocalizationForText(TextsLocalizationsIds.TICKETS_CHANNEL_NAME, guildLanguage) + String(ticketNumber),
			interaction.member,
			guildTicketsData.options.adminsRolesIds,
			guildTicketsData.options.ticketsCategoryId
		);

		const message = await privateChannel.channel.send({ 
			embeds: [getLocalizationForEmbed({
				embedId: EmbedsLocalizationsIds.TICKET_MESSAGE_EMBED,
				language: guildLanguage,
				replaceValues: { ticketNumber: String(ticketNumber) }
			})] 
		});

		const buttonsPanel = await createButtonsPanel(message, ButtosPanelsSettingsIds.TICKET, guildLanguage);

		return new Ticket(
			interaction.member,
			privateChannel,
			buttonsPanel,
			ticketNumber,
			message
		);
	}
}
