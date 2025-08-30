import { APIButtonComponentWithCustomId, APIChannelSelectComponent, APIMentionableSelectComponent, APIRoleSelectComponent, APISelectMenuOption, APITextInputComponent, APIUserSelectComponent, ComponentType, EmbedBuilder, GuildMember, RepliableInteraction, Role } from "discord.js";
import { ButtonsQuestionTypes, DataCollectionPollQuestionContentTypes, EmbedsLocalizationsIds, LocalizationsLanguages, QuestionTypes, TextsLocalizationsIds, UserConfirmationButtonsLabels, UserConfirmationsAnswers } from "../../../index.js";

export interface DataCollectionPollOptions {
	respondent: GuildMember;
	language: LocalizationsLanguages;
	questions: DataCollectionPollQuestions;
	interaction: RepliableInteraction;
}

export type DataCollectionPollQuestions = DataCollectionPollCategoriesQuestions | DataCollectionPollArrayQuestions<false>;

export interface DataCollectionPollCategoriesQuestions {
	[categoryName: string]: DataCollectionPollArrayQuestions<true>;
}

export type DataCollectionPollArrayQuestions<T extends boolean> = DataCollectionPollQuestion<T>[];

export type DataCollectionPollQuestion<IsWithCategories extends boolean> = 
	DataCollectionPollSelectMenuQuestion<IsWithCategories>
	| DataCollectionPollSelectModalQuestion<IsWithCategories>
	| DataCollectionPollButtonsQuestion<IsWithCategories>;

export interface DataCollectionPollDefaultQuestion<T extends DataCollectionPollQuestionContentTypes> {
	contentType: T;
	content: (T extends DataCollectionPollQuestionContentTypes.MESSAGE ? TextsLocalizationsIds : EmbedsLocalizationsIds);
}

export type DataCollectionPollSelectMenuQuestion<IsWithCategories extends boolean> = 
	DataCollectionPollStringSelectMenuQuestion<IsWithCategories>
	| DataCollectionPollUserSelectMenuQuestion<IsWithCategories>
	| DataCollectionPollRoleSelectMenuQuestion<IsWithCategories>
	| DataCollectionPollMentionableSelectMenuQuestion<IsWithCategories>
	| DataCollectionPollChannelSelectMenuQuestion<IsWithCategories>;

export interface DataCollectionPollBaseSelectMenuQuestion<IsWithCategories extends boolean>
	extends DataCollectionPollDefaultQuestion<DataCollectionPollQuestionContentTypes> 
{
	type: QuestionTypes.SELECT_MENU;
	category?: (IsWithCategories extends true ? (string | undefined) : undefined);
	placeholder?: TextsLocalizationsIds;
}

export interface DataCollectionPollUserSelectMenuQuestion<IsWithCategories extends boolean> 
	extends DataCollectionPollBaseSelectMenuQuestion<IsWithCategories>, Omit<APIUserSelectComponent, 'type' | 'custom_id' | 'placeholder'>
{
	selectMenuType: ComponentType.UserSelect;
}

export interface DataCollectionPollRoleSelectMenuQuestion<IsWithCategories extends boolean> 
	extends DataCollectionPollBaseSelectMenuQuestion<IsWithCategories>, Omit<APIRoleSelectComponent, 'type' | 'custom_id' | 'placeholder'>
{
	selectMenuType: ComponentType.RoleSelect;
}

export interface DataCollectionPollMentionableSelectMenuQuestion<IsWithCategories extends boolean> 
	extends DataCollectionPollBaseSelectMenuQuestion<IsWithCategories>, Omit<APIMentionableSelectComponent, 'type' | 'custom_id' | 'placeholder'>
{
	selectMenuType: ComponentType.MentionableSelect;
}

export interface DataCollectionPollChannelSelectMenuQuestion<IsWithCategories extends boolean> 
	extends DataCollectionPollBaseSelectMenuQuestion<IsWithCategories>, Omit<APIChannelSelectComponent, 'type' | 'custom_id' | 'placeholder'>
{
	selectMenuType: ComponentType.ChannelSelect;
}

export interface DataCollectionPollStringSelectMenuQuestion<IsWithCategories extends boolean> 
	extends Omit<DataCollectionPollBaseSelectMenuQuestion<IsWithCategories>, 'category'>
{
	selectMenuType: ComponentType.StringSelect;
	isSeveralMeanings?: boolean;
	maxAnswers?: number;
	minAnswers?: number;
	answers: DataCollectionPollSelectMenuAnswer<IsWithCategories>[];
}

export interface DataCollectionPollSelectMenuAnswer<IsWithCategories extends boolean>
	extends Omit<APISelectMenuOption, 'label' | 'description'> 
{
	label: TextsLocalizationsIds;
	description: TextsLocalizationsIds;
	category?: (IsWithCategories extends true ? (string | undefined) : undefined);
}

