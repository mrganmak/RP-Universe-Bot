import { NotEmpty, VerifyName } from "discordx";
import { ECommandsId } from "../../enum.js";
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
	[ECommandsId.TEST]: ETestCommandLocalization,
	[ECommandsId.PING]: EPingCommandLocalization
};

type TCommandsLocalizationsPropertys = {
	[ECommandsId.TEST]: TTestCommandLocalization,
	[ECommandsId.PING]: TPingCommandLocalization,
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
