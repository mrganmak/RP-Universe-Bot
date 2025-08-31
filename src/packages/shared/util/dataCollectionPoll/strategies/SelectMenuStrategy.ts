import { ComponentType, StringSelectMenuInteraction, UserSelectMenuInteraction, RoleSelectMenuInteraction, MentionableSelectMenuInteraction, ChannelSelectMenuInteraction, User, GuildMember, RepliableInteraction, EmbedBuilder, Collection, Message } from "discord.js";
import { 
	DataCollectionPollQuestion, 
	CollectedQuestionAnswer, 
	CollectionPollQuestionTypes,
	DataCollectionPollSelectMenuQuestion,
	DataCollectionPollStringSelectMenuQuestion,
	CollectedSelectMenuAnswer,
	CollectedStringSelectMenuAnswer,
	CollectedUserSelectMenuAnswer,
	CollectedRoleSelectMenuAnswer,
	CollectedMentionableSelectMenuAnswer,
	PaginationSelectMenu,
	PaginationSelectMenuOptions,
	PaginationSelectMenuSettings,
	SelectMenuOptionWithLocalization,
	StringSelectMenuAnswerData,
	DataCollectionPollSelectMenuAnswer,
	DataCollectionPollDefaultQuestion,
	LocalizationLanguages,
	getLocalizationForText,
	getLocalizationForEmbed,
	EmbedLocalizationIds,
	TextLocalizationIds,
	CollectionPollQuestionContentTypes,
	CollectedChannelSelectMenuAnswer
} from "@src/index.js";
import { UIManager, InteractionManager } from "../managers/index.js";
import { BaseStrategy } from "./BaseStrategy.js";

export class SelectMenuStrategy extends BaseStrategy {
	constructor(
		interaction: RepliableInteraction,
		respondent: User,
		language: LocalizationLanguages
	) {
		super(interaction, respondent, language);
	}

	public canHandle(question: DataCollectionPollQuestion<boolean>): boolean {
		return question.type === CollectionPollQuestionTypes.SELECT_MENU;
	}

	public async handle(question: DataCollectionPollQuestion<boolean>): Promise<CollectedQuestionAnswer | null> {
		if (question.type !== CollectionPollQuestionTypes.SELECT_MENU) {
			throw new Error(`Expected SELECT_MENU question type, got ${question.type}`);
		}
		
		const selectMenuQuestion = question;
		const selectMenuType = selectMenuQuestion.selectMenuType;
		
		if (selectMenuType === ComponentType.StringSelect) {
			return await this.handleStringSelectMenu(selectMenuQuestion);
		} else {
			return await this.handleGenericSelectMenuByType(selectMenuQuestion);
		}
	}

	private async handleStringSelectMenu(question: DataCollectionPollStringSelectMenuQuestion<boolean>): Promise<CollectedSelectMenuAnswer | null> {
		const [target, author, options] = this.getPaginationSelectMenuCreateParametersFromQuestion(question);
		const pagination = await PaginationSelectMenu.create(target, author, options);
		
		try {
			const answer = await pagination.getUserAnswer();
			if (!answer) return null;

			await answer.deferUpdate();
			return this.getNormalizedUserStringSelectMenuAnswer(question, answer.values);
		} finally {
			pagination.destroy();
		}
	}

	private async handleGenericSelectMenuByType(question: DataCollectionPollSelectMenuQuestion<boolean>): Promise<CollectedSelectMenuAnswer | null> {
		if (question.selectMenuType === ComponentType.StringSelect) {
			throw new Error(`StringSelect should be handled by handleStringSelectMenu, not by handleGenericSelectMenuByType`);
		}

		if (![
			ComponentType.UserSelect,
			ComponentType.RoleSelect,
			ComponentType.MentionableSelect,
			ComponentType.ChannelSelect
		].includes(question.selectMenuType)) {
			throw new Error(`Unsupported select menu type for generic handling: ${question.selectMenuType}`);
		}

		const uiManager = new UIManager(this._interaction, this._language);
		const message = await uiManager.sendSelectMenu(question);
		const interactionManager = new InteractionManager(message);

		const timeout = 60 * 60 * 1000;
		const onTimeout = async () => {
			await uiManager.showTimeoutError();
		};

		const answerInteraction = await interactionManager.awaitSelectMenu(
			question.selectMenuType,
			{ timeout, onTimeout }
		);

		if (!answerInteraction) {
			return null; // The timeout has already been processed in onTimeout.
		}

		await answerInteraction.deferUpdate();
		return this.getNormalizedSelectMenuAnswer(question, answerInteraction);
	}

	private getPaginationSelectMenuCreateParametersFromQuestion(question: DataCollectionPollStringSelectMenuQuestion<boolean>): [RepliableInteraction, User, PaginationSelectMenuOptions] {
		return [
			this._interaction,
			this._respondent,
			this.convertQuestionAnswerIntoPaginationSelectMenuOptions(question)
		];
	}

