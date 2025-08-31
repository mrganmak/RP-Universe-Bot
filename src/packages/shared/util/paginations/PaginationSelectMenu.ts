import { ActionRowBuilder, MessageActionRowComponentBuilder, ButtonBuilder, StringSelectMenuBuilder } from "@discordjs/builders";
import { 
	APISelectMenuOption, 
	APIStringSelectComponent, 
	ButtonInteraction, 
	ButtonStyle, 
	RepliableInteraction, 
	ComponentType, 
	InteractionCollector, 
	Message, 
	StringSelectMenuInteraction, 
	User, 
	BaseInteraction, 
	Interaction, 
	GuildTextBasedChannel, 
	APIMessageComponentEmoji 
} from "discord.js";
import { 
	DEFAULT_SERVER_LANGUAGE, 
	getLocalizationForText, 
	LocalizationLanguages, 
	TextLocalizationIds 
} from "@src/index.js";
import EventEmitter from "events";

export interface PaginationSelectMenuSettings<IsWithLocalization extends boolean = false> {
	min_values?: Partial<APIStringSelectComponent>['min_values'];
	max_values?: Partial<APIStringSelectComponent>['max_values'];
	placeholder?: (IsWithLocalization extends true ? TextLocalizationIds : Partial<APIStringSelectComponent>['placeholder']);
}

export type PaginationSelectMenuOptions = PaginationSelectMenuDefaultOptions | PaginationSelectMenuWithLocalizationOptions;

interface PaginationSelectMenuDefaultOptions {
	isLocalizationRequired: false;
	choices: APISelectMenuOption[];
	selectMenuOptions?: PaginationSelectMenuSettings;
}

interface PaginationSelectMenuWithLocalizationOptions {
	isLocalizationRequired: true;
	choices: SelectMenuOptionsWithLocalization;
	language: LocalizationLanguages;
	selectMenuOptions?: PaginationSelectMenuSettings<true>;
}

export type SelectMenuOptionsWithLocalization = SelectMenuOptionWithLocalization[];

export interface SelectMenuOptionWithLocalization {
	label: TextLocalizationIds;
	value: string;
	default?: boolean;
	description?: TextLocalizationIds;
	emoji?: APIMessageComponentEmoji;
}

interface PaginationState {
	currentPage: number;
	totalPages: number;
	options: APISelectMenuOption[];
}

interface PaginationConfig {
	idleTimeout: number;
	itemsPerPage: number;
	showPageIndicator: boolean;
}

export const DISCORD_SELECT_MENU_MAX_OPTIONS = 25; // Discord API limit
export const DISCORD_SELECT_MENU_MIN_OPTIONS = 1;

const DEFAULT_CONFIG: PaginationConfig = {
	idleTimeout: 60 * 60 * 1000, //1 Hour
	itemsPerPage: DISCORD_SELECT_MENU_MAX_OPTIONS,
	showPageIndicator: true
};

export interface PaginationEvents {
	collect: [StringSelectMenuInteraction];
	end: [];
	timeout: [];
	error: [Error];
}

