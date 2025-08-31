import { LocalizationLanguages, DataCollectionPollQuestion, CollectedQuestionAnswer } from "@src/index.js";
import { RepliableInteraction, User } from "discord.js";

export abstract class BaseStrategy {

	constructor(
		protected readonly _interaction: RepliableInteraction,
		protected readonly _respondent: User,
		protected readonly _language: LocalizationLanguages
	) {}

	public abstract canHandle(question: DataCollectionPollQuestion<boolean>): boolean;

	public abstract handle(question: DataCollectionPollQuestion<boolean>): Promise<CollectedQuestionAnswer | null>;
}
