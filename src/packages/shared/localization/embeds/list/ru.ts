import { Colors } from "discord.js";
import { EmbedsLocalization, EmbedLocalizationIds } from "@src/index.js";

export const ruEmbedsLocaliztion: EmbedsLocalization = {
	[EmbedLocalizationIds.TicketsModuleSetup]: {
		isTimestampRequired: false,
		data: {
			title: 'Настройка модуля тикетов',
			description: 'Добро пожаловать в настройку модуля тикетов! Вам нужно настроить два параметра:',
			color: Colors.Blue,
			fields: [
				{
					name: '1. Категория тикетов',
					value: 'Выберите категорию, где будут создаваться новые тикеты',
					inline: false
				},
				{
					name: '2. Админские роли',
					value: 'Выберите роли, которые будут иметь разрешение на управление тикетами',
					inline: false
				}
			]
		}
	},
	[EmbedLocalizationIds.TicketsModuleCategoryQuestion]: {
		isTimestampRequired: false,
		data: {
			title: 'Выберите категорию тикетов',
			description: 'Выберите категорию, где будут создаваться новые тикеты. Будут показаны только категории каналов.',
			color: Colors.Green
		}
	},
	[EmbedLocalizationIds.TicketsModuleRolesQuestion]: {
		isTimestampRequired: false,
		data: {
			title: 'Выберите админские роли',
			description: 'Выберите роли, которые будут иметь разрешение на управление тикетами. Вы можете выбрать несколько ролей.',
			color: Colors.Orange
		}
	},
}
