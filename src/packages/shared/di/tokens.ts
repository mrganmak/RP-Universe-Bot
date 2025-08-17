export const TOKENS = {
	Client: Symbol("DiscordClient"),
	Mongo: Symbol("MongoClient"),
	GuildSettingsBase: Symbol("GuildSettingsBase"),
	TicketRepo: Symbol("TicketRepo"),
	Bus: Symbol("ModuleCommandsBus"),
	GuildPolicy: Symbol("GuildPolicy"),
} as const;
