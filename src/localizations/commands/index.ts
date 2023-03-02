import { ApplicationCommandOptions } from "discordx"
import { ECommandsIds, ELocalizationsLanguages } from "../../enum.js"
import TCommandsLocalizationsPropertys from "./commandsLocalizationsPropertys.js"
import enLocalization from "./list/en.js"
import ruLocalization from "./list/ru.js"
import { TCommandsLocalization } from "./types/LocalizationsTypes.js"

const commandsLocalizations: TCommandsLocalizations = {
	[ELocalizationsLanguages.RU]: ruLocalization,
	[ELocalizationsLanguages.EN]: enLocalization
}

export function getLocalizationForCommand<T extends ECommandsIds>(commandId: T, language: ELocalizationsLanguages): TCommandsLocalization[T] {
	const languageLocalization = commandsLocalizations[language];
	const commandLocalization = languageLocalization[commandId];

	return commandLocalization;
}

export function getLocalizationsForCommandProperty<T extends ECommandsIds>(
	commandId: T,
	property: keyof TCommandsLocalizationsPropertys[T],
	languages: Array<ELocalizationsLanguages>
): ApplicationCommandOptions<string, string>['nameLocalizations'] {
	const localizations: ApplicationCommandOptions<string, string>['nameLocalizations'] = {};

	for (const language of languages) {
		const propertyLocalization = getLocalizationForCommandProperty(commandId, property, language);
		localizations[language] = propertyLocalization;
	}

	return localizations;
}

export function getAllLocalizationsForCommandProperty<T extends ECommandsIds>(
	commandId: T,
	property: keyof TCommandsLocalizationsPropertys[T],
	excludeLanguages?: Array<ELocalizationsLanguages>,
): ApplicationCommandOptions<string, string>['nameLocalizations'] {
	const localizations: ApplicationCommandOptions<string, string>['nameLocalizations'] = {};

	for (const language of Object.keys(commandsLocalizations) as Array<ELocalizationsLanguages>) {
		if (excludeLanguages?.includes(language)) continue;

		const propertyLocalization = getLocalizationForCommandProperty(commandId, property, language);
		localizations[language] = propertyLocalization;
	}

	return localizations;
}

function getLocalizationForCommandProperty<T extends ECommandsIds>(
	commandId: T,
	property: keyof TCommandsLocalizationsPropertys[T],
	language: ELocalizationsLanguages
): TCommandsLocalization[T][keyof TCommandsLocalizationsPropertys[T]] {
	const languageLocalization = getLocalizationForCommand(commandId, language);
	const propertyLocalization = languageLocalization[property];

	return propertyLocalization;
}

type TCommandsLocalizations = {
	[key in ELocalizationsLanguages]: TCommandsLocalization
}
