import { ComponentType, ButtonInteraction, ActionRowBuilder, ButtonBuilder, RepliableInteraction, EmbedBuilder, User } from "discord.js";
import { 
	DataCollectionPollQuestion, 
	CollectedQuestionAnswer, 
	CollectionPollQuestionTypes,
	DataCollectionPollButtonsQuestion,
	DataCollectionPollDefaultButtonsQuestion,
	DataCollectionPollConfirmationButtonsQuestion,
	DataCollectionPollSelectButton,
	CollectedButtonsAnswer,
	CollectedDefaultButtonsAnswer,
	CollectedConfirmationButtonsAnswer,
	ButtonsQuestionTypes,
	DataCollectionPollDefaultQuestion,
	LocalizationLanguages,
	getLocalizationForText,
	getUserConfirmation,
	userConfirmationInteractionButtonSettings,
	UserConfirmationAnswers,
	getLocalizationForEmbed,
	EmbedLocalizationIds,
	TextLocalizationIds,
	CollectionPollQuestionContentTypes
} from "@src/index.js";
import { UIManager, InteractionManager } from "../managers/index.js";
import { BaseStrategy } from "./BaseStrategy.js";

export class ButtonsStrategy extends BaseStrategy {
	constructor(
		interaction: RepliableInteraction,
		respondent: User,
		language: LocalizationLanguages
	) {
		super(interaction, respondent, language);
	}

	public canHandle(question: DataCollectionPollQuestion<boolean>): boolean {
		return question.type === CollectionPollQuestionTypes.BUTTONS;
	}

	public async handle(question: DataCollectionPollQuestion<boolean>): Promise<CollectedQuestionAnswer | null> {
		if (question.type !== CollectionPollQuestionTypes.BUTTONS) {
			throw new Error(`Expected BUTTONS question type, got ${question.type}`);
		}

		const buttonsQuestion = question;
		
		switch (buttonsQuestion.buttonsType) {
			case ButtonsQuestionTypes.DEFAULT:
				return await this.handleDefaultButtons(buttonsQuestion);
			case ButtonsQuestionTypes.CONFIRMATION:
				return await this.handleConfirmationButtons(buttonsQuestion);
			default:
				throw new Error(`Unsupported buttons type: ${(buttonsQuestion as any).buttonsType}`);
			//As any is necessary in this case, since we have already gone through all possible types,
			// buttonsQuestion.buttonsType automatically becomes never, which ultimately leads to an error on the part of TS.
			// But the check itself is designed to catch errors. TODO: Переделать на функцию с never
		}
	}

	private async handleDefaultButtons(question: DataCollectionPollDefaultButtonsQuestion<boolean>): Promise<CollectedDefaultButtonsAnswer | null> {
		if (question.buttonsType !== ButtonsQuestionTypes.DEFAULT) {
			throw new Error(`Expected DEFAULT buttons type, got ${question.buttonsType}`);
		}

		const uiManager = new UIManager(this._interaction, this._language);
		
		const message = await uiManager.sendAnswerButtons(question, question.buttons);
		const interactionManager = new InteractionManager(message);
		
		const answerInteraction = await interactionManager.awaitButton({
			timeout: 60 * 60 * 1000, // 1 час
			onTimeout: async () => {
				await uiManager.showTimeoutError();
			}
		});
		
		if (!answerInteraction) {
			return null; // The timeout has already been processed in onTimeout.
		}

		return this.getNormalizedAnswerForDefaultButtons(question, Number(answerInteraction.customId));
	}

	private getNormalizedAnswerForDefaultButtons(question: DataCollectionPollDefaultButtonsQuestion<boolean>, buttonKey: number): CollectedDefaultButtonsAnswer | null {
		const button = question.buttons[buttonKey];
		if (!button) return null;

		const normalizedAnswer: CollectedDefaultButtonsAnswer = {
			type: question.type,
			buttonsType: question.buttonsType,
			answer: button.value,
			question: this.getQuestionContent(question),
			label: getLocalizationForText(button.label, this._language)
		};

		if (button.category) normalizedAnswer.categories = [button.category];

		return normalizedAnswer;
	}

	private async handleConfirmationButtons(question: DataCollectionPollConfirmationButtonsQuestion<boolean>): Promise<CollectedConfirmationButtonsAnswer | null> {
		const confirmationAnswer = await getUserConfirmation(
			this._interaction, 
			{ language: this._language, labels: question.labels }, 
			false
		);

		return this.getNormalizedUserConfirmationButtonsAnswer(question, confirmationAnswer);
	}

	private getNormalizedUserConfirmationButtonsAnswer(
		question: DataCollectionPollConfirmationButtonsQuestion<boolean>,
		answer: UserConfirmationAnswers,
	): CollectedConfirmationButtonsAnswer {
		const normalizedAnswer: CollectedConfirmationButtonsAnswer = {
			question: this.getQuestionContent(question),
			answer: answer,
			type: question.type,
			buttonsType: question.buttonsType,
					label: getLocalizationForText((
			question.labels
				? question.labels[answer]
				: userConfirmationInteractionButtonSettings[answer].label
		), this._language)
		};

		if (question.category) normalizedAnswer.categories = [question.category];

		return normalizedAnswer;
	}

	private getQuestionContent(question: DataCollectionPollDefaultQuestion<CollectionPollQuestionContentTypes>): string | EmbedBuilder {
		return question.contentType === CollectionPollQuestionContentTypes.MESSAGE
			? getLocalizationForText(question.content as TextLocalizationIds, this._language)
			: getLocalizationForEmbed({ embedId: question.content as EmbedLocalizationIds, language: this._language });
		//As is necessary in this case, since the check question.contentType === CollectionPollQuestionContentTypes.MESSAGE has already been performed above, which excludes other types.

	}
}