	private convertQuestionAnswerIntoPaginationSelectMenuOptions(question: DataCollectionPollStringSelectMenuQuestion<boolean>): PaginationSelectMenuOptions {
		return {
			isLocalizationRequired: true,
			choices: Array.from(this.getPaginationSelectMenuChoicesFromQuestionAnswers(question.answers)),
			language: this._language,
			selectMenuOptions: this.getPaginationSelectMenuOptionsFromQuestion(question)
		};
	}

	private *getPaginationSelectMenuChoicesFromQuestionAnswers(answers: DataCollectionPollSelectMenuAnswer<boolean>[]): Iterable<SelectMenuOptionWithLocalization> {
		for (const [key, answer] of Object.entries(answers)) {
			yield {
				label: answer.label,
				value: key,
				default: answer.default,
				description: answer.description
			};
		}
	}

	private getPaginationSelectMenuOptionsFromQuestion(question: DataCollectionPollStringSelectMenuQuestion<boolean>): PaginationSelectMenuSettings<true> {
		return {
			max_values: question.maxAnswers,
			min_values: question.minAnswers,
			placeholder: question.placeholder,
		};
	}

	private getNormalizedUserStringSelectMenuAnswer(
		question: DataCollectionPollStringSelectMenuQuestion<boolean>,
		values: StringSelectMenuInteraction['values']
	): CollectedStringSelectMenuAnswer {
		return {
			type: CollectionPollQuestionTypes.SELECT_MENU,
			seletMenuType: ComponentType.StringSelect,
			answer: Array.from(this.getUserStringSelectMenuAnswersFromValues(question, values)),
			categories: Array.from(this.getUserStringSelectMenuCategoriesFromValues(question, values)),
			question: this.getQuestionContent(question),
		};
	}

	private getNormalizedSelectMenuAnswer(
		question: DataCollectionPollSelectMenuQuestion<boolean>,
		interaction: StringSelectMenuInteraction | UserSelectMenuInteraction | RoleSelectMenuInteraction | MentionableSelectMenuInteraction | ChannelSelectMenuInteraction
	): CollectedSelectMenuAnswer {
		const baseAnswer = {
			type: CollectionPollQuestionTypes.SELECT_MENU,
			question: this.getQuestionContent(question),
		};

		switch (question.selectMenuType) {
			case ComponentType.UserSelect:
				if (interaction instanceof UserSelectMenuInteraction) {
					return {
						...baseAnswer,
						seletMenuType: ComponentType.UserSelect,
						answer: Array.from(interaction.users.values()),
					} as CollectedUserSelectMenuAnswer;
				}
				break;

			case ComponentType.RoleSelect:
				if (interaction instanceof RoleSelectMenuInteraction) {
					return {
						...baseAnswer,
						seletMenuType: ComponentType.RoleSelect,
						answer: Array.from(interaction.roles.values()),
					} as CollectedRoleSelectMenuAnswer;
				}
				break;

			case ComponentType.MentionableSelect:
				if (interaction instanceof MentionableSelectMenuInteraction) {
					return {
						...baseAnswer,
						seletMenuType: ComponentType.MentionableSelect,
						answer: {
							roles: Array.from(interaction.roles.values()),
							members: Array.from(interaction.members.values())
						},
					} as CollectedMentionableSelectMenuAnswer;
				}
				break;

			case ComponentType.ChannelSelect:
				if (interaction instanceof ChannelSelectMenuInteraction) {
					return {
						...baseAnswer,
						seletMenuType: ComponentType.ChannelSelect,
						answer: Array.from(interaction.channels.values()),
					} as CollectedChannelSelectMenuAnswer;
				}
				break;

			default:
				throw new Error(`Unsupported select menu type for normalization: ${question.selectMenuType}`);
		}

		throw new Error(`Interaction type mismatch for select menu type: ${question.selectMenuType}`);
	}

	private *getUserStringSelectMenuAnswersFromValues(question: DataCollectionPollStringSelectMenuQuestion<boolean>, values: StringSelectMenuInteraction['values']): Iterable<StringSelectMenuAnswerData> {
		for (const value of values) {
			const answerData = question.answers[Number(value)];
			if (answerData) yield {
				value: answerData.value,
				label: getLocalizationForText(answerData.label, this._language)
			};
		}
	}

	private *getUserStringSelectMenuCategoriesFromValues(question: DataCollectionPollStringSelectMenuQuestion<boolean>, values: StringSelectMenuInteraction['values']): Iterable<string> {
		for (const value of values) {
			const category = question.answers[Number(value)]?.category;
			if (category) yield category;
		}
	}

	private getQuestionContent(question: DataCollectionPollDefaultQuestion<CollectionPollQuestionContentTypes>): string | EmbedBuilder {
		return question.contentType === CollectionPollQuestionContentTypes.MESSAGE
			? getLocalizationForText(question.content as TextLocalizationIds, this._language)
			: getLocalizationForEmbed({ embedId: question.content as EmbedLocalizationIds, language: this._language });
	}

}
