import { CommandsLocalization, CommandsIds } from "../../../index.js";

export const enCommandsLocalization: CommandsLocalization = {
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
	},
	[CommandsIds.RE_SENDERS_SETTINGS]: {
		name: 're_senders_settings',
		description: 'Settings for forwarding messages in channels on behalf of a bot',
	},
	[CommandsIds.USER_MARKERS_INFO]: {
		name: 'user_markers_info',
		description: 'Shows information on user markers',
		targetUserName: 'target_user',
		targetUserDescription: 'User to request information from'
	}
}
