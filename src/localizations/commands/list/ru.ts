import { CommandsLocalization, CommandsIds } from "../../../index.js";

export const ruCommandsLocalization: CommandsLocalization = {
	[CommandsIds.TEST]: {
		name: 'тест',
		description: 'тест'
	},
	[CommandsIds.PING]: {
		name: 'ping',
		description: 'ping'
	},
	[CommandsIds.GENERATE_API_KEY]: {
		name: 'сгенерировать_апи-ключ',
		description: 'Генерирует API-ключ'
	},
	[CommandsIds.SET_SERVER_LANGUAGE]: {
		name: 'установить_язык',
		description: 'Задать язык сервера для корректной локализации',
		languageChooseName: 'язык',
		languageChooseDescription: 'Язык вашего сервера'
	},
	[CommandsIds.TICKETS_SETTINGS]: {
		name: 'настройки_тикетов',
		description: 'Задать настройки для системы тикетов'
	},
	[CommandsIds.START]: {
		name: 'старт',
		description: 'Первичные настройки бота для вашей гильдии',
	},
	[CommandsIds.START_TICKETS]: {
		name: 'старт_тикеты',
		description: 'Первичные настройки бота для тикетов',
	},
	[CommandsIds.RE_SENDERS_SETTINGS]: {
		name: 'настройки_переотправщика',
		description: 'Настройки для переотправки сообщений в каналах от лица бота',
	},
	[CommandsIds.USER_MARKERS_INFO]: {
		name: 'маркеры_пользователя',
		description: 'Показывает информацию по маркерам пользователя',
		targetUserName: 'цель',
		targetUserDescription: 'Пользователь, у которого нужно запросить информацию'
	}
}