export class PaginationSelectMenu<T extends PaginationSelectMenuOptions = PaginationSelectMenuOptions> 
	extends EventEmitter {
	
	private readonly _state: PaginationState;
	private readonly _config: PaginationConfig;
	private readonly _options: T;
	private readonly _language: LocalizationLanguages;
	private readonly _author: User;
	private readonly _isNeedMessageDelete: boolean;

	private _selectMenuCollector!: InteractionCollector<StringSelectMenuInteraction>;
	private _buttonCollector!: InteractionCollector<ButtonInteraction>;
	private _message!: Message;
	private _answer: StringSelectMenuInteraction | undefined;
	private _isDestroyed = false;


	public static async create<T extends PaginationSelectMenuOptions>(
		target: Message | RepliableInteraction | GuildTextBasedChannel,
		author: User,
		options: T,
		config: Partial<PaginationConfig> = {}
	): Promise<PaginationSelectMenu<T>> {
		const instance = new PaginationSelectMenu(target, author, options, config);
		await instance._initialize();
		return instance;
	}

	public getUserAnswer(): Promise<StringSelectMenuInteraction | null> {
		return new Promise((resolve) => {
			if (this._answer) {
				return resolve(this._answer);
			}
			
			this.once('collect', (answer) => resolve(answer));
			this.once('end', () => resolve(null));
			this.once('timeout', () => resolve(null));
			this.once('error', () => resolve(null));
		});
	}

	public addOptions(options: T['choices']): this {
		if (this._isDestroyed) {
			throw new Error('Cannot add options to destroyed pagination');
		}

		this._state.options.push(...this._normalizeOptions(options));
		this._updateState();
		this._updateComponents();
		return this;
	}

	public addOption(option: T['choices'][0]): this {
		if (this._isDestroyed) {
			throw new Error('Cannot add option to destroyed pagination');
		}

		this._state.options.push(this._normalizeOption(option));
		this._updateState();
		this._updateComponents();
		return this;
	}

	public destroy(): void {
		if (this._isDestroyed) return;

		this._isDestroyed = true;
		this._selectMenuCollector?.stop();
		this._buttonCollector?.stop();
		this.removeAllListeners();
	}

	public getConfig(): Readonly<PaginationConfig> {
		return { ...this._config };
	}

	public updateConfig(newConfig: Partial<PaginationConfig>): this {
		if (this._isDestroyed) {
			throw new Error('Cannot update config of destroyed pagination');
		}

		if (newConfig.itemsPerPage !== undefined && typeof newConfig.itemsPerPage === 'number') {
			this._validateItemsPerPage(newConfig.itemsPerPage);
		}

		Object.assign(this._config, newConfig);
		this._updateState();
		this._updateComponents();
		
		return this;
	}


	private constructor(
		private readonly _target: Message | RepliableInteraction | GuildTextBasedChannel,
		author: User,
		options: T,
		config: Partial<PaginationConfig> = {}
	) {
		super();

		this._author = author;
		this._options = options;
		this._config = { ...DEFAULT_CONFIG, ...config };
		
		this._validateItemsPerPage(this._config.itemsPerPage);
		
		this._language = options.isLocalizationRequired ? options.language : DEFAULT_SERVER_LANGUAGE;
		this._isNeedMessageDelete = this._target instanceof Message;

		this._state = {
			currentPage: 1,
			totalPages: 1,
			options: this._normalizeOptions(options.choices)
		};

		this._updateState();
	}


	private async _initialize(): Promise<void> {
		try {
			this._message = await this._createMessage();
			this._setupCollectors();
		} catch (error) {
			this.emit('error', error as Error);
			throw error;
		}
	}

	private async _createMessage(): Promise<Message> {
		const components = this._buildComponents();

		if (this._target instanceof Message) {
			return await this._target.edit({ components });
		} else if (this._target instanceof BaseInteraction) {
			if (this._target.replied || this._target.deferred) {
				await this._target.editReply({ components });
			} else {
				await this._target.reply({ components, fetchReply: true });
			}
			return await this._target.fetchReply();
		} else {
			return await this._target.send({ components });
		}
	}

	private _setupCollectors(): void {
		const filter = (interaction: Interaction) => interaction.user.id === this._author.id;

		this._selectMenuCollector = this._message.createMessageComponentCollector({
			componentType: ComponentType.StringSelect,
			filter,
			idle: this._config.idleTimeout
		});

		this._buttonCollector = this._message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			filter,
			idle: this._config.idleTimeout
		});

		this._selectMenuCollector.on('collect', this._handleSelectMenuInteraction.bind(this));
		this._selectMenuCollector.on('end', this._handleSelectMenuEnd.bind(this));
		this._buttonCollector.on('collect', this._handleButtonInteraction.bind(this));
	}


	private async _handleSelectMenuInteraction(interaction: StringSelectMenuInteraction): Promise<void> {
		try {
			await this._cleanupMessage();
			this._answer = interaction;
			this.emit('collect', interaction);
			this._stopCollectors();
		} catch (error) {
			this.emit('error', error as Error);
		}
	}

	private async _handleSelectMenuEnd(): Promise<void> {
		if (!this._answer) {
			try {
				await this._cleanupMessage();
				this.emit('timeout');
			} catch (error) {
				this.emit('error', error as Error);
			}
		}
		this.emit('end');
	}

	private async _handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
		try {
			switch (interaction.customId) {
				case 'left':
					this._goToPreviousPage();
					break;
				case 'right':
					this._goToNextPage();
					break;
			}
			await interaction.update({ components: this._buildComponents() });
		} catch (error) {
			this.emit('error', error as Error);
		}
	}

	private _updateState(): void {
		this._state.totalPages = Math.ceil(this._state.options.length / this._config.itemsPerPage);
		this._state.currentPage = Math.min(this._state.currentPage, this._state.totalPages);
		this._state.currentPage = Math.max(1, this._state.currentPage);
	}

	private _goToPreviousPage(): void {
		if (this._state.currentPage > 1) {
			this._state.currentPage--;
		}
	}

	private _goToNextPage(): void {
		if (this._state.currentPage < this._state.totalPages) {
			this._state.currentPage++;
		}
	}

	private _buildComponents(): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
		const components: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [
			this._buildSelectMenu()
		];

		if (this._shouldShowPagination()) {
			components.push(this._buildPaginationButtons());
		}

		return components;
	}

	private _buildSelectMenu(): ActionRowBuilder<StringSelectMenuBuilder> {
		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId('selectmenu')
			.addOptions(this._getCurrentPageOptions());

		if (this._options.selectMenuOptions) {
			if (this._options.selectMenuOptions.min_values !== undefined) {
				selectMenu.setMinValues(this._options.selectMenuOptions.min_values);
			}
			if (this._options.selectMenuOptions.max_values !== undefined) {
				selectMenu.setMaxValues(this._options.selectMenuOptions.max_values);
			}
			if (this._options.selectMenuOptions.placeholder) {
				const placeholder = this._options.isLocalizationRequired
					? getLocalizationForText(this._options.selectMenuOptions.placeholder, this._language)
					: this._options.selectMenuOptions.placeholder;
				selectMenu.setPlaceholder(placeholder);
			}
		}

		return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
	}

	private _buildPaginationButtons(): ActionRowBuilder<ButtonBuilder> {
		return new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId('left')
				.setLabel('◀')
				.setStyle(ButtonStyle.Primary)
				.setDisabled(this._state.currentPage === 1),
			new ButtonBuilder()
				.setCustomId('pages')
				.setLabel(`${this._state.currentPage}/${this._state.totalPages}`)
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(true),
			new ButtonBuilder()
				.setCustomId('right')
				.setLabel('▶')
				.setStyle(ButtonStyle.Primary)
				.setDisabled(this._state.currentPage >= this._state.totalPages)
		);
	}

	private _getCurrentPageOptions(): APISelectMenuOption[] {
		const startIndex = (this._state.currentPage - 1) * this._config.itemsPerPage;
		const endIndex = startIndex + this._config.itemsPerPage;
		return this._state.options.slice(startIndex, endIndex);
	}

	private _shouldShowPagination(): boolean {
		return this._config.showPageIndicator && this._state.totalPages > 1;
	}

	private _normalizeOptions(options: T['choices']): APISelectMenuOption[] {
		return options.map(option => this._normalizeOption(option));
	}

	private _normalizeOption(option: T['choices'][0]): APISelectMenuOption {
		if (this._options.isLocalizationRequired) {
			const localizedOption = option as SelectMenuOptionWithLocalization;
			return {
				label: getLocalizationForText(localizedOption.label, this._language),
				value: localizedOption.value,
				default: localizedOption.default,
				description: localizedOption.description 
					? getLocalizationForText(localizedOption.description, this._language)
					: undefined,
				emoji: localizedOption.emoji
			};
		}
		return option as APISelectMenuOption;
	}

	private async _cleanupMessage(): Promise<void> {
		if (this._isDestroyed) return;

		try {
			if (this._target instanceof Message) {
				if (this._target.deletable && this._isNeedMessageDelete) {
					await this._target.delete();
				} else if (this._target.editable && !this._isNeedMessageDelete) {
					await this._target.edit({ components: [] });
				}
			} else if (this._target instanceof BaseInteraction) {
				await this._target.editReply({ components: [] });
			}
		} catch (error) {
			console.error('Failed to cleanup message:', error);
		}
	}

	private _updateComponents(): void {
		if (this._isDestroyed) return;

		this._updateState();
		this._message.edit({ components: this._buildComponents() }).catch(error => {
			this.emit('error', error);
		});
	}

	private _stopCollectors(): void {
		this._selectMenuCollector?.stop();
		this._buttonCollector?.stop();
	}

	private _validateItemsPerPage(itemsPerPage: number): void {
		if (itemsPerPage < DISCORD_SELECT_MENU_MIN_OPTIONS) {
			throw new Error(`itemsPerPage can not be lower than ${DISCORD_SELECT_MENU_MIN_OPTIONS} option limit. Got: ${itemsPerPage}`);
		}
		if (itemsPerPage > DISCORD_SELECT_MENU_MAX_OPTIONS) {
			throw new Error(`itemsPerPage can not be greater than ${DISCORD_SELECT_MENU_MAX_OPTIONS} (Discord API limit). Got: ${itemsPerPage}`);
		}
	}
}
