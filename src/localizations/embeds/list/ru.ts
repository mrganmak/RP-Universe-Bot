import { Colors } from "discord.js";
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
			description: 'Причина маркера\n{reason}',
			fields: [
				{ name: 'Сервер', value: '{guildName}', inline: true },
				{ name: 'Влияние на порядочность', value: '{integrityPoint}', inline: true },
			],
		}
	},
	[EmbedsLocalizationsIds.TICKET_MESSAGE_EMBED]: {
		data: {
			title: 'Тикет #{ticketNumber}',
			description: 'Снизу расположены кнопки для управления вашим тикетом',
			color: Colors.Purple
		},
		isTimestampRequired: true
	},
	[EmbedsLocalizationsIds.WELCOME_MESSAGE]: {
		isTimestampRequired: true,
		data: {
			title: 'Добро пожаловать на сервер!',
			description: 'Мы рады видеть {user} в нашем сообществе!',
			color: 0x2F3136
		}
	}
}
