import { ButtonInteraction, CategoryChannel, GuildMember, Snowflake } from "discord.js";
import { PrivateChannel, PrivateChannelTypes, TextsLocalizationsIds, Ticket, getGuildLanguage, getLocalizationForText } from "../../index.js";
import { ButtonComponent, Discord } from "discordx";
import { GuildsTicketsBase } from "../../Databases/bases_list/GuildsTicketsBase.js";

@Discord()
export class Tickets {
	@ButtonComponent({ id: 'open_ticket' })
	async openButtonHandler(interaction: ButtonInteraction) {
		if (!interaction.guild || !(interaction.member instanceof GuildMember)) return;

		const guildLanguage = await getGuildLanguage(interaction.guild.id);
		const base = new GuildsTicketsBase();
		const guildTicketsData = await base.getTicketsByGuildId(interaction.guild?.id ?? '');
		if (!guildTicketsData) return;

		const channel = await PrivateChannel.create(
			PrivateChannelTypes.TEXT,
			getLocalizationForText(TextsLocalizationsIds.TICKETS_CHANNEL_NAME, guildLanguage) + String(guildTicketsData.counter),
			interaction.member,
			guildTicketsData.adminsRolesId,
			guildTicketsData.ticketsCategoryId
		);

		base.addTicketForGuild(interaction.guild.id, {
			authorId: interaction.member.id,
			ticketChannelId: channel.id
		})
	}
}
