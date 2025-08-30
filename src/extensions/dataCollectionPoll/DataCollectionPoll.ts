import { APIGuildMember, APIRole, ActionRowBuilder, ButtonBuilder, ButtonStyle, CacheType, ComponentType, EmbedBuilder, GuildMember, InteractionEditReplyOptions, MentionableSelectMenuBuilder, Message, ModalBuilder, ModalSubmitInteraction, RepliableInteraction, Role, RoleSelectMenuBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, TextInputBuilder, User, UserSelectMenuBuilder } from "discord.js";
import { ButtonsQuestionTypes, CollectedButtonsAnswer, CollectedConfirmationButtonsAnswer, CollectedDefaultButtonsAnswer, CollectedMentionableSelectMenuAnswer, CollectedModalMenuAnswer, CollectedQuestionAnswer, CollectedRoleSelectMenuAnswer, CollectedSelectMenuAnswer, CollectedStringSelectMenuAnswer, CollectedUserSelectMenuAnswer, DataCollectionPollArrayQuestions, DataCollectionPollButtonsQuestion, DataCollectionPollConfirmationButtonsQuestion, DataCollectionPollDefaultButtonsQuestion, DataCollectionPollDefaultQuestion, DataCollectionPollMentionableSelectMenuQuestion, DataCollectionPollModalMenuInput, DataCollectionPollOptions, DataCollectionPollQuestion, DataCollectionPollQuestionContentTypes, DataCollectionPollQuestions, DataCollectionPollRoleSelectMenuQuestion, DataCollectionPollSelectButton, DataCollectionPollSelectMenuAnswer, DataCollectionPollSelectMenuQuestion, DataCollectionPollSelectModalQuestion, DataCollectionPollStringSelectMenuQuestion, DataCollectionPollUserSelectMenuQuestion, EmbedsLocalizationsIds, LocalizationsLanguages, ModalMenuAnswersData, PaginationSelectMenu, PaginationSelectMenuOptions, PaginationSelectMenuSettings, PollCollectedData, QuestionTypes, SelectMenuOptionWithLocalizations, StringSelectMenuAnswerData, TextsLocalizationsIds, UserConfirmationsAnswers, getLocalizationForEmbed, getLocalizationForText, getUserConfirmation, userConfirmationInteractionButtonsSettings } from "../../index.js";

export class DataCollectionPoll {
	private _respondent: GuildMember;
	private _language: LocalizationsLanguages;
	private _questions: DataCollectionPollQuestions;
	private _interaction: RepliableInteraction;

	constructor({
		respondent,
		interaction,
		language,
		questions,
	}: DataCollectionPollOptions) {
		this._respondent = respondent;
		this._language = language;
		this._questions = questions;
		this._interaction = interaction;
	}

	public async collectPollData(): Promise<PollCollectedData | null> {
		if (Array.isArray(this._questions)) return await this._getAnswersForQuestions(this._questions);
		else return await this._getAnswersForCategory();
	}

	private async _getAnswersForCategory(category: string = 'begin'): Promise<PollCollectedData | null> {
		if (Array.isArray(this._questions)) throw new Error('something went wrong in _getAnswersForCategory')

		const questions = this._questions[category];
		return this._getAnswersForQuestions(questions);
	}

	private async _getAnswersForQuestions(questions: DataCollectionPollArrayQuestions<boolean>): Promise<PollCollectedData | null> {
		const collectedData: PollCollectedData = [];

		for (const question of questions) {
			await this._sendQuestionContent(question);

			const collectedAnswer = await this._getAnswerForQuestion(question);
			if (!collectedAnswer) return null;

			collectedData.push(collectedAnswer);

			if (collectedAnswer.categories) {
				for (const category of collectedAnswer.categories) {
					const categoryCollectedData = await this._getAnswersForCategory(category)
					if (!categoryCollectedData) return null;
		
					collectedData.concat(categoryCollectedData);
				}
			}
		}

		return collectedData;
	}

	private async _sendQuestionContent(question: DataCollectionPollDefaultQuestion<DataCollectionPollQuestionContentTypes>): Promise<Message<boolean>> {
		return await this._interaction.editReply(this._convertQuestionContentIntoEditReplyOptions(this._getQuestionContent(question)));
	}

	private _getQuestionContent(question: DataCollectionPollDefaultQuestion<DataCollectionPollQuestionContentTypes>): string | EmbedBuilder {
		return(
			question.contentType === DataCollectionPollQuestionContentTypes.MESSAGE
			? getLocalizationForText(question.content as TextsLocalizationsIds, this._language)
			: getLocalizationForEmbed({ embedId: question.content as EmbedsLocalizationsIds, language: this._language })
		);
	}

