import { TextLocalizationIds, TextLocalizations } from "@src/index.js";

export const ruTextLocaliztions: TextLocalizations = {
	[TextLocalizationIds.UserConfirmationButtonYes]: 'Да',
	[TextLocalizationIds.UserConfirmationButtonNo]: 'Нет',
	[TextLocalizationIds.DataCollectionPollModalMenuMessageButton]: 'Отправить',
	
	// UIManager локализации
	[TextLocalizationIds.UIManagerOpenFormButton]: 'Открыть форму',
	[TextLocalizationIds.UIManagerErrorPrefix]: '❌ **Ошибка:**',
	[TextLocalizationIds.UIManagerSuccessPrefix]: '✅ **Успешно:**',
	[TextLocalizationIds.UIManagerTimeoutErrorMessage]: 'Время ожидания ответа истекло. Пожалуйста, попробуйте снова.',
	[TextLocalizationIds.UIManagerCancellationErrorMessage]: 'Опрос был отменен.',
	[TextLocalizationIds.UIManagerTechnicalErrorPrefix]: 'Произошла техническая ошибка:',
	[TextLocalizationIds.UIManagerUserSelectPlaceholder]: 'Выберите пользователя',
	[TextLocalizationIds.UIManagerRoleSelectPlaceholder]: 'Выберите роль',
	[TextLocalizationIds.UIManagerMentionableSelectPlaceholder]: 'Выберите пользователя или роль',
	[TextLocalizationIds.UIManagerChannelSelectPlaceholder]: 'Выберите канал',
	[TextLocalizationIds.UIManagerDefaultSelectPlaceholder]: 'Выберите опцию',
	
	// TicketsModule
	[TextLocalizationIds.TicketsModuleCategorySelectPlaceholder]: 'Выберите категорию для тикетов',
	[TextLocalizationIds.TicketsModuleRolesSelectPlaceholder]: 'Выберите админские роли',
	[TextLocalizationIds.TicketsModuleSetupButton]: 'Начать настройку',
	[TextLocalizationIds.TicketsModuleChangeSelectionQuestion]: 'Выберите, что вы хотите изменить',
	[TextLocalizationIds.TicketsModuleChangeCategoryLabel]: 'Изменить категорию тикетов',
	[TextLocalizationIds.TicketsModuleChangeCategoryDescription]: 'Изменить категорию, где будут создаваться новые тикеты',
	[TextLocalizationIds.TicketsModuleChangeRolesLabel]: 'Изменить админские роли',
	[TextLocalizationIds.TicketsModuleChangeRolesDescription]: 'Изменить роли, которые будут иметь разрешение на управление тикетами',
	[TextLocalizationIds.TicketsModuleChangeIsContinueQuestion]: 'Хотите изменить что-то еще?',
}
