import { ELocalizationsLanguages } from "../../enum.js";
import enTextsLocaliztion from "./list/en.js";
import ruTextsLocaliztion from "./list/ru.js";
import ETextsLocalizationsIds from "./types/ETextsLocalizationsIds.js";
import { TTextsLocalization } from "./types/TextsLocalizationsTypes.js";

const textsLocalizations: TTextsLocalizations = {
	[ELocalizationsLanguages.RU]: ruTextsLocaliztion,
	[ELocalizationsLanguages.EN]: enTextsLocaliztion
}
export function getLocalizationForText(text: ETextsLocalizationsIds, language: ELocalizationsLanguages): string {
	const textsForLanguage = textsLocalizations[language];

	return textsForLanguage[text];
}

export function getAllLocalizationsForText(text: ETextsLocalizationsIds, excludeLanguages?: Array<ELocalizationsLanguages>): Array<string> {
	const texts: Array<string> = [];

	for (const language of Object.keys(textsLocalizations) as Array<ELocalizationsLanguages>) {
		if (excludeLanguages?.includes(language)) continue;

		const localization = textsLocalizations[language];
		const textForLanguage = localization[text];
		texts.push(textForLanguage);
	}

	return texts;
}

type TTextsLocalizations = {
	[key in ELocalizationsLanguages]: TTextsLocalization;
}
