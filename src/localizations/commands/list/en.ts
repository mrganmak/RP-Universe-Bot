import { ECommandsId } from "../../../enum.js";
import { TCommandsLocalization } from "../types/LocalizationsTypes.js";

const enLocalization: TCommandsLocalization = {
	[ECommandsId.TEST]: {
		name: 'test',
		description: 'test'
	},
	[ECommandsId.PING]: {
		name: 'ping',
		description: 'ping'
	}
}

export default enLocalization;
