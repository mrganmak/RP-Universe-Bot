import { ApplicationCommandOptions } from "discordx"
import { CommandsIds, LocalizationsLanguages } from "../../enum.js"
import CommandsLocalizationsPropertys from "./types/СommandsLocalizationsPropertys.js"
import enCommandsLocalization from "./list/en.js"
import ruCommandsLocalization from "./list/ru.js"
import { CommandsLocalization } from "./types/CommandsLocalizationsTypes.js"

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
	languages: Array<LocalizationsLanguages>
): ApplicationCommandOptions<string, string>['nameLocalizations'] {
	const localizations: ApplicationCommandOptions<string, string>['nameLocalizations'] = {};

	for (const language of languages) {
		const propertyLocalization = getLocalizationForCommandProperty(commandId, property, language);
		localizations[language] = propertyLocalization;
	}

	return localizations;
}

export function getAllLocalizationsForCommandProperty<T extends CommandsIds>(
	commandId: T,
	property: keyof CommandsLocalizationsPropertys[T],
	excludeLanguages?: Array<LocalizationsLanguages>,
): ApplicationCommandOptions<string, string>['nameLocalizations'] {
	const localizations: ApplicationCommandOptions<string, string>['nameLocalizations'] = {};

	for (const language of Object.keys(commandsLocalizations) as Array<LocalizationsLanguages>) {
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

type CommandsLocalizations = Record<LocalizationsLanguages, CommandsLocalization>;