	private _convertQuestionContentIntoEditReplyOptions(content: string | EmbedBuilder): InteractionEditReplyOptions {
		return (
			typeof content === 'string'
			? { content }
			: { embeds: [content] }
		);
	}

	private async _getAnswerForQuestion(question: DataCollectionPollQuestion<boolean>): Promise<CollectedQuestionAnswer | null> {
		switch (question.type) {
			case QuestionTypes.SELECT_MENU:
				return await this._getAnswerForSelectMenu(question);
			case QuestionTypes.BUTTONS:
				return await this._getAnswerForButtons(question);
			case QuestionTypes.MODAL_MENU:
				return await this._getAnswerForModalMenu(question);
			default:
				return null;
		}
	}

	private async _getAnswerForSelectMenu(question: DataCollectionPollSelectMenuQuestion<boolean>): Promise<CollectedSelectMenuAnswer | null> {
		switch (question.selectMenuType) {
			case ComponentType.StringSelect:
				return await this._getAnswerForStringSelectMenu(question);
			case ComponentType.UserSelect:
				return await this._getAnswerForUserSelectMenu(question);
			case ComponentType.RoleSelect:
				return await this._getAnswerForRoleSelectMenu(question);
			case ComponentType.MentionableSelect:
				return await this._getAnswerForMentionableSelectMenu(question);
			default:
				return null;
		}
	}

	private async _getAnswerForStringSelectMenu(question: DataCollectionPollStringSelectMenuQuestion<boolean>): Promise<CollectedStringSelectMenuAnswer| null> {
		const answer = await (await PaginationSelectMenu.create(...this._getPaginationSelectMenuCreateParametersFromQuestion(question))).getUserAnswer();
		if (!answer) return null;

		await answer.deferUpdate(); //TODO Сделать везде
		return this._getNormolizedUserStringSelectMenuAnswer(question, answer.values);
	}

	private _getPaginationSelectMenuCreateParametersFromQuestion(question: DataCollectionPollStringSelectMenuQuestion<boolean>): [RepliableInteraction, User, PaginationSelectMenuOptions] {
		return [
			this._interaction,
			this._respondent.user,
			this._convertQuestionAnswerIntoPaginationSelectMenuOptions(question)
		];
	}

	private _convertQuestionAnswerIntoPaginationSelectMenuOptions(question: DataCollectionPollStringSelectMenuQuestion<boolean>): PaginationSelectMenuOptions {
		return {
			isLocalizationRequer: true,
			choices: Array.from(this._getPaginationSelectMenuChoicesFromQuestionAnswers(question.answers)),
			language: this._language,
			selectMenuOptions: this._getPaginationSelectMenuOptionsFromQuestion(question)
		};
	}

	private *_getPaginationSelectMenuChoicesFromQuestionAnswers(answers: DataCollectionPollSelectMenuAnswer<boolean>[]): Iterable<SelectMenuOptionWithLocalizations> {
		for (const [key, answer] of Object.entries(answers)) {
			yield {
				label: answer.label,
				value: key,
				default: answer.default,
				description: answer.description
			}
		}
	}
	
	private _getPaginationSelectMenuOptionsFromQuestion(question: DataCollectionPollStringSelectMenuQuestion<boolean>): PaginationSelectMenuSettings<true> {
		return {
			max_values: question.maxAnswers,
			min_values: question.minAnswers,
			placeholder: question.placeholder,
		}
	}

	private _getNormolizedUserStringSelectMenuAnswer(
		question: DataCollectionPollStringSelectMenuQuestion<boolean>,
		values: StringSelectMenuInteraction['values']
	): CollectedStringSelectMenuAnswer {
		return {
			type: QuestionTypes.SELECT_MENU,
			seletMenuType: ComponentType.StringSelect,
			answer: Array.from(this._getUserStringSelectMenuAnswersFromValues(question, values)),
			categories: Array.from(this._getUserStringSelectMenuCategoriesFromValues(question, values)),
			question: this._getQuestionContent(question),
		}
	}

	private *_getUserStringSelectMenuAnswersFromValues(question: DataCollectionPollStringSelectMenuQuestion<boolean>, values: StringSelectMenuInteraction['values']): Iterable<StringSelectMenuAnswerData> {
		for (const value of values) {
			const answerData = question.answers[Number(value)];
			if (answerData) yield {
				value: answerData.value,
				label: getLocalizationForText(answerData.label, this._language)
			};
		}
	}

