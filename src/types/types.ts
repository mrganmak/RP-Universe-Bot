import { APIMessageComponentEmoji } from "discord.js";
import ETextsLocalizationsIds from "../localizations/texts/types/ETextsLocalizationsIds.js";

export type ValueOf<T> = T[keyof T];

export type TSelectMenuOptionsWithLocalizations = Array<ISelectMenuOptionWithLocalizations>;
export interface ISelectMenuOptionWithLocalizations {
	label: ETextsLocalizationsIds;
	value: string;
	default?: boolean;
	description?: ETextsLocalizationsIds;
	emoji?: APIMessageComponentEmoji;
}
