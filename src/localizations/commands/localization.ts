import { ApplicationCommandOptions } from "discordx"
import {
	CommandsLocalization,
	ruCommandsLocalization,
	enCommandsLocalization,
	CommandsLocalizationsPropertys,
	CommandsIds,
	LocalizationsLanguages,
} from "../../index.js"

const commandsLocalizations: CommandsLocalizations = {
	[LocalizationsLanguages.RU]: ruCommandsLocalization,
	[LocalizationsLanguages.EN]: enCommandsLocalization
}

export function getLocalizationForCommand<T extends CommandsIds>(commandId: T, language: LocalizationsLanguages): CommandsLocalization[T] {
	const languageLocalization = commandsLocalizations[language];
	const commandLocalization = languageLocalization[commandId];

	return commandLocalization;
}

export function getLocalizationsForCommandProperty<T extends CommandsIds>(
	commandId: T,
	property: keyof CommandsLocalizationsPropertys[T],
	languages: LocalizationsLanguages[]
): NameLocalizations {
	const localizations: NameLocalizations = {};

	for (const language of languages) {
		const propertyLocalization = getLocalizationForCommandProperty(commandId, property, language);
		localizations[language] = propertyLocalization;
	}

	return localizations;
}

export function getAllLocalizationsForCommandProperty<T extends CommandsIds>(
	commandId: T,
	property: keyof CommandsLocalizationsPropertys[T],
	excludeLanguages?: LocalizationsLanguages[],
): NameLocalizations {
	const localizations: NameLocalizations = {};

	for (const language of Object.keys(commandsLocalizations) as LocalizationsLanguages[]) {
		if (excludeLanguages?.includes(language)) continue;

		const propertyLocalization = getLocalizationForCommandProperty(commandId, property, language);
		localizations[language] = propertyLocalization;
	}

	return localizations;
}

function getLocalizationForCommandProperty<T extends CommandsIds>(
	commandId: T,
	property: keyof CommandsLocalizationsPropertys[T],
	language: LocalizationsLanguages
): CommandsLocalization[T][keyof CommandsLocalizationsPropertys[T]] {
	const languageLocalization = getLocalizationForCommand(commandId, language);
	const propertyLocalization = languageLocalization[property];

	return propertyLocalization;
}

type NameLocalizations = ApplicationCommandOptions<string, string>['nameLocalizations'];
type CommandsLocalizations = Record<LocalizationsLanguages, CommandsLocalization>;
