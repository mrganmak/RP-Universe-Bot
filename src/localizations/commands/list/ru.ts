import { ECommandsIds } from "../../../enum.js";
import { TCommandsLocalization } from "../types/LocalizationsTypes.js";

const ruLocalization: TCommandsLocalization = {
	[ECommandsIds.TEST]: {
		name: 'тест',
		description: 'тест'
	},
	[ECommandsIds.PING]: {
		name: 'ping',
		description: 'ping'
	}
}

export default ruLocalization;
