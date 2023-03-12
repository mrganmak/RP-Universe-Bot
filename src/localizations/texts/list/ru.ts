import ETextsLocalizationsIds from "../types/ETextsLocalizationsIds.js";
import { TTextsLocalization } from "../types/TextsLocalizationsTypes.js";

const ruTextsLocaliztion: TTextsLocalization = {
	[ETextsLocalizationsIds.LANGUAGE_EMOJI]: '🇷🇺',

	[ETextsLocalizationsIds.PING_COMMAND_MESSAGE_TEXT]: '🏓 | Задержка апи: {ping}мс',

	[ETextsLocalizationsIds.SET_SERVER_LANGUAGE_MESSAGE_TEXT]: 'Русский язык установлен для вашего сервера',

	[ETextsLocalizationsIds.GENERATE_API_KEY_EMBED_LABLE]: 'Генератор ключей',
	[ETextsLocalizationsIds.GENERATE_API_KEY_EMBED_DESCRIPTION]: 'ВНИМАНИЕ! Сохраните ваш ключ. Ключи не хранятся в базе данных. Поэтому, если вы потеряет ключ, вам будет необходимо генерировать новый',
	[ETextsLocalizationsIds.GENERATE_API_KEY_EMBED_KEY_FIELD_NAME]: 'Ваш ключ',
	[ETextsLocalizationsIds.GENERATE_API_KEY_RESET_WARNING_TEXT]: 'ПРЕДУПРЕЖДЕНИЕ! У вашего серва уже есть API-ключ. Вы хотите его сбросить?',
	[ETextsLocalizationsIds.GENERATE_API_KEY_RESET_CANCELED_TEXT]: 'Хорошо, сброс отменён',

	[ETextsLocalizationsIds.USER_CONFIRMATION_BUTTON_YES]: 'Да',
	[ETextsLocalizationsIds.USER_CONFIRMATION_BUTTON_NO]: 'Нет',

	[ETextsLocalizationsIds.TICKETS_SETTINGS_EMBED_LABLE]: 'Настройки системы тикетов',
	[ETextsLocalizationsIds.TICKETS_SETTINGS_EMBED_DESCRIPTION]: 'Вы можете изменить каждую из настроек ниже\nПросто выберите нужное',
	[ETextsLocalizationsIds.TICKETS_SETTINGS_SELECT_MENU_PLACEHOLDER]: 'Что вы хотите изменить?',
	[ETextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_LABEL]: 'Изменить категорию',
	[ETextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_DESCRIPTION]: 'Категория, в которой будут создаваться каналы с тикетами',
	[ETextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_EMBED_LABLE]: 'Выбор категории',
	[ETextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_EMBED_DESCRIPTION]: 'Для того, чтобы выбрать категорию, в которой будут создаваться каналы с тикетами, воспользоуйтесть селект меню, которое расположено ниже',
	[ETextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CHANNEL_EMBED_LABLE]: 'Выбор канала',
	[ETextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CHANNEL_EMBED_DESCRIPTION]: 'Канал, куда необходимо отправить сообщение с тикетом',
	[ETextsLocalizationsIds.TICKETS_SETTINGS_IT_IS_DONE]: 'Дело сделано.',
	[ETextsLocalizationsIds.TICKETS_SETTINGS_IS_ANY_CHANGE_NEEDED]: 'Хотите ли вы изменить ещё что-то?',

	[ETextsLocalizationsIds.START_ABOUT_ME]: 'Приветствую тебя, дорогой друг!\nЯ — интеллектуальная машина, которая поможет тебе управлять твоим РП сервером.\nПодробную информацию ты можешь найти, перейдя по ссылке на гитхаб\nПосле прохождения первичной настройки тебе откроются новые команды, при помощи которых ты сможешь настроить меня конкретно под свой сервер.',
	[ETextsLocalizationsIds.START_CHOOSE_LANGUAGE]: 'Для начала настроим язык сервера.',
	[ETextsLocalizationsIds.START_FINAL]: 'Первичные настройки завершены\nТеперь вы можете написать в чат / и посмотреть на список доступных команд',
}

export default ruTextsLocaliztion;
