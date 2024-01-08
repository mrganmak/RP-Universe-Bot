import { EmbedBuilder } from "@discordjs/builders";
import {
	EmbedsLocalizationsIds,
	ruEmbedsLocaliztion,
	enEmbedsLocaliztion,
	LocalizationsLanguages,
	EmbedsLocalization
} from "../../index.js";
import { APIEmbed } from "discord.js";

const embedsLocalizations: EmbedsLocalizations = {
	[LocalizationsLanguages.RU]: ruEmbedsLocaliztion,
	[LocalizationsLanguages.EN]: enEmbedsLocaliztion,
}

export function getLocalizationForEmbed({ embedId, language, replaceValues }: GetLocalizationForEmbedOptions): EmbedBuilder {
	const embedsLocalizationForLanguage = embedsLocalizations[language];
	const { isTimestampRequired, data } = embedsLocalizationForLanguage[embedId];

	const embed = new EmbedBuilder((
		replaceValues ?
		getEmbedDataWithReplacedValues(data, replaceValues)
		: data
	));
	if (isTimestampRequired) embed.setTimestamp(new Date());

	return embed;
}

function getEmbedDataWithReplacedValues(embedData: APIEmbed, values: ReplaceValues): APIEmbed {
	embedData = structuredClone(embedData);

	for (const [searchValue, replcaeValue] of Object.entries(values)) {
		embedData = replaceDataInEmbed(embedData, searchValue, replcaeValue);
	}

	return embedData;
}

function replaceDataInEmbed<T extends ReplaceDataInEmbedObject | string>(data: T, searchValue: string, replcaeValue: string): T {
	if (typeof data === 'string') {
		return data.replace(`{${searchValue}}`, replcaeValue) as unknown as T;
	} else {
		for (const [key, value] of Object.entries(data)) {
			if (typeof value === 'string' || typeof value === 'object') data[key] = replaceDataInEmbed(value, searchValue, replcaeValue);
		}

		return data;
	}
}

interface ReplaceDataInEmbedObject {
	[key: string]: any
}

type EmbedsLocalizations = Record<LocalizationsLanguages, EmbedsLocalization>;

interface GetLocalizationForEmbedOptions {
	embedId: EmbedsLocalizationsIds;
	language: LocalizationsLanguages;
	replaceValues?: ReplaceValues
}

interface ReplaceValues {
	[searchValue: string]: string;
}
