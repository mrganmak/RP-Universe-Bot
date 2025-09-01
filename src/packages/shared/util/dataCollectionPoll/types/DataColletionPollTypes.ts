import { APIButtonComponentWithCustomId, APIChannelSelectComponent, APIMentionableSelectComponent, APIRoleSelectComponent, APISelectMenuOption, APITextInputComponent, APIUserSelectComponent, Channel, ComponentType, EmbedBuilder, GuildMember, RepliableInteraction, Role, User } from "discord.js";
import { EmbedLocalizationIds, LocalizationLanguages, TextLocalizationIds, UserConfirmationButtonLabels, UserConfirmationAnswers } from "@src/index.js";

export interface DataCollectionPollOptions {
	respondent: GuildMember;
	language: LocalizationLanguages;
	questions: DataCollectionPollQuestions;
	interaction: RepliableInteraction;
}

export type DataCollectionPollQuestions = DataCollectionPollCategoriesQuestions | DataCollectionPollArrayQuestions;

export interface DataCollectionPollCategoriesQuestions {
	[categoryName: string]: DataCollectionPollArrayQuestionsGeneric<true>;
}

export type DataCollectionPollArrayQuestions = DataCollectionPollArrayQuestionsGeneric<false>;

export type DataCollectionPollArrayQuestionsGeneric<IsWithCategories extends boolean> = DataCollectionPollQuestion<IsWithCategories>[];

export type DataCollectionPollQuestion<IsWithCategories extends boolean> = 
	DataCollectionPollSelectMenuQuestion<IsWithCategories>
	| DataCollectionPollSelectModalQuestion<IsWithCategories>
	| DataCollectionPollButtonsQuestion<IsWithCategories>;

export interface DataCollectionPollDefaultQuestion<T extends CollectionPollQuestionContentTypes> {
	contentType: T;
	content: (T extends CollectionPollQuestionContentTypes.MESSAGE ? TextLocalizationIds : EmbedLocalizationIds);
}

export type DataCollectionPollSelectMenuQuestion<IsWithCategories extends boolean> = 
	DataCollectionPollStringSelectMenuQuestion<IsWithCategories>
	| DataCollectionPollUserSelectMenuQuestion<IsWithCategories>
	| DataCollectionPollRoleSelectMenuQuestion<IsWithCategories>
	| DataCollectionPollMentionableSelectMenuQuestion<IsWithCategories>
	| DataCollectionPollChannelSelectMenuQuestion<IsWithCategories>;

export interface DataCollectionPollBaseSelectMenuQuestion<IsWithCategories extends boolean>
	extends DataCollectionPollDefaultQuestion<CollectionPollQuestionContentTypes> 
{
	type: CollectionPollQuestionTypes.SELECT_MENU;
	category?: (IsWithCategories extends true ? (string | undefined) : undefined);
	placeholder?: TextLocalizationIds;
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
	label: TextLocalizationIds;
	description: TextLocalizationIds;
	category?: (IsWithCategories extends true ? (string | undefined) : undefined);
}

export interface DataCollectionPollSelectModalQuestion<IsWithCategories extends boolean> 
	extends DataCollectionPollDefaultQuestion<CollectionPollQuestionContentTypes> 
{
	type: CollectionPollQuestionTypes.MODAL_MENU;
	title: TextLocalizationIds;
	category?: (IsWithCategories extends true ? (string | undefined) : undefined);
	inputs: DataCollectionPollModalMenuInput[];
}

export interface DataCollectionPollModalMenuInput extends Omit<APITextInputComponent, 'label' | 'placeholder' | 'value' | 'type'> {
	label: TextLocalizationIds;
	placeholder?: TextLocalizationIds;
	value?: TextLocalizationIds;
}

export type DataCollectionPollButtonsQuestion<IsWithCategories extends boolean> =
	DataCollectionPollDefaultButtonsQuestion<IsWithCategories>
	| DataCollectionPollConfirmationButtonsQuestion<IsWithCategories>;

export interface DataCollectionPollBasetButtonsQuestion
	extends DataCollectionPollDefaultQuestion<CollectionPollQuestionContentTypes> 
{
	type: CollectionPollQuestionTypes.BUTTONS;
}
	
export interface DataCollectionPollDefaultButtonsQuestion<IsWithCategories extends boolean> 
	extends DataCollectionPollBasetButtonsQuestion
{
	type: CollectionPollQuestionTypes.BUTTONS;
	buttonsType: ButtonsQuestionTypes.DEFAULT;
	buttons: DataCollectionPollSelectButton<IsWithCategories>[];
}

export interface DataCollectionPollSelectButton<IsWithCategories extends boolean> 
	extends Omit<APIButtonComponentWithCustomId, 'label' | 'custom_id' | 'type'>
{
	label: TextLocalizationIds;
	category?: (IsWithCategories extends true ? (string | undefined) : undefined);
	value: string;
}

export interface DataCollectionPollConfirmationButtonsQuestion<IsWithCategories extends boolean> 
	extends DataCollectionPollBasetButtonsQuestion
{
	type: CollectionPollQuestionTypes.BUTTONS;
	buttonsType: ButtonsQuestionTypes.CONFIRMATION;
	labels?: UserConfirmationButtonLabels;
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
	| CollectedMentionableSelectMenuAnswer
	| CollectedChannelSelectMenuAnswer;

export interface CollectedBaseSelectMenuAnswer extends CollectedBaseAnswer {
	type: CollectionPollQuestionTypes.SELECT_MENU;
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
	answer: User[];
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

export interface CollectedChannelSelectMenuAnswer extends CollectedBaseSelectMenuAnswer {
	seletMenuType: ComponentType.ChannelSelect;
	answer: Channel[];
}

export interface CollectedModalMenuAnswer extends CollectedBaseAnswer {
	type: CollectionPollQuestionTypes.MODAL_MENU;
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
	type: CollectionPollQuestionTypes.BUTTONS;
	label: string;
}

export interface CollectedDefaultButtonsAnswer extends CollectedBaseButtonsAnswer {
	buttonsType: ButtonsQuestionTypes.DEFAULT
	answer: string;
}

export interface CollectedConfirmationButtonsAnswer extends CollectedBaseButtonsAnswer {
	buttonsType: ButtonsQuestionTypes.CONFIRMATION
	answer: UserConfirmationAnswers;
}

export enum CollectionPollQuestionContentTypes {
	EMBED,
	MESSAGE,
}

export enum ButtonsQuestionTypes {
	DEFAULT,
	CONFIRMATION
}

export enum CollectionPollQuestionTypes {
	SELECT_MENU,
	MODAL_MENU,
	BUTTONS
}
