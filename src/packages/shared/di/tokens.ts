export const TOKENS = {
	Client: Symbol("DiscordClient"),
	Mongo: Symbol("MongoClient"),
	GuildSettingsBase: Symbol("GuildSettingsBase"),
	TicketRepo: Symbol("TicketRepo"),
	Bus: Symbol("ModulesBus"),
	GuildPolicy: Symbol("GuildPolicy"),
} as const;
