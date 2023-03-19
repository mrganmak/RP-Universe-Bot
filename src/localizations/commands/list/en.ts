import { CommandsIds } from "../../../enum.js";
import { CommandsLocalization } from "../types/CommandsLocalizationsTypes.js";

const enCommandsLocalization: CommandsLocalization = {
	[CommandsIds.TEST]: {
		name: 'test',
		description: 'test'
	},
	[CommandsIds.PING]: {
		name: 'ping',
		description: 'ping'
	},
	[CommandsIds.GENERATE_API_KEY]: {
		name: 'generate_api',
		description: 'Generates an API key'
	},
	[CommandsIds.SET_SERVER_LANGUAGE]: {
		name: 'set_language',
		description: 'Set server language for correct localization',
		languageChooseName: 'language',
		languageChooseDescription: 'Language of your server'
	},
	[CommandsIds.TICKETS_SETTINGS]: {
		name: 'tickets_settings',
		description: 'Set preferences for the ticket system'
	},
	[CommandsIds.START]: {
		name: 'start',
		description: 'Primary bot settings for your guild',
	},
	[CommandsIds.START_TICKETS]: {
		name: 'start_tickets',
		description: 'Primary settings for the ticket module',
	}
}

export default enCommandsLocalization;
