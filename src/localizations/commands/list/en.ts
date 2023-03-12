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
	},
	[ECommandsIds.TICKETS_SETTINGS]: {
		name: 'tickets_settings',
		description: 'Set preferences for the ticket system'
	},
	[ECommandsIds.START]: {
		name: 'start',
		description: 'Primary bot settings for your guild',
	},
	[ECommandsIds.START_TICKETS]: {
		name: 'start_tickets',
		description: 'Primary settings for the ticket module',
	}
}

export default enCommandsLocalization;