	private *_getUserStringSelectMenuCategoriesFromValues(question: DataCollectionPollStringSelectMenuQuestion<boolean>, values: StringSelectMenuInteraction['values']): Iterable<string> {
		for (const value of values) {
			const category = question.answers[Number(value)]?.category;
			if (category) yield category;
		}
	}

	private async _getAnswerForUserSelectMenu(question: DataCollectionPollUserSelectMenuQuestion<boolean>): Promise<CollectedUserSelectMenuAnswer| null> {
		const message = await this._interaction.editReply({ components: [this._getUserSelectMenuActionRowForQuestion(question, question.selectMenuType)] });
		const answerInteraction = await message.awaitMessageComponent({ componentType: question.selectMenuType, idle: 60*60*1000 }).catch(() => {});
		if (!answerInteraction) return null;

		return await this._getNormolizedUserSelectMenuAnswer(question, Array.from(answerInteraction.members.values()));
	}

	private async _getNormolizedUserSelectMenuAnswer(question: DataCollectionPollUserSelectMenuQuestion<boolean>, members: (GuildMember | APIGuildMember)[]): Promise<CollectedUserSelectMenuAnswer> {
		const answer: CollectedUserSelectMenuAnswer = {
			question: this._getQuestionContent(question),
			answer: await this._getUserSelectMenuAnswersFromMembers(members),
			seletMenuType: question.selectMenuType,
			type: question.type
		}

		if (question.category) answer.categories = [question.category];

		return answer;
	}

	private async _getUserSelectMenuAnswersFromMembers(values: (GuildMember | APIGuildMember)[]): Promise<GuildMember[]> {
		if (!this._interaction.guild) throw new Error('Something went wrong in _getUserSelectMenuAnswersFromMembers');
		const answers: GuildMember[] = [];

		for (const value of values) {
			if (value instanceof GuildMember) {
				answers.push(value);
			} else {
				const member = await this._interaction.guild.members.fetch(value.user?.id ?? '').catch(() => {});
				if (!member) continue;
				answers.push(member);
			}
		}

		return answers;
	}

	private async _getAnswerForRoleSelectMenu(question: DataCollectionPollRoleSelectMenuQuestion<boolean>): Promise<CollectedRoleSelectMenuAnswer | null> {
		const message = await this._interaction.editReply({ components: [this._getUserSelectMenuActionRowForQuestion(question, question.selectMenuType)] });
		const answerInteraction = await message.awaitMessageComponent({ componentType: question.selectMenuType, idle: 60*60*1000 }).catch(() => {});
		if (!answerInteraction) return null;

		return await this._getNormolizedRoleSelectMenuAnswer(question, Array.from(answerInteraction.roles.values()));
	}

	private async _getNormolizedRoleSelectMenuAnswer(question: DataCollectionPollRoleSelectMenuQuestion<boolean>, roles: (Role | APIRole)[]): Promise<CollectedRoleSelectMenuAnswer> {
		const answer: CollectedRoleSelectMenuAnswer = {
			question: this._getQuestionContent(question),
			answer: await this._getRoleSelectMenuAnswersFromRoles(roles),
			seletMenuType: question.selectMenuType,
			type: question.type
		}

		if (question.category) answer.categories = [question.category];

		return answer;
	} //TODO: Подумать, как переделать

	private async _getRoleSelectMenuAnswersFromRoles(values: (Role | APIRole)[]): Promise<Role[]> {
		if (!this._interaction.guild) throw new Error('Something went wrong in _getNormolizedRoleSelectMenuAnswer');
		const answers: Role[] = [];

		for (const value of values) {
			if (value instanceof Role) {
				answers.push(value);
			} else {
				const role = await this._interaction.guild.roles.fetch(value.id).catch(() => {});
				if (!role) continue;
				answers.push(role);
			}
		}

		return answers;
	} //TODO: Подумать, как переделать

	private async _getAnswerForMentionableSelectMenu(question: DataCollectionPollMentionableSelectMenuQuestion<boolean>): Promise<CollectedMentionableSelectMenuAnswer | null> {
		const message = await this._interaction.editReply({ components: [this._getUserSelectMenuActionRowForQuestion(question, question.selectMenuType)] });
		const answerInteraction = await message.awaitMessageComponent({ componentType: question.selectMenuType, idle: 60*60*1000 }).catch(() => {});
		if (!answerInteraction) return null;

		return await this._getNormolizedMentionableSelectMenuAnswer(
			question,
			Array.from(answerInteraction.roles.values()),
			Array.from(answerInteraction.members.values())
		);
	}

