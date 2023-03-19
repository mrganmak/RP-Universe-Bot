import { CommandsLocalizationsPropertys, ValueOf } from "../../../index.js";

export type CommandsLocalization = {
	[Key in keyof CommandsLocalizationsPropertys]: CommandLocalization<CommandsLocalizationsPropertys[Key]>;
}

export type CommandLocalization<T extends ValueOf<CommandsLocalizationsPropertys>> = {
	[Key in keyof T]: T[Key] extends string ? T[Key] : string;
}
