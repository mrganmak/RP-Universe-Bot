import { APIMessageComponentEmoji } from "discord.js";
import ETextsLocalizationsIds from "../localizations/texts/types/ETextsLocalizationsIds.js";

export type ValueOf<T> = T[keyof T];
export type ChangeAllTypes<InstanceType extends Array<any> | Object, FinalType extends any, TargetType extends any = string> = {
	[Key in keyof InstanceType]: (
		NonNullable<InstanceType[Key]> extends TargetType ?
		FinalType :
		(
			NonNullable<InstanceType[Key]> extends Array<any> ?
			ChangeAllTypes<NonNullable<InstanceType[Key]>, FinalType, TargetType> :
			(
				NonNullable<InstanceType[Key]> extends Object ?
				ChangeAllTypes<NonNullable<InstanceType[Key]>, FinalType, TargetType> :
				InstanceType[Key]
			)
		)
	)
}

export type TSelectMenuOptionsWithLocalizations = Array<ISelectMenuOptionWithLocalizations>;
export interface ISelectMenuOptionWithLocalizations {
	label: ETextsLocalizationsIds;
	value: string;
	default?: boolean;
	description?: ETextsLocalizationsIds;
	emoji?: APIMessageComponentEmoji;
}
