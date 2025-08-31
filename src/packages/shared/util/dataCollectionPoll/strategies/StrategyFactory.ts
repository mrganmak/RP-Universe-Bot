import { RepliableInteraction, User } from "discord.js";
import { LocalizationLanguages, CollectionPollQuestionTypes } from "@src/index.js";
import { BaseStrategy } from "./BaseStrategy.js";
import { SelectMenuStrategy } from "./SelectMenuStrategy.js";
import { ButtonsStrategy } from "./ButtonsStrategy.js";
import { ModalStrategy } from "./ModalStrategy.js";

export class StrategyFactory {
	public static createStrategy(
		questionType: CollectionPollQuestionTypes,
		interaction: RepliableInteraction,
		respondent: User,
		language: LocalizationLanguages
	): BaseStrategy {
		switch (questionType) {
			case CollectionPollQuestionTypes.SELECT_MENU:
				return new SelectMenuStrategy(interaction, respondent, language);
			case CollectionPollQuestionTypes.BUTTONS:
				return new ButtonsStrategy(interaction, respondent, language);
			case CollectionPollQuestionTypes.MODAL_MENU:
				return new ModalStrategy(interaction, respondent, language);
			default:
				throw new Error(`Unsupported question type: ${questionType}`);
		}
	}

	public static createAllStrategies(
		interaction: RepliableInteraction,
		respondent: User,
		language: LocalizationLanguages
	): Map<CollectionPollQuestionTypes, BaseStrategy> {
		return new Map<CollectionPollQuestionTypes, BaseStrategy>([
			[CollectionPollQuestionTypes.SELECT_MENU, new SelectMenuStrategy(interaction, respondent, language)],
			[CollectionPollQuestionTypes.BUTTONS, new ButtonsStrategy(interaction, respondent, language)],
			[CollectionPollQuestionTypes.MODAL_MENU, new ModalStrategy(interaction, respondent, language)]
		]);
	}
}
