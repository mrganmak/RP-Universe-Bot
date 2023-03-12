import { ButtonStyle } from "discord.js";
import { IUserConfirmationInteractionButtonSettings } from "./modules/interactions/UserConfirmation.js";
import ETextsLocalizationsIds from "./localizations/texts/types/ETextsLocalizationsIds.js";
import { TButtonsPanelsSettings } from "./modules/interactions/ButtonsPanel.js";
import { TSelectMenuOptionsWithLocalizations } from "./types/types.js";

export const devMode = true;

export const userConfirmationInteractionButtonsSettings: Array<IUserConfirmationInteractionButtonSettings> = [
	{
		label: ETextsLocalizationsIds.USER_CONFIRMATION_BUTTON_NO,
		style: ButtonStyle.Danger,
		customId: 'deny'
	},
	{
		label: ETextsLocalizationsIds.USER_CONFIRMATION_BUTTON_YES,
		style: ButtonStyle.Success,
		customId: 'confirm'
	}
];

export const buttonsPanelsSettings: TButtonsPanelsSettings = { }

export const ticketsSettingsSelectMenuComponents: TSelectMenuOptionsWithLocalizations = [
	{
		label: ETextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_LABEL,
		description: ETextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_DESCRIPTION,
		value: 'change_category'
	}
];
