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
		name: 'generate_api',
		description: 'Генерирует API-ключ'
	},
	[ECommandsIds.SET_SERVER_LANGUAGE]: {
		name: 'set_language',
		description: 'Задать язык сервера для корректной локализации',
		languageChooseName: 'language',
		languageChooseDescription: 'Язык вашего сервера'
	}
}

export default ruCommandsLocalization;
