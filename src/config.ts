import { ButtonStyle } from "discord.js";
import { UserConfirmationInteractionButtonSettings, TextsLocalizationsIds, ButtonsPanelsSettings, SelectMenuOptionsWithLocalizations } from "./index.js";

export const devMode = true;

export const userConfirmationInteractionButtonsSettings: UserConfirmationInteractionButtonSettings[] = [
	{
		label: TextsLocalizationsIds.USER_CONFIRMATION_BUTTON_NO,
		style: ButtonStyle.Danger,
		customId: 'deny'
	},
	{
		label: TextsLocalizationsIds.USER_CONFIRMATION_BUTTON_YES,
		style: ButtonStyle.Success,
		customId: 'confirm'
	}
];

export const buttonsPanelsSettings: ButtonsPanelsSettings = { }

export const ticketsSettingsSelectMenuComponents: SelectMenuOptionsWithLocalizations = [
	{
		label: TextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_LABEL,
		description: TextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_DESCRIPTION,
		value: 'change_category'
	}
];

export const reSendingSettingsSelectMenuComponents: SelectMenuOptionsWithLocalizations = [
	{
		label: TextsLocalizationsIds.RE_SENDERS_SETTINGS_ADD_LABEL,
		description: TextsLocalizationsIds.RE_SENDERS_SETTINGS_ADD_DESCRIPTION,
		value: 'add_re_sender'
	},
	{
		label: TextsLocalizationsIds.RE_SENDERS_SETTINGS_DELETE_LABEL,
		description: TextsLocalizationsIds.RE_SENDERS_SETTINGS_DELETE_DESCRIPTION,
		value: 'delete_re_sender'
	}
];
