import { Snowflake } from "discord.js";
import { ELocalizationsLanguages } from "../enum.js";
import GuildsLocalizationSettingsBase from "../Databases/bases_list/GuildsLocalizationSettingsBase.js";
import { DEFAULT_SERVER_LANGUAGE } from "../consts.js";

export async function getGuildLanguage(guildId: Snowflake): Promise<ELocalizationsLanguages> {
	const base = new GuildsLocalizationSettingsBase();
	const language = await base.getByGuildId(guildId);

	return (language?.language ?? DEFAULT_SERVER_LANGUAGE);
}
