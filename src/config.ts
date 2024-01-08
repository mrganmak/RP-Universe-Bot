import { ButtonStyle } from "discord.js";
import { TextsLocalizationsIds, ButtonsPanelsSettings, SelectMenuOptionsWithLocalizations, UserConfirmationInteractionButtonsSettings } from "./index.js";

export const guildsIds = {
	hubGuildId: '1079448420630139023'
}

export const channelsIds = {
	requestsToIntegrateBaseChannelId: '1184891567773843578'
}

export const devMode = true;

export const userConfirmationInteractionButtonsSettings: UserConfirmationInteractionButtonsSettings = {
	'confirm': {
		label: TextsLocalizationsIds.USER_CONFIRMATION_BUTTON_YES,
		style: ButtonStyle.Success,
		customId: 'confirm'
	},
	'deny': {
		label: TextsLocalizationsIds.USER_CONFIRMATION_BUTTON_NO,
		style: ButtonStyle.Danger,
		customId: 'deny'
	}
};

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

