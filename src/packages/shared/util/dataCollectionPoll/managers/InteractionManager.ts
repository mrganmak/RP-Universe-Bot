import { 
	Message, 
	ComponentType, 
	ButtonInteraction, 
	ModalSubmitInteraction,
	StringSelectMenuInteraction,
	UserSelectMenuInteraction,
	RoleSelectMenuInteraction,
	MentionableSelectMenuInteraction,
	ChannelSelectMenuInteraction,
	CacheType
} from "discord.js";

export interface InteractionTimeoutOptions {
	timeout?: number;
	onTimeout?: () => Promise<void>;
}

export class InteractionManager {
	constructor(private readonly message: Message<boolean>) {}

	/**
	 * Ожидает нажатие кнопки
	 */
	public async awaitButton(options: InteractionTimeoutOptions = {}): Promise<ButtonInteraction | null> {
		const { timeout = 60 * 60 * 1000, onTimeout } = options; // 1 час по умолчанию

		try {
			const interaction = await this.message.awaitMessageComponent({
				componentType: ComponentType.Button,
				idle: timeout
			});
			return interaction;
		} catch (error) {
			if (onTimeout) {
				await onTimeout();
			}
			return null;
		}
	}

	/**
	 * Ожидает выбор в строковом select menu
	 */
	public async awaitStringSelect(options: InteractionTimeoutOptions = {}): Promise<StringSelectMenuInteraction | null> {
		const { timeout = 60 * 60 * 1000, onTimeout } = options;

		try {
			const interaction = await this.message.awaitMessageComponent({
				componentType: ComponentType.StringSelect,
				idle: timeout
			});
			return interaction;
		} catch (error) {
			if (onTimeout) {
				await onTimeout();
			}
			return null;
		}
	}

	/**
	 * Унифицированный метод для ожидания SelectMenu взаимодействий
	 * Автоматически определяет тип на основе переданного componentType
	 */
	public async awaitSelectMenu(
		componentType: ComponentType.UserSelect | ComponentType.RoleSelect | ComponentType.MentionableSelect | ComponentType.ChannelSelect,
		options: InteractionTimeoutOptions = {}
	): Promise<UserSelectMenuInteraction | RoleSelectMenuInteraction | MentionableSelectMenuInteraction | ChannelSelectMenuInteraction | null> {
		const { timeout = 60 * 60 * 1000, onTimeout } = options;

		try {
			const interaction = await this.message.awaitMessageComponent({
				componentType,
				idle: timeout
			});
			return interaction;
		} catch (error) {
			if (onTimeout) {
				await onTimeout();
			}
			return null;
		}
	}

	/**
	 * Ожидает отправку модального окна
	 * Примечание: этот метод должен вызываться на ButtonInteraction после showModal
	 */
	public static async awaitModalSubmitFromButton(
		buttonInteraction: ButtonInteraction, 
		options: InteractionTimeoutOptions = {}
	): Promise<ModalSubmitInteraction<CacheType> | null> {
		const { timeout = 2 * 60 * 60 * 1000, onTimeout } = options; // 2 часа для модальных окон

		try {
			const modalSubmit = await buttonInteraction.awaitModalSubmit({
				time: timeout
			});
			return modalSubmit;
		} catch (error) {
			if (onTimeout) {
				await onTimeout();
			}
			return null;
		}
	}

	/**
	 * Ожидает любой тип взаимодействия
	 */
	public async awaitAnyComponent(options: InteractionTimeoutOptions = {}): Promise<any | null> {
		const { timeout = 60 * 60 * 1000, onTimeout } = options;

		try {
			const interaction = await this.message.awaitMessageComponent({
				idle: timeout
			});
			return interaction;
		} catch (error) {
			if (onTimeout) {
				await onTimeout();
			}
			return null;
		}
	}
}
