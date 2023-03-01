import { ECommandsId } from "../../../enum.js";
import { TCommandsLocalization } from "../types/LocalizationsTypes.js";

const ruLocalization: TCommandsLocalization = {
	[ECommandsId.TEST]: {
		name: 'тест',
		description: 'тест'
	},
	[ECommandsId.PING]: {
		name: 'ping',
		description: 'ping'
	}
}

export default ruLocalization;
