import { Colors } from "discord.js";
import { EmbedsLocalization, EmbedsLocalizationsIds } from "../../../index.js";

export const enEmbedsLocaliztion: EmbedsLocalization = {
	[EmbedsLocalizationsIds.USER_MARKERS_INFO_GENERAL_INFO_EMBED]: {
		data: {
			title: '{user} information',
			fields: [
				{ name: 'Number of markers', value: '{markersLength}', inline: true },
				{ name: 'Integrity', value: '{userIntegrityLevel}', inline: true },
				{ name: 'Integrity scale', value: '{integrityScale}' }
			]
		}
	},
	[EmbedsLocalizationsIds.USER_MARKERS_INFO_MARKER_INFO_EMBED]: {
		data: {
			description: 'Marker reason:\n{reason}',
			fields: [
				{ name: 'Server', value: '{guildName}', inline: true },
				{ name: 'Imapct on integrity', value: '{integrityPoint}', inline: true },
			],
		}
	},
	[EmbedsLocalizationsIds.TICKET_MESSAGE_EMBED]: {
		data: {
			title: 'Ticket #{ticketNumber}',
			description: 'At the bottom are buttons to manage your ticket',
			color: Colors.Purple
		},
		isTimestampRequired: true
	},
	[EmbedsLocalizationsIds.WELCOME_MESSAGE]: {
		isTimestampRequired: true,
		data: {
			title: 'Welcome to the server!',
			description: 'We are glad to see {user} in our community!',
			color: 0x2F3136
		}
	},
}
