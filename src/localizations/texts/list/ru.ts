import { TTextsLocalization } from "../types/TextsLocalizationsTypes.js";
import EDefaultTextLocalization from "./default.js";

const ruTextsLocaliztion: TTextsLocalization = {
	[EDefaultTextLocalization.PING_COMMAND_MESSAGE_TEXT]: '🏓 | Задержка апи: {ping}мс',

	[EDefaultTextLocalization.SET_SERVER_LANGUAGE_MESSAGE_TEXT]: 'Русский язык установлен для вашего сервера',

	[EDefaultTextLocalization.GENERATE_API_KEY_EMBED_TITLE]: 'Генератор ключей',
	[EDefaultTextLocalization.GENERATE_API_KEY_EMBED_DESCRIPTION]: 'ВНИМАНИЕ! Сохраните ваш ключ. Ключи не хранятся в базе данных. Поэтому при утере ключа, вам будет необходимо генерировать новый',
	[EDefaultTextLocalization.GENERATE_API_KEY_EMBED_KEY_FIELD_NAME]: 'Ваш ключ'
}

export default ruTextsLocaliztion;
