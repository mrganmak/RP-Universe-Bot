import { NotEmpty, VerifyName } from "discordx";
import { CommandsIds } from "../../../index.js";

export type CommandsLocalizationsPropertys = {
	[CommandsIds.TEST]: DefaultCommandLocalizationPropertys,
	[CommandsIds.PING]: DefaultCommandLocalizationPropertys,
	[CommandsIds.GENERATE_API_KEY]: DefaultCommandLocalizationPropertys,
	[CommandsIds.SET_SERVER_LANGUAGE]: SetServerLanguageCommandLocalizationPropertys,
	[CommandsIds.TICKETS_SETTINGS]: DefaultCommandLocalizationPropertys,
	[CommandsIds.START]: DefaultCommandLocalizationPropertys,
	[CommandsIds.START_TICKETS]: DefaultCommandLocalizationPropertys,
	[CommandsIds.RE_SENDERS_SETTINGS]: DefaultCommandLocalizationPropertys,
	[CommandsIds.USER_MARKERS_INFO]: UserMarkersInfoCommandLocalizationPropertys,
	[CommandsIds.START_MARKERS]: DefaultCommandLocalizationPropertys,
}

interface DefaultCommandLocalizationPropertys {
	name: VerifyName<string>
	description: NotEmpty<string>
}

interface SetServerLanguageCommandLocalizationPropertys extends DefaultCommandLocalizationPropertys {
	languageChooseName: VerifyName<string>
	languageChooseDescription: NotEmpty<string>
}

interface UserMarkersInfoCommandLocalizationPropertys extends DefaultCommandLocalizationPropertys {
	targetUserName: VerifyName<string>
	targetUserDescription: NotEmpty<string>
}
