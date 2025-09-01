import { Colors } from "discord.js";
import { EmbedsLocalization, EmbedLocalizationIds } from "@src/index.js";

export const enEmbedsLocaliztion: EmbedsLocalization = {
	[EmbedLocalizationIds.TicketsModuleSetup]: {
		isTimestampRequired: false,
		data: {
			title: 'Tickets Module Setup',
			description: 'Welcome to the tickets module setup! You will need to configure two settings:',
			color: Colors.Blue,
			fields: [
				{
					name: '1. Ticket Category',
					value: 'Select a category where new tickets will be created',
					inline: false
				},
				{
					name: '2. Admin Roles',
					value: 'Select roles that will have permission to manage tickets',
					inline: false
				}
			]
		}
	},
	[EmbedLocalizationIds.TicketsModuleCategoryQuestion]: {
		isTimestampRequired: false,
		data: {
			title: 'Select Ticket Category',
			description: 'Choose the category where new tickets will be created. Only category channels will be shown.',
			color: Colors.Green
		}
	},
	[EmbedLocalizationIds.TicketsModuleRolesQuestion]: {
		isTimestampRequired: false,
		data: {
			title: 'Select Admin Roles',
			description: 'Choose the roles that will have permission to manage tickets. You can select multiple roles.',
			color: Colors.Orange
		}
	},
}
