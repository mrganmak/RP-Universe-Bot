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
			DB_GUILDS_RE_SENDING_SETTINGS: string;
			DB_GUILDS_THREADS_CREATOR_SETTINGS: string;
			ICON_FOR_ANONYMOUSLY_RE_SENDING_MESSAGE: string;
			DB_GUILDS_USERS_MARKERS: string;
			YANDEX_API_KEY: string;
		}
	}
}
