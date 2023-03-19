import { LocalizationsLanguages } from "../../enum.js";
import enTextsLocaliztion from "./list/en.js";
import ruTextsLocaliztion from "./list/ru.js";
import TextsLocalizationsIds from "./types/TextsLocalizationsIds.js";
import { TextsLocalization } from "./types/TextsLocalizationsTypes.js";

const textsLocalizations: TextsLocalizations = {
	[LocalizationsLanguages.RU]: ruTextsLocaliztion,
	[LocalizationsLanguages.EN]: enTextsLocaliztion
}
export function getLocalizationForText(text: TextsLocalizationsIds, language: LocalizationsLanguages): string {
	const textsForLanguage = textsLocalizations[language];

	return textsForLanguage[text];
}

export function getAllLocalizationsForText(text: TextsLocalizationsIds, options?:IGetAllLocalizationsForTextOptions): Array<string> {
	const texts: Array<string> = [];

	for (const language of Object.keys(textsLocalizations) as Array<LocalizationsLanguages>) {
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

interface IGetAllLocalizationsForTextOptions {
	excludeLanguages?: Array<LocalizationsLanguages>;
	isLangugageEmojiNeeded?: boolean
}
