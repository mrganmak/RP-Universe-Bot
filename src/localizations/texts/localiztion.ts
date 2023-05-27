import {
	TextsLocalization,
	TextsLocalizationsIds,
	ruTextsLocaliztion,
	enTextsLocaliztion,
	LocalizationsLanguages
} from "../../index.js";

const textsLocalizations: TextsLocalizations = {
	[LocalizationsLanguages.RU]: ruTextsLocaliztion,
	[LocalizationsLanguages.EN]: enTextsLocaliztion
}

export function getLocalizationForText(text: TextsLocalizationsIds, language: LocalizationsLanguages): string {
	const textsForLanguage = textsLocalizations[language];

	return textsForLanguage[text];
}

export function getAllLocalizationsForText(text: TextsLocalizationsIds, options?: GetAllLocalizationsForTextOptions): string[] {
	const texts: string[] = [];

	for (const language of Object.keys(textsLocalizations) as LocalizationsLanguages[]) {
		if (options?.excludeLanguages?.includes(language)) continue;

		const localization = textsLocalizations[language];
		const textForLanguage = (
			options?.isLangugageEmojiNeeded ?
			getLocalizationForText(TextsLocalizationsIds.LANGUAGE_EMOJI, language) + ' ' + localization[text] :
			localization[text]
		);
		texts.push(textForLanguage);
	}

	return texts;
}

type TextsLocalizations = Record<LocalizationsLanguages, TextsLocalization>;

interface GetAllLocalizationsForTextOptions {
	excludeLanguages?: LocalizationsLanguages[];
	isLangugageEmojiNeeded?: boolean
}