export interface DataCollectionPollSelectModalQuestion<IsWithCategories extends boolean> 
	extends DataCollectionPollDefaultQuestion<DataCollectionPollQuestionContentTypes> 
{
	type: QuestionTypes.MODAL_MENU;
	title: TextsLocalizationsIds;
	category?: (IsWithCategories extends true ? (string | undefined) : undefined);
	inputs: DataCollectionPollModalMenuInput[];
}

export interface DataCollectionPollModalMenuInput extends Omit<APITextInputComponent, 'label' | 'placeholder' | 'value' | 'type'> {
	label: TextsLocalizationsIds;
	placeholder?: TextsLocalizationsIds;
	value?: TextsLocalizationsIds;
}

export type DataCollectionPollButtonsQuestion<IsWithCategories extends boolean> =
	DataCollectionPollDefaultButtonsQuestion<IsWithCategories>
	| DataCollectionPollConfirmationButtonsQuestion<IsWithCategories>;

export interface DataCollectionPollBasetButtonsQuestion
	extends DataCollectionPollDefaultQuestion<DataCollectionPollQuestionContentTypes> 
{
	type: QuestionTypes.BUTTONS;
}
	
export interface DataCollectionPollDefaultButtonsQuestion<IsWithCategories extends boolean> 
	extends DataCollectionPollBasetButtonsQuestion
{
	type: QuestionTypes.BUTTONS;
	buttonsType: ButtonsQuestionTypes.DEFAULT;
	buttons: DataCollectionPollSelectButton<IsWithCategories>[];
}

export interface DataCollectionPollSelectButton<IsWithCategories extends boolean> 
	extends Omit<APIButtonComponentWithCustomId, 'label' | 'custom_id' | 'type'>
{
	label: TextsLocalizationsIds;
	category?: (IsWithCategories extends true ? (string | undefined) : undefined);
	value: string;
}

export interface DataCollectionPollConfirmationButtonsQuestion<IsWithCategories extends boolean> 
	extends DataCollectionPollBasetButtonsQuestion
{
	type: QuestionTypes.BUTTONS;
	buttonsType: ButtonsQuestionTypes.CONFIRMATION;
	labels?: UserConfirmationButtonsLabels;
	category?: (IsWithCategories extends true ? (string | undefined) : undefined);
}

export type PollCollectedData = CollectedQuestionAnswer[];

export type CollectedQuestionAnswer =
	CollectedSelectMenuAnswer
	| CollectedModalMenuAnswer
	| CollectedButtonsAnswer;

export interface CollectedBaseAnswer {
	question: string | EmbedBuilder;
	categories?: string[];
}

export type CollectedSelectMenuAnswer = 
	CollectedStringSelectMenuAnswer
	| CollectedUserSelectMenuAnswer
	| CollectedRoleSelectMenuAnswer
	| CollectedMentionableSelectMenuAnswer;

export interface CollectedBaseSelectMenuAnswer extends CollectedBaseAnswer {
	type: QuestionTypes.SELECT_MENU;
}

export interface CollectedStringSelectMenuAnswer extends CollectedBaseSelectMenuAnswer {
	seletMenuType: ComponentType.StringSelect;
	answer: StringSelectMenuAnswerData[];
}

export interface StringSelectMenuAnswerData {
	value: string;
	label: string;
}

export interface CollectedUserSelectMenuAnswer extends CollectedBaseSelectMenuAnswer {
	seletMenuType: ComponentType.UserSelect;
	answer: GuildMember[];
}

export interface CollectedRoleSelectMenuAnswer extends CollectedBaseSelectMenuAnswer {
	seletMenuType: ComponentType.RoleSelect;
	answer: Role[];
}

export interface CollectedMentionableSelectMenuAnswer extends CollectedBaseSelectMenuAnswer {
	seletMenuType: ComponentType.MentionableSelect;
	answer: MentionableSelectMenuAnswerData;
}

export interface MentionableSelectMenuAnswerData {
	roles: Role[];
	members: GuildMember[];
}

export interface CollectedModalMenuAnswer extends CollectedBaseAnswer {
	type: QuestionTypes.MODAL_MENU;
	answer: ModalMenuAnswersData;
}

export interface ModalMenuAnswersData {
	[customId: string]: ModalMenuAnswerData
}

export interface ModalMenuAnswerData {
	value: string;
	label: string;
}

export type CollectedButtonsAnswer =
	CollectedDefaultButtonsAnswer
	| CollectedConfirmationButtonsAnswer;

export interface CollectedBaseButtonsAnswer extends CollectedBaseAnswer {
	type: QuestionTypes.BUTTONS;
	label: string;
}

export interface CollectedDefaultButtonsAnswer extends CollectedBaseButtonsAnswer {
	buttonsType: ButtonsQuestionTypes.DEFAULT
	answer: string;
}

export interface CollectedConfirmationButtonsAnswer extends CollectedBaseButtonsAnswer {
	buttonsType: ButtonsQuestionTypes.CONFIRMATION
	answer: UserConfirmationsAnswers;
}
