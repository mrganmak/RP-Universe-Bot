import ETextsLocalizationsIds from "./ETextsLocalizationsIds.js";

export type TTextsLocalization = {
	[Key in ETextsLocalizationsIds]: string;
}
