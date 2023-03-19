import { Snowflake } from "discord.js";
import { LocalizationsLanguages, GuildsLocalizationSettingsBase, DEFAULT_SERVER_LANGUAGE } from "../index.js";

export async function getGuildLanguage(guildId: Snowflake): Promise<LocalizationsLanguages> {
	const base = new GuildsLocalizationSettingsBase();
	const language = await base.getByGuildId(guildId);

	return (language?.language ?? DEFAULT_SERVER_LANGUAGE);
}
