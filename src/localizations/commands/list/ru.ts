import { ECommandsIds } from "../../../enum.js";
import { TCommandsLocalization } from "../types/CommandsLocalizationsTypes.js";

const ruCommandsLocalization: TCommandsLocalization = {
	[ECommandsIds.TEST]: {
		name: 'тест',
		description: 'тест'
	},
	[ECommandsIds.PING]: {
		name: 'ping',
		description: 'ping'
	},
	[ECommandsIds.GENERATE_API_KEY]: {
		name: 'сгенерировать_апи-ключ',
		description: 'Генерирует API-ключ'
	},
	[ECommandsIds.SET_SERVER_LANGUAGE]: {
		name: 'установить_язык',
		description: 'Задать язык сервера для корректной локализации',
		languageChooseName: 'язык',
		languageChooseDescription: 'Язык вашего сервера'
	},
	[ECommandsIds.TICKETS_SETTINGS]: {
		name: 'настройки_тикетов',
		description: 'Задать настройки для системы тикетов'
	},
	[ECommandsIds.START]: {
		name: 'старт',
		description: 'Первичные настройки бота для вашей гильдии',
	},
	[ECommandsIds.START_TICKETS]: {
		name: 'старт_тикеты',
		description: 'Первичные настройки бота для тикетов',
	}

}

export default ruCommandsLocalization;
