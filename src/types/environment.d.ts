export {};

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			TOKEN: string;
			DB_URL: string;
			DB_NAME: string;
			TEST_GUILD_ID: string;
			DB_GUILDS_IDENTIFIRES: string;
			DB_GUILDS_LOCALIZATION_SETTINGS: string;
			DB_GUILDS_MODULES: string;
		}
	}
}
