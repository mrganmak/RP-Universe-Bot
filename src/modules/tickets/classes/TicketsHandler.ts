import { ButtonInteraction, Snowflake } from "discord.js";
import { ButtonComponent, Discord } from "discordx";
import { TicketsFactory } from "./TicketsFactory.js";
import { GuildsTicketsBase } from "../../../Databases/index.js";
import { Util } from "../../../utils/Util.js";
import { buttonsPanelsSettings, ButtosPanelsSettingsIds, Tickets } from "../../../index.js";

@Discord()
export class TicketsHandler {
	@ButtonComponent({ id: 'open_ticket' })
	async openButtonHandler(interaction: ButtonInteraction) {
		const ticket = await new TicketsFactory().create(interaction);

		if (!ticket) return;

		const base = new GuildsTicketsBase();
		await base.addTicketForGuild(ticket.author.guild.id, {
			authorId: ticket.author.id,
			ticketChannelId: ticket.textChannel.id,
			buttonsPanelCategory: 'begin',
		});
	}

	@ButtonComponent({ id: Util.createAnyIdRegExp(getAllButtonsIds()) })
	async handleTicketAction(interaction: ButtonInteraction) {
		if (!interaction.inCachedGuild()) return;

		const ticket = await Tickets.getTicket(interaction);
		if (!ticket) return;

		const action = interaction.customId;
		
		switch (action) {
			case 'close_ticket':
				await ticket.close();
				break;
			case 'open_ticket':
				await ticket.open();
				break;
			case 'remove_ticket':
				await ticket.remove();
				break;
			case 'create_voice_channel':
				await ticket.createVoiceChannel();
				break;
		}
	}
}

function getAllButtonsIds(): Snowflake[] {
	const ids = [];
	const categories = Object.values(buttonsPanelsSettings[ButtosPanelsSettingsIds.TICKET].buttons);

	for (const category of categories) {
		for (const buttonId of Object.keys(category)) {
			ids.push(buttonId);
		}
	}

	return ids;
}
