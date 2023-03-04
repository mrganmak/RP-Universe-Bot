import ETextsLocalizationsIds from "../types/ETextsLocalizationsIds.js";
import { TTextsLocalization } from "../types/TextsLocalizationsTypes.js";

const enTextsLocaliztion: TTextsLocalization = {
	[ETextsLocalizationsIds.PING_COMMAND_MESSAGE_TEXT]: '🏓 | API Latency is {ping}ms',

	[ETextsLocalizationsIds.SET_SERVER_LANGUAGE_MESSAGE_TEXT]: 'English is set for your server',

	[ETextsLocalizationsIds.GENERATE_API_KEY_EMBED_LABLE]: 'API Generator',
	[ETextsLocalizationsIds.GENERATE_API_KEY_EMBED_DESCRIPTION]: 'ATTENTION! Save your key. The keys are not stored in database. Therefore, if you lose the key, you will need to generate a new one.',
	[ETextsLocalizationsIds.GENERATE_API_KEY_EMBED_KEY_FIELD_NAME]: 'Your key',
	[ETextsLocalizationsIds.GENERATE_API_KEY_RESET_WARNING_TEXT]: 'WARNING! Your guild already have a API-key. Do you want to reset it?',
	[ETextsLocalizationsIds.GENERATE_API_KEY_RESET_CANCELED_TEXT]: 'Ok reset is canceled',

	[ETextsLocalizationsIds.USER_CONFIRMATION_BUTTON_YES]: 'Yes',
	[ETextsLocalizationsIds.USER_CONFIRMATION_BUTTON_NO]: 'No',

	[ETextsLocalizationsIds.TICKETS_SETTINGS_EMBED_LABLE]: 'Ticket system settings',
	[ETextsLocalizationsIds.TICKETS_SETTINGS_EMBED_DESCRIPTION]: 'You can change each of the settings below\nJust select the one you want',
	[ETextsLocalizationsIds.TICKETS_SETTINGS_SELECT_MENU_PLACEHOLDER]: 'What do you want to change?',
	[ETextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_LABEL]: 'Change tickets category',
	[ETextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_DESCRIPTION]: 'Category in which channels with tickets will be created',
	[ETextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_EMBED_LABLE]: 'Category selection',
	[ETextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_EMBED_DESCRIPTION]: 'In order to select the category in which channels with tickets will be created, use the select menu, which is located below',
	[ETextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_IT_IS_DONE]: 'It is done.',
	[ETextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_IS_ANY_CHANGE_NEEDED]: 'Is there anything else you want to change?'
};

export default enTextsLocaliztion;
