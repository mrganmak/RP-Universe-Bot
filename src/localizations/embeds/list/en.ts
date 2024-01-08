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
			description: '{reason}',
			fields: [
				{ name: 'Server', value: '{guildName}', inline: true },
				{ name: 'Imapct on integrity', value: '{integrityPoint}', inline: true },
			],
		}
	}
}
