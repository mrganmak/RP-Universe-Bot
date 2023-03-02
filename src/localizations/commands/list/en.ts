import { ECommandsIds } from "../../../enum.js";
import { TCommandsLocalization } from "../types/LocalizationsTypes.js";

const enLocalization: TCommandsLocalization = {
	[ECommandsIds.TEST]: {
		name: 'test',
		description: 'test'
	},
	[ECommandsIds.PING]: {
		name: 'ping',
		description: 'ping'
	}
}

export default enLocalization;
