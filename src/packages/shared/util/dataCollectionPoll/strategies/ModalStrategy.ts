import { ComponentType, ModalSubmitInteraction, CacheType, ModalBuilder, TextInputBuilder, ActionRowBuilder, ButtonBuilder, RepliableInteraction, EmbedBuilder, ButtonStyle, User } from "discord.js";
import { 
	DataCollectionPollQuestion, 
	CollectedQuestionAnswer, 
	CollectionPollQuestionTypes,
	DataCollectionPollSelectModalQuestion,
	DataCollectionPollModalMenuInput,
	CollectedModalMenuAnswer,
	ModalMenuAnswersData,
	DataCollectionPollDefaultQuestion,
	LocalizationLanguages,
	getLocalizationForText,
	TextLocalizationIds,
	getLocalizationForEmbed,
	EmbedLocalizationIds,
	CollectionPollQuestionContentTypes
} from "@src/index.js";
import { UIManager, InteractionManager } from "../managers/index.js";
import { BaseStrategy } from "./BaseStrategy.js";

export class ModalStrategy extends BaseStrategy {
	constructor(
		interaction: RepliableInteraction,
		respondent: User,
		language: LocalizationLanguages
	) {
		super(interaction, respondent, language);
	}

	public canHandle(question: DataCollectionPollQuestion<boolean>): boolean {
		return question.type === CollectionPollQuestionTypes.MODAL_MENU;
	}

	public async handle(question: DataCollectionPollQuestion<boolean>): Promise<CollectedQuestionAnswer | null> {
		if (question.type !== CollectionPollQuestionTypes.MODAL_MENU) {
			throw new Error(`Expected MODAL_MENU question type, got ${question.type}`);
		}

		const modalQuestion = question;
				
		const uiManager = new UIManager(this._interaction, this._language);
		
		const message = await uiManager.sendModalTriggerButtons(modalQuestion);
		const interactionManager = new InteractionManager(message);
		
		const buttonInteraction = await interactionManager.awaitButton({
			timeout: 60 * 60 * 1000, // 1 час
			onTimeout: async () => {
				await uiManager.showTimeoutError();
			}
		});
		
		if (!buttonInteraction) {
			return null; // The timeout has already been processed in onTimeout.
		}

		await buttonInteraction.showModal(uiManager.createModal(modalQuestion));
		
		const modalSubmit = await InteractionManager.awaitModalSubmitFromButton(buttonInteraction, {
			timeout: 2 * 60 * 60 * 1000,
			onTimeout: async () => {
				await uiManager.showTimeoutError();
			}
		});
		
		if (!modalSubmit) {
			return null; // The timeout has already been processed in onTimeout.
		}
		
		if (!modalSubmit.isFromMessage()) {
			throw new Error('Something went wrong with modal in _getAnswerForModalMenu');
		}
		
		await modalSubmit.update({ components: [] });
		return this.getNormalizedUserModalMenuAnswer(modalQuestion, modalSubmit);
	}

	private getNormalizedUserModalMenuAnswer(
		question: DataCollectionPollSelectModalQuestion<boolean>,
		submit: ModalSubmitInteraction<CacheType>
	): CollectedModalMenuAnswer {
		return {
			question: this.getQuestionContent(question),
			type: question.type,
			answer: this.getModalMenuAnswersFromSubmit(question, submit)
		};
	}

	private getModalMenuAnswersFromSubmit(
		question: DataCollectionPollSelectModalQuestion<boolean>,
		submit: ModalSubmitInteraction<CacheType>
	): ModalMenuAnswersData {
		const answers: ModalMenuAnswersData = {};

		for (const input of question.inputs) {
			const submitField = submit.fields.getField(input.custom_id);
			if (submitField.type !== ComponentType.TextInput || submitField.value.length <= 0) continue;

			answers[input.custom_id] = {
				label: getLocalizationForText(input.label, this._language),
				value: submitField.value
			};
		}

		return answers;
	}

	private getQuestionContent(question: DataCollectionPollDefaultQuestion<CollectionPollQuestionContentTypes>): string | EmbedBuilder {
		return question.contentType === CollectionPollQuestionContentTypes.MESSAGE
			? getLocalizationForText(question.content as TextLocalizationIds, this._language)
			: getLocalizationForEmbed({ embedId: question.content as EmbedLocalizationIds, language: this._language });
	}
}
