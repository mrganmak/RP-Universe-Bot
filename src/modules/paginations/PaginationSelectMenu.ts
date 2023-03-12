import { ActionRowBuilder, MessageActionRowComponentBuilder, ButtonBuilder, StringSelectMenuBuilder } from "@discordjs/builders";
import { APISelectMenuOption, APIStringSelectComponent, ButtonInteraction, ButtonStyle, CommandInteraction, ComponentType, InteractionCollector, Message, StringSelectMenuInteraction, TextChannel, User, VoiceChannel } from "discord.js";
import { ELocalizationsLanguages } from "../../enum.js";
import { TSelectMenuOptionsWithLocalizations, ValueOf } from "../../types/types.js";
import { getLocalizationForText } from "../../localizations/texts/index.js";
import EventEmitter from "events";
import { DEFAULT_SERVER_LANGUAGE } from "../../consts.js";

export default class PaginationSelectMenu<T extends TPaginationSelectMenuOptions> extends EventEmitter {
	public static create<T extends TPaginationSelectMenuOptions>(message: Message, author: User, options: T, isNeedMessageDelete?: boolean): Promise<PaginationSelectMenu<T>>;
	public static create<T extends TPaginationSelectMenuOptions>(interaction: CommandInteraction, author: User, options: T): Promise<PaginationSelectMenu<T>>;
	public static create<T extends TPaginationSelectMenuOptions>(channel: TextChannel | VoiceChannel, author: User, options: T): Promise<PaginationSelectMenu<T>>;
	public static async create<T extends TPaginationSelectMenuOptions>(data: TextChannel | VoiceChannel | CommandInteraction | Message, author: User, options: T, isNeedMessageDelete?: boolean): Promise<PaginationSelectMenu<T>> {
		const selectMenuInteractionBuilder = new SelectMenuInteractionBuilder(options);

		if (data instanceof Message) {
			const message = await data.edit({ components: selectMenuInteractionBuilder.components });
			return new this(message, author, selectMenuInteractionBuilder, (isNeedMessageDelete ?? true));
		} else if (data instanceof CommandInteraction) {
			if (data.replied || data.deferred) await data.editReply({ components: selectMenuInteractionBuilder.components });
			else await data.reply({ components: selectMenuInteractionBuilder.components, fetchReply: true });
			const message = await data.fetchReply();

			return new this(data, author, selectMenuInteractionBuilder, false, message);
		} else {
			const message = await data.send({ components: selectMenuInteractionBuilder.components });
			return new this(message, author, selectMenuInteractionBuilder, false);
		}
	}

	private _messageOrInteraction: Message | CommandInteraction;
	private _selectMenuInteractionBuilder: SelectMenuInteractionBuilder<T>;
	private _selectMenuCollector: InteractionCollector<StringSelectMenuInteraction>;
	private _buttonCollector: InteractionCollector<ButtonInteraction>;
	private _answer: Array<string> | undefined;
	private _isNeedMessageDelete: boolean;

	private constructor(message: Message, author: User, selectMenuInteractionBuilder: SelectMenuInteractionBuilder<T>, isNeedMessageDelete?: boolean)
	private constructor(interaction: CommandInteraction, author: User, selectMenuInteractionBuilder: SelectMenuInteractionBuilder<T>, isNeedMessageDelete: boolean, interactionMessage: Message)
	private constructor(messageOrInteraction: Message | CommandInteraction, author: User, selectMenuInteractionBuilder: SelectMenuInteractionBuilder<T>, isNeedMessageDelete: boolean = true, interactionMessage?: Message) {
		super();

		this._isNeedMessageDelete = isNeedMessageDelete;
		this._messageOrInteraction = messageOrInteraction;
		this._selectMenuInteractionBuilder = selectMenuInteractionBuilder;

		const message = ((messageOrInteraction instanceof Message) ? messageOrInteraction : interactionMessage) as Message;
		this._selectMenuCollector = message.createMessageComponentCollector({ componentType: ComponentType.StringSelect, filter: (interaction) => (interaction.user.id === author.id) });
		this._buttonCollector = message.createMessageComponentCollector({ componentType: ComponentType.Button, filter: (interaction) => (interaction.user.id === author.id) });

		this._selectMenuCollector.on('collect', (interaction) => { this._onSelectMenuCollect(interaction) });
		this._buttonCollector.on('collect', (interaction) => (this._onButtonCollect(interaction)));
	}

	public getUserAnswer(): Promise<Array<string>> {
		return new Promise((resolve) => {
			if (this._answer) return resolve(this._answer);
			this.on('collect', (answer) => (resolve(answer)));
		})
	}

	private async _onSelectMenuCollect(interaction: StringSelectMenuInteraction): Promise<void> {
		await interaction.deferUpdate();

		if (this._messageOrInteraction instanceof Message) {
			if (this._messageOrInteraction.deletable && this._isNeedMessageDelete) await this._messageOrInteraction.delete().catch(() => {});
			else if (this._messageOrInteraction.editable && !this._isNeedMessageDelete) await this._messageOrInteraction.edit({ components: [] });	
		} else {
			await this._messageOrInteraction.editReply({ components: [] });
		}

		this._answer = interaction.values;

		this.emit('collect', this._answer);
		this._buttonCollector.stop();
		this._selectMenuCollector.stop();
	}

