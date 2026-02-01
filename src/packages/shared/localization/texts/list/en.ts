import { TextLocalizationIds, TextLocalizations } from "@src/index.js";

export const enTextLocaliztions: TextLocalizations = {
	[TextLocalizationIds.UserConfirmationButtonYes]: 'Yes',
	[TextLocalizationIds.UserConfirmationButtonNo]: 'No',
	[TextLocalizationIds.DataCollectionPollModalMenuMessageButton]: 'Send',
	
	// UIManager локализации
	[TextLocalizationIds.UIManagerOpenFormButton]: 'Open Form',
	[TextLocalizationIds.UIManagerErrorPrefix]: '❌ **Error:**',
	[TextLocalizationIds.UIManagerSuccessPrefix]: '✅ **Success:**',
	[TextLocalizationIds.UIManagerTimeoutErrorMessage]: 'Response time has expired. Please try again.',
	[TextLocalizationIds.UIManagerCancellationErrorMessage]: 'The poll was cancelled.',
	[TextLocalizationIds.UIManagerTechnicalErrorPrefix]: 'A technical error occurred:',
	[TextLocalizationIds.UIManagerUserSelectPlaceholder]: 'Select user',
	[TextLocalizationIds.UIManagerRoleSelectPlaceholder]: 'Select role',
	[TextLocalizationIds.UIManagerMentionableSelectPlaceholder]: 'Select user or role',
	[TextLocalizationIds.UIManagerChannelSelectPlaceholder]: 'Select channel',
	[TextLocalizationIds.UIManagerDefaultSelectPlaceholder]: 'Select option',
	
	// TicketsModule
	[TextLocalizationIds.TicketsModuleCategorySelectPlaceholder]: 'Select ticket category',
	[TextLocalizationIds.TicketsModuleRolesSelectPlaceholder]: 'Select admin roles',
	[TextLocalizationIds.TicketsModuleSetupButton]: 'Start setup',
	[TextLocalizationIds.TicketsModuleChangeSelectionQuestion]: 'Select what you want to change',
	[TextLocalizationIds.TicketsModuleChangeCategoryLabel]: 'Change ticket category',
	[TextLocalizationIds.TicketsModuleChangeRolesLabel]: 'Change admin roles',
	[TextLocalizationIds.TicketsModuleChangeRolesDescription]: 'Change roles that will have permission to manage tickets',
	[TextLocalizationIds.TicketsModuleChangeCategoryDescription]: 'Change the category where new tickets will be created',
	[TextLocalizationIds.TicketsModuleChangeIsContinueQuestion]: 'Do you want to change anything else?',
}
