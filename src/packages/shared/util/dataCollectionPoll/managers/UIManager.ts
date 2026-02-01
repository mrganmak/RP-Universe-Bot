import { 
	Message, 
	RepliableInteraction, 
	InteractionEditReplyOptions, 
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	ModalBuilder,
	TextInputBuilder,
	UserSelectMenuBuilder,
	RoleSelectMenuBuilder,
	MentionableSelectMenuBuilder,
	ChannelSelectMenuBuilder
} from "discord.js";
import { 
	DataCollectionPollDefaultQuestion,
	CollectionPollQuestionContentTypes,
	DataCollectionPollSelectModalQuestion,
	DataCollectionPollModalMenuInput,
	DataCollectionPollSelectButton,
	DataCollectionPollSelectMenuQuestion,
	LocalizationLanguages,
	getLocalizationForText,
	getLocalizationForEmbed,
	EmbedLocalizationIds,
	TextLocalizationIds
} from "@src/index.js";

export class UIManager {
	constructor(
		private readonly interaction: RepliableInteraction,
		private readonly language: LocalizationLanguages
	) {}

	/**
	 * Отправляет содержимое вопроса (текст или embed)
	 */
	public async sendQuestionContent(question: DataCollectionPollDefaultQuestion<CollectionPollQuestionContentTypes>): Promise<Message<boolean>> {
		const content = this.getQuestionContent(question);
		const options = this.convertQuestionContentIntoEditReplyOptions(content);
		return await this.interaction.editReply(options);
	}

	/**
	 * Унифицированный метод для отправки SelectMenu компонентов
	 * Автоматически определяет тип и настройки на основе selectMenuType
	 */
	public async sendSelectMenu(question: DataCollectionPollSelectMenuQuestion<boolean>): Promise<Message<boolean>> {
		const content = this.getQuestionContent(question);
		const options = this.convertQuestionContentIntoEditReplyOptions(content);
		
		const selectMenu = this.createSelectMenuFromQuestion(question);
		const row = new ActionRowBuilder<any>().addComponents(selectMenu);
		
		options.components = [row];
		return await this.interaction.editReply(options);
	}

	/**
	 * Создает SelectMenu компонент на основе вопроса
	 * Приватный метод для внутренней логики
	 */
	private createSelectMenuFromQuestion(question: DataCollectionPollSelectMenuQuestion<boolean>): UserSelectMenuBuilder | RoleSelectMenuBuilder | MentionableSelectMenuBuilder | ChannelSelectMenuBuilder {
		const { selectMenuType, placeholder } = question;
		const customId = this.getCustomIdForSelectMenuType(selectMenuType);
		const localizedPlaceholder = placeholder ? getLocalizationForText(placeholder, this.language) : this.getDefaultPlaceholder(selectMenuType);
		
		switch (selectMenuType) {
			case ComponentType.UserSelect:
				return new UserSelectMenuBuilder()
					.setCustomId(customId)
					.setPlaceholder(localizedPlaceholder)
					.setMinValues(question.min_values || 1)
					.setMaxValues(question.max_values || 1);
					
			case ComponentType.RoleSelect:
				return new RoleSelectMenuBuilder()
					.setCustomId(customId)
					.setPlaceholder(localizedPlaceholder)
					.setMinValues(question.min_values || 1)
					.setMaxValues(question.max_values || 1);
					
			case ComponentType.MentionableSelect:
				return new MentionableSelectMenuBuilder()
					.setCustomId(customId)
					.setPlaceholder(localizedPlaceholder)
					.setMinValues(question.min_values || 1)
					.setMaxValues(question.max_values || 1);
					
			case ComponentType.ChannelSelect:
				const channelSelect = new ChannelSelectMenuBuilder()
					.setCustomId(customId)
					.setPlaceholder(localizedPlaceholder)
					.setMinValues(question.min_values || 1)
					.setMaxValues(question.max_values || 1);
				
				// Устанавливаем типы каналов если они указаны
				if ('channel_types' in question && question.channel_types) {
					channelSelect.setChannelTypes(question.channel_types);
				}
				
				return channelSelect;
				
			default:
				throw new Error(`Unsupported select menu type: ${selectMenuType}`);
		}
	}

	/**
	 * Генерирует customId для SelectMenu
	 */
	private getCustomIdForSelectMenuType(selectMenuType: ComponentType): string {
		switch (selectMenuType) {
			case ComponentType.UserSelect: return 'user_select';
			case ComponentType.RoleSelect: return 'role_select';
			case ComponentType.MentionableSelect: return 'mentionable_select';
			case ComponentType.ChannelSelect: return 'channel_select';
			default: return 'select_menu';
		}
	}

	/**
	 * Возвращает placeholder по умолчанию для типа SelectMenu
	 */
	private getDefaultPlaceholder(selectMenuType: ComponentType): string {
		switch (selectMenuType) {
			case ComponentType.UserSelect: return getLocalizationForText(TextLocalizationIds.UIManagerUserSelectPlaceholder, this.language);
			case ComponentType.RoleSelect: return getLocalizationForText(TextLocalizationIds.UIManagerRoleSelectPlaceholder, this.language);
			case ComponentType.MentionableSelect: return getLocalizationForText(TextLocalizationIds.UIManagerMentionableSelectPlaceholder, this.language);
			case ComponentType.ChannelSelect: return getLocalizationForText(TextLocalizationIds.UIManagerChannelSelectPlaceholder, this.language);
			default: return getLocalizationForText(TextLocalizationIds.UIManagerDefaultSelectPlaceholder, this.language);
		}
	}

