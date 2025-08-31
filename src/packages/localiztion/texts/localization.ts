import {
	TextLocalizations,
	TextLocalizationIds,
	ruTextLocaliztions,
	enTextLocaliztions,
	LocalizationLanguages
} from "@src/index.js";

const textsLocalizations: TextsLocalizations = {
	[LocalizationLanguages.Russian]: ruTextLocaliztions,
	[LocalizationLanguages.English]: enTextLocaliztions
}

export function getLocalizationForText(text: TextLocalizationIds, language: LocalizationLanguages): string {
	const textsForLanguage = textsLocalizations[language];

	return textsForLanguage[text];
}

/*export function getAllLocalizationsForText(text: TextLocalizationIds, options?: GetAllLocalizationsForTextOptions): string[] {
	const texts: string[] = [];

	for (const language of Object.keys(textsLocalizations) as LocalizationLanguages[]) {
		if (options?.excludeLanguages?.includes(language)) continue;

		const localization = textsLocalizations[language];
		const textForLanguage = (
			options?.isLangugageEmojiNeeded ?
			getLocalizationForText(TextLocalizationIds.LANGUAGE_EMOJI, language) + ' ' + localization[text] :
			localization[text]
		);
		texts.push(textForLanguage);
	}

	return texts;
}*/

type TextsLocalizations = Record<LocalizationLanguages, TextLocalizations>;

interface GetAllLocalizationsForTextOptions {
	excludeLanguages?: LocalizationLanguages[];
	isLangugageEmojiNeeded?: boolean
}
