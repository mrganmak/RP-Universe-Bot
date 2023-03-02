import { NotEmpty, VerifyName } from "discordx";
import { ECommandsIds } from "../../enum.js";
import { ValueOf } from "../../types/types.js";
import { TCommandLocalization } from "./types/LocalizationsTypes.js";

enum ETestCommandLocalization {
	name,
	description,
}

enum EPingCommandLocalization {
	name,
	description,
}
const commandsLocalizationsPropertys = {
	[ECommandsIds.TEST]: ETestCommandLocalization,
	[ECommandsIds.PING]: EPingCommandLocalization
};

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