	private _onButtonCollect(interaction: ButtonInteraction): void {
		if (interaction.customId == 'left') this._selectMenuInteractionBuilder.currentMenuPage -= 1;
		else if (interaction.customId == 'right') this._selectMenuInteractionBuilder.currentMenuPage += 1;

		interaction.update({ components: this._selectMenuInteractionBuilder.components });
	}
}

class SelectMenuInteractionBuilder<T extends TPaginationSelectMenuOptions> {
	private _options: TPaginationSelectMenuOptions;
	private _selectMenuBuilder = new ActionRowBuilder<StringSelectMenuBuilder>();
	private _buttonBuilder = new ActionRowBuilder<ButtonBuilder>();
	private _currentMenuPage: number = 1;
	private _pagesCount: number;
	private _selectMenuOptions: IPaginationSelectMenuSettings | undefined;
	private _language: ELocalizationsLanguages;

	public get components(): Array<ActionRowBuilder<MessageActionRowComponentBuilder>> {
		if (this._pagesCount > 1) return [this._selectMenuBuilder, this._buttonBuilder];
		else return [this._selectMenuBuilder];
	}

	public get currentMenuPage(): number {
		return this._currentMenuPage;
	}

	public set currentMenuPage(number: number) {
		this._currentMenuPage = (number <= this._pagesCount ? (number >= 1 ? number : 1) : this._pagesCount);
		this._createButtons();
		this._updateOptionsInSelectMenu();
	}

	public get pagesCount(): number {
		return this._pagesCount;
	}

	constructor(options: T) {
		this._pagesCount = 0;
		this._options = options;
		this._selectMenuOptions = options?.selectMenuOptions;
		this._language = (options.isLocalizationRequer ? options.language : DEFAULT_SERVER_LANGUAGE);

		this._updatePagesCount();
		this._createButtons();
		this._updateOptionsInSelectMenu();
	}

	private _updatePagesCount(): void {
		this._pagesCount = Math.floor(this._options.choices.length / 25) + 1;
		this._createButtons();
	}

	private _createButtons(): void {
		this._buttonBuilder = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId('left')
				.setLabel('<')
				.setStyle(ButtonStyle.Primary)
				.setDisabled(this._currentMenuPage == 1),
			new ButtonBuilder()
				.setCustomId('pages')
				.setLabel(`${this._currentMenuPage}/${this._pagesCount}`)
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(true),
			new ButtonBuilder()
				.setCustomId('right')
				.setLabel('>')
				.setStyle(ButtonStyle.Primary)
				.setDisabled(this._currentMenuPage >= this._pagesCount),
		)
	}

	public addOptions(options: T['choices']): this {
		this._options.choices = [...this._options.choices, ...options] as unknown as T['choices'];
		this._updatePagesCount();
		this._updateOptionsInSelectMenu();

		return this;
	}

	public addOption(option: ValueOf<T['choices']>): this {
		this._options.choices = [...this._options.choices, option] as unknown as T['choices'];
		this._updatePagesCount();
		this._updateOptionsInSelectMenu();

		return this;
	}

	private _updateOptionsInSelectMenu(): void {
		const selectMenu = new StringSelectMenuBuilder(this._selectMenuOptions)
		const options: Array<APISelectMenuOption> = (
			this._options.isLocalizationRequer ?
			(this._options.choices.length > 25 ? this._options.choices.slice(25 * (this._currentMenuPage-1), 25 * this._currentMenuPage) : this._options.choices).map((option) => ({
				label: getLocalizationForText(option.label, this._language),
				value: option.value,
				default: option.default,
				description: (option.description ? getLocalizationForText(option.description, this._language) : undefined),
				emoji: option.emoji
			})) :
			this._options.choices
		);
		selectMenu
			.setCustomId('selectmenu')
			.addOptions(...options)

		this._selectMenuBuilder = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
	}
}

interface IPaginationSelectMenuSettings {
	min_values?: Partial<APIStringSelectComponent>['min_values'];
	max_values?: Partial<APIStringSelectComponent>['max_values'];
	placeholder?: Partial<APIStringSelectComponent>['placeholder'];
}

type TPaginationSelectMenuOptions = IPaginationSelectMenuDefaultOptions | IPaginationSelectMenuWithLocalizationOptions;

interface IPaginationSelectMenuDefaultOptions {
	isLocalizationRequer: false;
	choices: Array<APISelectMenuOption>
	selectMenuOptions?: IPaginationSelectMenuSettings
}

interface IPaginationSelectMenuWithLocalizationOptions {
	isLocalizationRequer: true;
	choices: TSelectMenuOptionsWithLocalizations,
	language: ELocalizationsLanguages,
	selectMenuOptions?: IPaginationSelectMenuSettings
}
