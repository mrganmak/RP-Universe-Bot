import { NotEmpty, VerifyName } from "discordx";
import { ECommandsIds } from "../../../enum.js";

type TCommandsLocalizationsPropertys = {
	[ECommandsIds.TEST]: TTestCommandLocalization,
	[ECommandsIds.PING]: TPingCommandLocalization,
}

type TTestCommandLocalization = {
	name: VerifyName<string>
	description: NotEmpty<string>
}

type TPingCommandLocalization = {
	name: VerifyName<string>
	description: NotEmpty<string>
}

export default TCommandsLocalizationsPropertys;
