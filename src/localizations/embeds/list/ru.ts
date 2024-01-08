import { EmbedsLocalization, EmbedsLocalizationsIds } from "../../../index.js";

export const ruEmbedsLocaliztion: EmbedsLocalization = {
	[EmbedsLocalizationsIds.USER_MARKERS_INFO_GENERAL_INFO_EMBED]: {
		data: {
			title: 'Информация по {user}',
			fields: [
				{ name: 'Кол-во маркеров', value: '{markersLength}', inline: true },
				{ name: 'Порядочность', value: '{userIntegrityLevel}', inline: true },
				{ name: 'Шкала порядочности', value: '{integrityScale}' }
			]
		}
	},
	[EmbedsLocalizationsIds.USER_MARKERS_INFO_MARKER_INFO_EMBED]: {
		data: {
			description: '{reason}',
			fields: [
				{ name: 'Сервер', value: '{guildName}', inline: true },
				{ name: 'Влияние на порядочность', value: '{integrityPoint}', inline: true },
			],
		}
	}
}
