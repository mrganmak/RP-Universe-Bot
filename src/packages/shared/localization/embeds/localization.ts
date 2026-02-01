import { EmbedBuilder } from "@discordjs/builders";
import {
	EmbedLocalizationIds,
	ruEmbedsLocaliztion,
	enEmbedsLocaliztion,
	LocalizationLanguages,
	EmbedsLocalization
} from "@src/index.js";
import { APIEmbed } from "discord.js";

const embedsLocalizations: EmbedsLocalizations = {
	[LocalizationLanguages.Russian]: ruEmbedsLocaliztion,
	[LocalizationLanguages.English]: enEmbedsLocaliztion,
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
	embedData = replaceDataInEmbed(embedData, values);

	return embedData;
}

function replaceDataInEmbed<T extends ReplaceDataInEmbedObject | string>(data: T, values: ReplaceValues): T {
	if (typeof data === 'string') {
		if (data.search('{') === -1) return data;

		const regex = /#?\{([^}]+)\}/g;
		const targetValues = Array.from(data.matchAll(regex), m => m[1]);

		for (const targetValue of targetValues) {
            if (values[targetValue]) data = data.replace(`{${targetValue}}`, values[targetValue]) as unknown as T;
        }
		return data;
	} else {
		for (const [key, value] of Object.entries(data)) {
			if (typeof value === 'string' || typeof value === 'object') data[key] = replaceDataInEmbed(value, values);
		}

		return data;
	}
}

interface ReplaceDataInEmbedObject {
	[key: string]: any
}

type EmbedsLocalizations = Record<LocalizationLanguages, EmbedsLocalization>;

interface GetLocalizationForEmbedOptions {
	embedId: EmbedLocalizationIds;
	language: LocalizationLanguages;
	replaceValues?: ReplaceValues
}

interface ReplaceValues {
	[searchValue: string]: string;
}
