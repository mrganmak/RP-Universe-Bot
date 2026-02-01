import { RepliableInteraction, ComponentType, ChannelType, GuildMember, ButtonStyle } from "discord.js";
import { 
	DataCollectionPoll, 
	GuildModuleIds, 
	PollCollectedData, 
	Result, 
	Module,
	DataCollectionPollArrayQuestions,
	CollectionPollQuestionTypes,
	CollectionPollQuestionContentTypes,
	EmbedLocalizationIds,
	TextLocalizationIds,
	getGuildLanguage,
	ButtonsQuestionTypes,
	DataCollectionPollCategoriesQuestions
} from "@src/index.js";
import { GuildTicketsBase, TicketsBase } from "./TicketsBase.js";
import { inject, injectable, singleton } from "tsyringe";

const SETUP_QUESTIONS: DataCollectionPollArrayQuestions = [
	{
		type: CollectionPollQuestionTypes.BUTTONS,
		contentType: CollectionPollQuestionContentTypes.EMBED,
		content: EmbedLocalizationIds.TicketsModuleSetup,
		buttonsType: ButtonsQuestionTypes.DEFAULT,
		buttons: [
			{
				label: TextLocalizationIds.TicketsModuleSetupButton,
				style: ButtonStyle.Success,
				value: 'setup'
			}
		]
	},
	{
		type: CollectionPollQuestionTypes.SELECT_MENU,
		contentType: CollectionPollQuestionContentTypes.EMBED,
		content: EmbedLocalizationIds.TicketsModuleCategoryQuestion,
		selectMenuType: ComponentType.ChannelSelect,
		placeholder: TextLocalizationIds.TicketsModuleCategorySelectPlaceholder,
		channel_types: [ChannelType.GuildCategory],
		max_values: 1,
		min_values: 1
	},
	{
		type: CollectionPollQuestionTypes.SELECT_MENU,
		contentType: CollectionPollQuestionContentTypes.EMBED,
		content: EmbedLocalizationIds.TicketsModuleRolesQuestion,
		selectMenuType: ComponentType.RoleSelect,
		placeholder: TextLocalizationIds.TicketsModuleRolesSelectPlaceholder,
		max_values: 10,
		min_values: 1
	}
];

const CHANGE_QUESTIONS: DataCollectionPollCategoriesQuestions = {
	'begin': [
		{
			type: CollectionPollQuestionTypes.SELECT_MENU,
			contentType: CollectionPollQuestionContentTypes.MESSAGE,
			content: TextLocalizationIds.TicketsModuleChangeSelectionQuestion,
			selectMenuType: ComponentType.StringSelect,
			placeholder: TextLocalizationIds.TicketsModuleChangeSelectionQuestion,
			isSeveralMeanings: false,
			answers: [
				{
					label: TextLocalizationIds.TicketsModuleChangeCategoryLabel,
					description: TextLocalizationIds.TicketsModuleChangeCategoryDescription,
					value: 'category',
					category: 'category'
				},
				{
					label: TextLocalizationIds.TicketsModuleChangeRolesLabel,
					description: TextLocalizationIds.TicketsModuleChangeRolesDescription,
					value: 'roles',
					category: 'roles'
				}
			]
		}
	],
	'category': [
		{
			type: CollectionPollQuestionTypes.SELECT_MENU,
			contentType: CollectionPollQuestionContentTypes.EMBED,
			content: EmbedLocalizationIds.TicketsModuleCategoryQuestion,
			selectMenuType: ComponentType.ChannelSelect,
			placeholder: TextLocalizationIds.TicketsModuleCategorySelectPlaceholder,
			channel_types: [ChannelType.GuildCategory],
			max_values: 1,
			min_values: 1,
		},
	],
	'roles':[
		{
			type: CollectionPollQuestionTypes.SELECT_MENU,
			contentType: CollectionPollQuestionContentTypes.EMBED,
			content: EmbedLocalizationIds.TicketsModuleRolesQuestion,
			selectMenuType: ComponentType.RoleSelect,
			placeholder: TextLocalizationIds.TicketsModuleRolesSelectPlaceholder,
			max_values: 10,
			min_values: 1,
		}
	],
}

@injectable()
@singleton()
export class TicketsModule extends Module {
	constructor(
		@inject(TicketsBase) private _ticketsBase: TicketsBase
	) {
		super(GuildModuleIds.Tickets);
	}

	protected _getSetupPoll(interaction: RepliableInteraction<'raw' | 'cached'>): DataCollectionPoll {
		if (!interaction.guild) throw new Error('Guild is required');

		const language = getGuildLanguage(interaction.guild);
		const member = this._getMember(interaction);
		
		return new DataCollectionPoll({
			respondent: member,
			language,
			questions: SETUP_QUESTIONS,
			interaction
		});
	}

	protected _getChangePoll(interaction: RepliableInteraction<'raw' | 'cached'>): DataCollectionPoll {
		if (!interaction.guild) throw new Error('Guild is required');

		const language = getGuildLanguage(interaction.guild);
		const member = this._getMember(interaction);
		
		return new DataCollectionPoll({
			respondent: member,
			language,
			questions: CHANGE_QUESTIONS,
			interaction
		});
	}

	protected async _initilize(setupData: PollCollectedData, interaction: RepliableInteraction<'raw' | 'cached'>): Promise<Result<boolean>> {
		const ticketSettings = this._getTicketSettings(setupData.slice(-2), interaction);
		const ticketSettingsValue = await this._ticketsBase.create(ticketSettings);

		if (!ticketSettingsValue) throw new Error('Failed to create ticket settings');

		return { ok: true, value: true };
	}

	private _getTicketSettings(setupData: PollCollectedData, interaction: RepliableInteraction<'raw' | 'cached'>): GuildTicketsBase {
		const normalizedTicketSettings = this._getNormalizedTicketSettings(setupData);

		const ticketSettings: GuildTicketsBase = {
			guildId: interaction.guildId,
			counter: 0,
			options: {
				categories: [],
				ticketsCategoryId: normalizedTicketSettings.ticketsCategoryId,
				adminsRolesIds: normalizedTicketSettings.adminsRolesIds
			},
			tickets: []
		}

		return ticketSettings;
	}

	private _getNormalizedTicketSettings(setupData: PollCollectedData): Omit<GuildTicketsBase['options'], 'categories'> {
		const categoryAnswer = setupData[0];
		const rolesAnswer = setupData[1];

		if (categoryAnswer.type !== CollectionPollQuestionTypes.SELECT_MENU || rolesAnswer.type !== CollectionPollQuestionTypes.SELECT_MENU) throw new Error('Invalid setup data');
		if (categoryAnswer.seletMenuType !== ComponentType.ChannelSelect || rolesAnswer.seletMenuType !== ComponentType.RoleSelect) throw new Error('Invalid setup data');

		return {
			ticketsCategoryId: categoryAnswer.answer[0].id,
			adminsRolesIds: rolesAnswer.answer.map(role => role.id)
		}
	}

	private _getMember(interaction: RepliableInteraction<'raw' | 'cached'>): GuildMember {
		if (!interaction.member) {
			throw new Error('Interaction member is required');
		}
		
		if ('user' in interaction.member) {
			return interaction.member as GuildMember;
		}
		
		throw new Error('GuildMember is required, not APIInteractionGuildMember');
	}

	//TODO: Сделать систему проверки на права бота в Категории Тикетов и в каждом канале при взаимодействии. Сделать через Guard и Functions в нём
}