	/**
	 * Отправляет содержимое вопроса с кнопкой для модального окна
	 */
	public async sendModalTriggerButtons(question: DataCollectionPollDefaultQuestion<CollectionPollQuestionContentTypes>): Promise<Message<boolean>> {
		const content = this.getQuestionContent(question);
		const options = this.convertQuestionContentIntoEditReplyOptions(content);
		
		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setLabel(getLocalizationForText(TextLocalizationIds.UIManagerOpenFormButton, this.language))
					.setStyle(ButtonStyle.Success)
					.setCustomId('open_modal')
			);

		options.components = [row];
		return await this.interaction.editReply(options);
	}

	/**
	 * Отправляет содержимое вопроса с кнопками для выбора ответа
	 */
	public async sendAnswerButtons(question: DataCollectionPollDefaultQuestion<CollectionPollQuestionContentTypes>, buttons: DataCollectionPollSelectButton<boolean>[]): Promise<Message<boolean>> {
		const content = this.getQuestionContent(question);
		const options = this.convertQuestionContentIntoEditReplyOptions(content);
		
		const row = new ActionRowBuilder<ButtonBuilder>();

		for (const [key, button] of Object.entries(buttons)) {
			row.addComponents(
				new ButtonBuilder({
					customId: key,
					emoji: button.emoji,
					label: getLocalizationForText(button.label, this.language),
					style: button.style
				})
			);
		}

		options.components = [row];
		return await this.interaction.editReply(options);
	}

	/**
	 * Создает модальное окно для ввода данных
	 */
	public createModal(question: DataCollectionPollSelectModalQuestion<boolean>): ModalBuilder {
		return new ModalBuilder()
			.setCustomId('poll_modal')
			.setTitle(getLocalizationForText(question.title, this.language))
			.addComponents(
				Array.from(this.createModalInputRows(question.inputs))
			);
	}

	/**
	 * Показывает сообщение об ошибке (таймаут, отмена и т.д.)
	 */
	public async showError(message: string, clearComponents: boolean = true): Promise<Message<boolean>> {
		const options: InteractionEditReplyOptions = {
			content: `${getLocalizationForText(TextLocalizationIds.UIManagerErrorPrefix, this.language)} ${message}`,
			embeds: []
		};

		if (clearComponents) {
			options.components = [];
		}

		return await this.interaction.editReply(options);
	}

	/**
	 * Показывает сообщение об успешном завершении
	 */
	public async showSuccess(message: string): Promise<Message<boolean>> {
		return await this.interaction.editReply({
			content: `${getLocalizationForText(TextLocalizationIds.UIManagerSuccessPrefix, this.language)} ${message}`,
			components: []
		});
	}

	/**
	 * Очищает все компоненты интерфейса
	 */
	public async clearComponents(): Promise<Message<boolean>> {
		return await this.interaction.editReply({
			components: []
		});
	}

	/**
	 * Показывает сообщение о таймауте
	 */
	public async showTimeoutError(): Promise<Message<boolean>> {
		return await this.showError(
			getLocalizationForText(TextLocalizationIds.UIManagerTimeoutErrorMessage, this.language),
			true
		);
	}

	/**
	 * Показывает сообщение об отмене
	 */
	public async showCancellationError(): Promise<Message<boolean>> {
		return await this.showError(
			getLocalizationForText(TextLocalizationIds.UIManagerCancellationErrorMessage, this.language),
			true
		);
	}

	/**
	 * Показывает сообщение о технической ошибке
	 */
	public async showTechnicalError(error: string): Promise<Message<boolean>> {
		return await this.showError(
			`${getLocalizationForText(TextLocalizationIds.UIManagerTechnicalErrorPrefix, this.language)} ${error}`,
			true
		);
	}

	/**
	 * Получает содержимое вопроса (текст или embed)
	 */
	private getQuestionContent(question: DataCollectionPollDefaultQuestion<CollectionPollQuestionContentTypes>): string | EmbedBuilder {
		return question.contentType === CollectionPollQuestionContentTypes.MESSAGE
			? getLocalizationForText(question.content as TextLocalizationIds, this.language)
			: getLocalizationForEmbed({ 
				embedId: question.content as EmbedLocalizationIds, 
				language: this.language 
			});
		//As is necessary in this case, since the check question.contentType === CollectionPollQuestionContentTypes.MESSAGE has already been performed above, which excludes other types.
	}

	/**
	 * Конвертирует содержимое в опции для editReply
	 */
	private convertQuestionContentIntoEditReplyOptions(content: string | EmbedBuilder): InteractionEditReplyOptions {
		return typeof content === 'string' 
			? { content } 
			: { embeds: [content] };
	}

	/**
	 * Создает строки с полями ввода для модального окна
	 */
	private *createModalInputRows(inputs: DataCollectionPollModalMenuInput[]): Iterable<ActionRowBuilder<TextInputBuilder>> {
		for (const input of inputs) {
			const textInput = new TextInputBuilder({
				customId: input.custom_id,
				required: input.required,
				label: getLocalizationForText(input.label, this.language),
				max_length: input.max_length,
				min_length: input.min_length,
				style: input.style,
			});

			if (input.placeholder) {
				textInput.setPlaceholder(getLocalizationForText(input.placeholder, this.language));
			}
			if (input.value) {
				textInput.setValue(getLocalizationForText(input.value, this.language));
			}

			yield new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);
		}
	}
}
