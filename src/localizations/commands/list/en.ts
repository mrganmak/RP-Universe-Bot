import { ECommandsIds } from "../../../enum.js";
import { TCommandsLocalization } from "../types/CommandsLocalizationsTypes.js";

const enCommandsLocalization: TCommandsLocalization = {
	[ECommandsIds.TEST]: {
		name: 'test',
		description: 'test'
	},
	[ECommandsIds.PING]: {
		name: 'ping',
		description: 'ping'
	},
	[ECommandsIds.GENERATE_API_KEY]: {
		name: 'generate_api',
		description: 'Generates an API key'
	},
	[ECommandsIds.SET_SERVER_LANGUAGE]: {
		name: 'set_language',
		description: 'Set server language for correct localization',
		languageChooseName: 'language',
		languageChooseDescription: 'Language of your server'
	}
}

export default enCommandsLocalization;
