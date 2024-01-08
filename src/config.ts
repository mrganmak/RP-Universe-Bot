import { ButtonStyle, ComponentType, TextInputStyle } from "discord.js";
import { TextsLocalizationsIds, ButtonsPanelsSettings, SelectMenuOptionsWithLocalizations, MarkerTypes, UserConfirmationInteractionButtonsSettings, DataCollectionPollQuestions, QuestionTypes, DataCollectionPollQuestionContentTypes } from "./index.js";

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

export const markerCreatePollQuestions: DataCollectionPollQuestions = [
	{
		contentType: DataCollectionPollQuestionContentTypes.MESSAGE,
		content: TextsLocalizationsIds.USER_MARKERS_SELECT_MARKER_TYPE_TEXT,
		type: QuestionTypes.SELECT_MENU,
		selectMenuType: ComponentType.StringSelect,
		answers: [
			{
				label: TextsLocalizationsIds.USER_MARKERS_MARKER_TYPE_BLACK_LABLE,
				description: TextsLocalizationsIds.USER_MARKERS_MARKER_TYPE_BLACK_DESCRIPTION,
				value: `${MarkerTypes.BLACK}`
			},
			{
				label: TextsLocalizationsIds.USER_MARKERS_MARKER_TYPE_RED_LABLE,
				description: TextsLocalizationsIds.USER_MARKERS_MARKER_TYPE_RED_DESCRIPTION,
				value: `${MarkerTypes.RED}`
			},
			{
				label: TextsLocalizationsIds.USER_MARKERS_MARKER_TYPE_YELLOW_LABLE,
				description: TextsLocalizationsIds.USER_MARKERS_MARKER_TYPE_YELLOW_DESCRIPTION,
				value: `${MarkerTypes.YELLOW}`
			},
			{
				label: TextsLocalizationsIds.USER_MARKERS_MARKER_TYPE_GREEN_LABLE,
				description: TextsLocalizationsIds.USER_MARKERS_MARKER_TYPE_GREEN_DESCRIPTION,
				value: `${MarkerTypes.GREEN}`
			}
		],
	},
	{
		contentType: DataCollectionPollQuestionContentTypes.MESSAGE,
		content: TextsLocalizationsIds.USER_MARKERS_SET_MARKER_REASON_MODAL_MESSAGE_TEXT,
		type: QuestionTypes.MODAL_MENU,
		title: TextsLocalizationsIds.USER_MARKERS_SET_MARKER_REASON_MODAL_TEXT,
		inputs: [
			{
				custom_id: 'reason',
				label: TextsLocalizationsIds.USER_MARKERS_SET_MARKER_REASON_TEXT,
				placeholder: TextsLocalizationsIds.USER_MARKERS_SET_MARKER_REASON_PLACEHOLDER,
				required: true,
				style: TextInputStyle.Paragraph,
			}
		],
	}
];
