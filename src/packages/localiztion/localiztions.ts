import { Guild, Locale } from "discord.js";
import { LocalizationLanguages, DEFAULT_SERVER_LANGUAGE } from "@src/index.js";

export function getGuildLanguage(guild: Guild): LocalizationLanguages {
	if (!guild.preferredLocale) {
		return DEFAULT_SERVER_LANGUAGE;
	} else {
		if (guild.preferredLocale === Locale.EnglishUS || guild.preferredLocale === Locale.EnglishGB) return LocalizationLanguages.English;
		else if (!(guild.preferredLocale in LocalizationLanguages)) return DEFAULT_SERVER_LANGUAGE;
		else return guild.preferredLocale as any as LocalizationLanguages;
	}
}