	private async _getNormolizedMentionableSelectMenuAnswer(
		question: DataCollectionPollMentionableSelectMenuQuestion<boolean>,
		roles: (Role | APIRole)[],
		members: (GuildMember | APIGuildMember)[]
	): Promise<CollectedMentionableSelectMenuAnswer> {
		const answer: CollectedMentionableSelectMenuAnswer = {
			question: this._getQuestionContent(question),
			answer: {
				roles: await this._getRoleSelectMenuAnswersFromRoles(roles),
				members: await this._getUserSelectMenuAnswersFromMembers(members)
			},
			seletMenuType: question.selectMenuType,
			type: question.type
		}

		if (question.category) answer.categories = [question.category];

		return answer;
	}

	private _getUserSelectMenuActionRowForQuestion<T extends ComponentType.UserSelect | ComponentType.RoleSelect | ComponentType.MentionableSelect>(
		question: Exclude<DataCollectionPollSelectMenuQuestion<boolean>, DataCollectionPollStringSelectMenuQuestion<boolean>>,
		selectMenuType: T
	): ActionRowBuilder<SelectMenuBuildersByComponentTypes[T]> {
		const selectMenu = new selectMenuBuildersByComponentTypes[selectMenuType]({
			custom_id: '1',
			max_values: question.max_values,
			min_values: question.min_values,
		}) as SelectMenuBuildersByComponentTypes[T];

		if (question.placeholder) selectMenu.setPlaceholder(getLocalizationForText(question.placeholder, this._language));

		return new ActionRowBuilder<SelectMenuBuildersByComponentTypes[T]>().addComponents(selectMenu);
	}

	private async _getAnswerForButtons(question: DataCollectionPollButtonsQuestion<boolean>): Promise<CollectedButtonsAnswer | null> {
		switch (question.buttonsType) {
			case ButtonsQuestionTypes.DEFAULT:
				return await this._getAnswerForDefaultButtons(question);
			case ButtonsQuestionTypes.CONFIRMATION:
				return await this._getAnswerForConfirmationButtons(question);
			default:
				return null;
		}
	}

	private async _getAnswerForDefaultButtons(question: DataCollectionPollDefaultButtonsQuestion<boolean>): Promise<CollectedDefaultButtonsAnswer | null> {
		const message = await this._interaction.editReply({ components: [this._getButtonsActionRowForAnswers(question.buttons)] });
		const answerInteraction = await message.awaitMessageComponent({ componentType: ComponentType.Button, idle: 60*60*1000 }).catch(() => {});
		if (!answerInteraction) return null;

		return this._getNormolizedAnswerForDefaultButtons(question, Number(answerInteraction.customId));
	}

	private _getButtonsActionRowForAnswers(answers: DataCollectionPollSelectButton<boolean>[]): ActionRowBuilder<ButtonBuilder> {
		const row = new ActionRowBuilder<ButtonBuilder>();

		for (const [key, answer] of Object.entries(answers)) {
			row.addComponents(new ButtonBuilder({
				customId: key,
				emoji: answer.emoji,
				label: getLocalizationForText(answer.label, this._language),
				style: answer.style
			}));
		}

		return row;
	}

	private _getNormolizedAnswerForDefaultButtons(question: DataCollectionPollDefaultButtonsQuestion<boolean>, buttonKey: number): CollectedDefaultButtonsAnswer | null {
		const button = question.buttons[buttonKey];
		if (!button) return null;

		const normolizedAnswer: CollectedDefaultButtonsAnswer = {
			type: question.type,
			buttonsType: question.buttonsType,
			answer: button.value,
			question: this._getQuestionContent(question),
			label: getLocalizationForText(button.label, this._language)
		}

		if (button.category) normolizedAnswer.categories = [button.category];

		return normolizedAnswer;
	}

	private async _getAnswerForConfirmationButtons(question: DataCollectionPollConfirmationButtonsQuestion<boolean>): Promise<CollectedConfirmationButtonsAnswer | null> {
		const confirmationAnswer = await getUserConfirmation(this._interaction, { language: this._language, labels: question.labels }, false);

		return this._getNormolizedUserConfirmationButtonsAnswer(question, confirmationAnswer);
	}

