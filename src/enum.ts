export enum CommandsIds {
	TEST,
	PING,
	GENERATE_API_KEY,
	SET_SERVER_LANGUAGE,
	TICKETS_SETTINGS,
	START,
	START_TICKETS,
	RE_SENDERS_SETTINGS,
	USER_MARKERS_INFO
}

export enum CommandsCategoriesIds {
	DEVELOPMENT = 'development',
	ONLY_IN_INITED_GUILDS = 'only_in_inited_guilds',
	ONLY_IN_NOT_INITED_GUILDS = 'only_in_not_inited_guilds',
	ONLY_WITH_TICKETS_INITED = 'only_with_tickets_inited',
	ONLY_WITH_TICKETS_NOT_INITED = 'only_with_tickets_not_inited'
}

export enum LocalizationsLanguages {
	EN = 'en-GB',
	RU = 'ru'
}

export enum GuildModules {
	INITED_GUILD = 'isGuildInited',
	TICKETS = 'isTicketsModuleInited'
}

export enum ButtosPanelSSettingsIds { }
