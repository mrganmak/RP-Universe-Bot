import {
	DataCollectionPollOptions,
	DataCollectionPollQuestions,
	DataCollectionPollArrayQuestions,
	PollCollectedData,
	CollectedQuestionAnswer,
	DataCollectionPollQuestion,
	CollectionPollQuestionTypes,
} from "@src/index.js";

import { StrategyFactory, BaseStrategy } from "./strategies/index.js";

export class DataCollectionPoll {
	private readonly _questions: DataCollectionPollQuestions;
	private readonly _strategies: Map<CollectionPollQuestionTypes, BaseStrategy>;

	constructor({
		respondent,
		interaction,
		language,
		questions,
	}: DataCollectionPollOptions) {
		this._questions = questions;
		
		this._strategies = StrategyFactory.createAllStrategies(interaction, respondent.user, language);
	}

	public async collectPollData(): Promise<PollCollectedData | null> {
		try {
			if (Array.isArray(this._questions)) {
				return await this.getAnswersForQuestions(this._questions);
			} else {
				return await this.getAnswersForCategory();
			}
		} catch (error) {
			this.handleError(error as Error);
			return null;
		}
	}

	private async getAnswersForCategory(category: string = 'begin'): Promise<PollCollectedData | null> {
		if (Array.isArray(this._questions)) {
			throw new Error('Invalid question structure for category-based questions');
		}

		const questions = this._questions[category];
		return this.getAnswersForQuestions(questions);
	}

	private async getAnswersForQuestions(questions: DataCollectionPollArrayQuestions<boolean>): Promise<PollCollectedData | null> {
		const collectedData: PollCollectedData = [];

		for (const question of questions) {
			try {
				const collectedAnswer = await this.getAnswerForQuestion(question);
				if (!collectedAnswer) return null;

				collectedData.push(collectedAnswer);

				if (collectedAnswer.categories) {
					for (const category of collectedAnswer.categories) {
						const categoryCollectedData = await this.getAnswersForCategory(category);
						if (!categoryCollectedData) return null;
			
						collectedData.push(...categoryCollectedData);
					}
				}
			} catch (error) {
				this.handleQuestionError(error as Error, question);
				return null;
			}
		}

		return collectedData;
	}

	private async getAnswerForQuestion(question: DataCollectionPollQuestion<boolean>): Promise<CollectedQuestionAnswer | null> {
		const strategy = this._strategies.get(question.type);
		if (!strategy) {
			throw new Error(`No strategy found for question type: ${question.type}`);
		}
		return await strategy.handle(question);
	}

	private handleError(error: Error): void {
		console.error('DataCollectionPoll error:', error);
	}

	private handleQuestionError(error: Error, question: DataCollectionPollQuestion<boolean>): void {
		console.error(`Error processing question of type ${question.type}:`, error);
	}
}