	private _getNormolizedUserConfirmationButtonsAnswer(
		question: DataCollectionPollConfirmationButtonsQuestion<boolean>,
		answer: UserConfirmationsAnswers,
	): CollectedConfirmationButtonsAnswer {
		const normolizedAnswer: CollectedConfirmationButtonsAnswer = {
			question: this._getQuestionContent(question),
			answer: answer,
			type: question.type,
			buttonsType: question.buttonsType,
			label: getLocalizationForText((
				question.labels
				? question.labels[answer]
				: userConfirmationInteractionButtonsSettings[answer].label
			), this._language)
		}

		if (question.category) normolizedAnswer.categories = [question.category];

		return normolizedAnswer;
	}

	private async _getAnswerForModalMenu(question: DataCollectionPollSelectModalQuestion<boolean>): Promise<CollectedModalMenuAnswer | null> {
		const message = await this._interaction.editReply({ components: [this._getButtonsActionRowForAnswers(modalMenuSendButtons)] });
		const answerInteraction = await message.awaitMessageComponent({ componentType: ComponentType.Button, idle: 60*60*1000 }).catch(() => {});
		if (!answerInteraction) return null;

		await answerInteraction.showModal(this._getModalMenuForInputs(question));
		const modalSubmit = await answerInteraction.awaitModalSubmit({ time: 10*60*1000 }).catch((error) => { throw error; });
		if (!modalSubmit.isFromMessage()) throw new Error('Something went wrong with modal in _getAnswerForModalMenu');
		
		await modalSubmit.update({ components: [] });
		return this._getNormolizedUserModalMenuAnswer(question, modalSubmit);
	}

	private _getModalMenuForInputs(question: DataCollectionPollSelectModalQuestion<boolean>): ModalBuilder {
		return new ModalBuilder()
			.setCustomId('modal')
			.setTitle(getLocalizationForText(question.title, this._language))
			.addComponents(Array.from(this._getModalMenuTextInputsActionRow(question.inputs)));
	}

	private *_getModalMenuTextInputsActionRow(inputs: DataCollectionPollModalMenuInput[]): Iterable<ActionRowBuilder<TextInputBuilder>> {
		for (const input of inputs) {
			const textInputBuilder = new TextInputBuilder({
				customId: input.custom_id,
				required: input.required,
				label: getLocalizationForText(input.label, this._language),
				max_length: input.max_length,
				min_length: input.min_length,
				style: input.style,
			});

			if (input.placeholder) textInputBuilder.setPlaceholder(getLocalizationForText(input.placeholder, this._language))
			if (input.value) textInputBuilder.setValue(getLocalizationForText(input.value, this._language))

			yield new ActionRowBuilder<TextInputBuilder>().addComponents(textInputBuilder);
		}
	}

	private _getNormolizedUserModalMenuAnswer(
		question: DataCollectionPollSelectModalQuestion<boolean>,
		submit: ModalSubmitInteraction<CacheType>
	): CollectedModalMenuAnswer{
		return {
			question: this._getQuestionContent(question),
			type: question.type,
			answer: this._getModalMenuAnswersFromSubmit(question, submit)
		};
	}

	private _getModalMenuAnswersFromSubmit(
		question: DataCollectionPollSelectModalQuestion<boolean>,
		submit: ModalSubmitInteraction<CacheType>
	): ModalMenuAnswersData {
		const answers: ModalMenuAnswersData = {};

		for (const input of question.inputs) {
			const submitField = submit.fields.getField(input.custom_id)
			if (submitField.type !== ComponentType.TextInput || submitField.value.length <= 0) continue;

			answers[input.custom_id] = {
				label: getLocalizationForText(input.label, this._language),
				value: submitField.value
			};
		}

		return answers;
	}
}

const modalMenuSendButtons: DataCollectionPollSelectButton<false>[] = [{
	label: TextsLocalizationsIds.DATA_COLLECTION_POLL_MODAL_MENU_MESSAGE_BUTTON,
	style: ButtonStyle.Success,
	value: 'send'
}];

const selectMenuBuildersByComponentTypes = {
	[ComponentType.UserSelect]: UserSelectMenuBuilder,
	[ComponentType.RoleSelect]: RoleSelectMenuBuilder,
	[ComponentType.MentionableSelect]: MentionableSelectMenuBuilder
}

interface SelectMenuBuildersByComponentTypes {
	[ComponentType.UserSelect]: UserSelectMenuBuilder,
	[ComponentType.RoleSelect]: RoleSelectMenuBuilder,
	[ComponentType.MentionableSelect]: MentionableSelectMenuBuilder
}
