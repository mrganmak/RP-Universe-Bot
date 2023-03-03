import { ValueOf } from "../../../types/types.js";
import TCommandsLocalizationsPropertys from "./СommandsLocalizationsPropertys.js";

export type TCommandsLocalization = {
	[Key in keyof TCommandsLocalizationsPropertys]: TCommandLocalization<TCommandsLocalizationsPropertys[Key]>;
}

export type TCommandLocalization<T extends ValueOf<TCommandsLocalizationsPropertys>> = {
	[Key in keyof T]: T[Key] extends string ? T[Key] : string;
}