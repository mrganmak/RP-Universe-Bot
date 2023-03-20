import { APIMessageComponentEmoji } from "discord.js";
import { TextsLocalizationsIds } from "../index.js";

export type ValueOf<T> = T[keyof T];
export type ChangeAllTypes<InstanceType extends any[] | Object, FinalType extends any, TargetType extends any = string> = {
	[Key in keyof InstanceType]: (
		NonNullable<InstanceType[Key]> extends TargetType ?
		FinalType :
		(
			NonNullable<InstanceType[Key]> extends any[] ?
			ChangeAllTypes<NonNullable<InstanceType[Key]>, FinalType, TargetType> :
			(
				NonNullable<InstanceType[Key]> extends Object ?
				ChangeAllTypes<NonNullable<InstanceType[Key]>, FinalType, TargetType> :
				InstanceType[Key]
			)
		)
	)
}

export type SelectMenuOptionsWithLocalizations = SelectMenuOptionWithLocalizations[];
export interface SelectMenuOptionWithLocalizations {
	label: TextsLocalizationsIds;
	value: string;
	default?: boolean;
	description?: TextsLocalizationsIds;
	emoji?: APIMessageComponentEmoji;
}
