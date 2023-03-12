import { NotEmpty, VerifyName } from "discordx";
import { ECommandsIds } from "../../../enum.js";

type TCommandsLocalizationsPropertys = {
	[ECommandsIds.TEST]: IDefaultCommandLocalizationPropertys,
	[ECommandsIds.PING]: IDefaultCommandLocalizationPropertys,
	[ECommandsIds.GENERATE_API_KEY]: IDefaultCommandLocalizationPropertys,
	[ECommandsIds.SET_SERVER_LANGUAGE]: ISetServerLanguageCommandLocalizationPropertys,
	[ECommandsIds.TICKETS_SETTINGS]: IDefaultCommandLocalizationPropertys,
	[ECommandsIds.START]: IDefaultCommandLocalizationPropertys,
	[ECommandsIds.START_TICKETS]: IDefaultCommandLocalizationPropertys,
}

interface IDefaultCommandLocalizationPropertys {
	name: VerifyName<string>
	description: NotEmpty<string>
}

interface ISetServerLanguageCommandLocalizationPropertys extends IDefaultCommandLocalizationPropertys {
	languageChooseName: VerifyName<string>
	languageChooseDescription: NotEmpty<string>
}

export default TCommandsLocalizationsPropertys;
