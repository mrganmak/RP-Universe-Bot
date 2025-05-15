import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, Collection, CollectorFilter, ComponentEmojiResolvable, ComponentType, GuildMember, InteractionCollector, Message, Snowflake } from "discord.js";
import {getLocalizationForText, buttonsPanelsSettings, ButtosPanelsSettingsIds, LocalizationsLanguages, TextsLocalizationsIds, Util } from "../../index.js";
import EventEmitter from "events";

class ButtonsPanel extends EventEmitter {
	public static createButtons(
		buttons: ButtonsPanelButtonsCategorys,
		language: LocalizationsLanguages,
		categoryName: string = 'begin'
	): ActionRowBuilder<ButtonBuilder> {
		const row = new ActionRowBuilder<ButtonBuilder>();

		for (const [id, button] of Object.entries(buttons[categoryName])) {
			const buttonComponent = new ButtonBuilder()
			buttonComponent
				.setCustomId(id)
				.setLabel(getLocalizationForText(button.label, language))
				.setStyle(button.style);

			if (button.emoji) buttonComponent.setEmoji(button.emoji);

			row.addComponents(buttonComponent);
		}

		return row;
	}

	private _collector: InteractionCollector<ButtonInteraction> | null = null;

	constructor(
		private _message: Message,
		private _settings: ButtonsPanelSettings,
		private _language: LocalizationsLanguages,
		private _categoryName: string = 'begin'
	) {
		super();

		if (this._settings.isWithCollector) {
			this._collector = this._message.createMessageComponentCollector({ componentType: ComponentType.Button, filter: this._settings.filter });
			this._collector.on('collect', ((interaction) => {
				this.onCollect(interaction);
			}));
		}
	}

	public get ended(): boolean | undefined {
		return (this._collector?.ended ?? undefined);
	}

	public get categoryName(): string {
		return this._categoryName;
	}

	public close(): void {
		this._message.edit({ components: [] });
		this._collector?.stop();
	}

	public setCategory(categoryName: string): Promise<void> {
		return this._changeCategory(categoryName);
	}

	public async onCollect(interaction: ButtonInteraction): Promise<string | undefined> {
		const collectedButton = this._settings.buttons[this._categoryName][Number(interaction.id)];

		if (
			collectedButton.necessaryRoles
			&& !(await this._hasMemberHaveRoles(interaction, collectedButton.necessaryRoles))) 
		{
			interaction.reply({
				ephemeral: true,
				content: getLocalizationForText(TextsLocalizationsIds.DONT_HAVE_ROLE_TO_USE_THIS, this._language)
			});
			return;
		}

		await interaction.deferUpdate();

		switch (collectedButton.type) {
			case 'category':
				await this._changeCategory(collectedButton.category);

				break;
			case 'value':
				this.emit('collect', collectedButton.value);

				break;
			case 'valueAndCategory':
				await this._changeCategory(collectedButton.category);
				this.emit('collect', collectedButton.value);

				break;
			default:
				this._handleError(collectedButton);
		}

		if (collectedButton.isClose) this.close();

		return (collectedButton.type !== 'category' ? collectedButton.value : undefined);
	}

	private async _hasMemberHaveRoles(interaction: ButtonInteraction, necessaryRoles: Snowflake[]): Promise<boolean> {
		if (!(interaction.member instanceof GuildMember)) return false;

		return Util.hasMemberHaveRoles(interaction.member, necessaryRoles);
	}

	private _handleError(error: never): void {
		console.log(`You forgot to indicate: ${error}`);
	}

	private async _changeCategory(categoryName: string): Promise<void> {
		if (!this._settings.buttons[categoryName]) throw new Error('Don\t have this category');

		this._categoryName = categoryName;

		await this._message.edit({ components: [this._createButtons()] });
	}

	private _createButtons(): ActionRowBuilder<ButtonBuilder> {
		return ButtonsPanel.createButtons(this._settings.buttons, this._language, this._categoryName)
	}
}

export type { ButtonsPanel }

export async function createButtonsPanel(message: Message, panelName: ButtosPanelsSettingsIds, language: LocalizationsLanguages): Promise<ButtonsPanel> {
	const settings = buttonsPanelsSettings[panelName];

	await message.edit({ components: [ButtonsPanel.createButtons(settings.buttons, language)] });

	return new ButtonsPanel(message, settings, language);
}

export function getButtonsPanel(
	message: Message,
	panelName: ButtosPanelsSettingsIds,
	language: LocalizationsLanguages,
	categoryName: string
): ButtonsPanel {
	const settings = buttonsPanelsSettings[panelName];

	return new ButtonsPanel(message, settings, language, categoryName);
}

export type ButtonsPanelsSettings = Record<ButtosPanelsSettingsIds, ButtonsPanelSettings>;

export interface ButtonsPanelSettings {
	buttons: ButtonsPanelButtonsCategorys
	filter?: CollectorFilter<[ButtonInteraction<CacheType>, Collection<string, ButtonInteraction<CacheType>>]>;
	isWithCollector?: boolean
}

interface ButtonsPanelButtonsCategorys {
	[key: string]: ButtosPanelButtonsCategory;
}

interface ButtosPanelButtonsCategory {
	[key: string]: ButtosPanelButtonSettings;
}

type ButtosPanelButtonSettings = 
	ButtonsPanelButtonSettingsWithCategoryChange
	| ButtonsPanelButtonSettingsWithValueReturn
	| ButtonsPanelButtonSettingsWithValueReturnAndCategoryChange;

interface ButtonsPanelButtonSettingsDefault {
	label: TextsLocalizationsIds;
	style: ButtonStyle;
	isClose?: true;
	emoji?: ComponentEmojiResolvable;
	necessaryRoles?: Snowflake[];
}

interface ButtonsPanelButtonSettingsWithCategoryChange extends ButtonsPanelButtonSettingsDefault {
	type: 'category'
	category: string;
}

interface ButtonsPanelButtonSettingsWithValueReturn extends ButtonsPanelButtonSettingsDefault {
	type: 'value';
	value: string;
}


interface ButtonsPanelButtonSettingsWithValueReturnAndCategoryChange extends ButtonsPanelButtonSettingsDefault {
	type: 'valueAndCategory';
	value: string;
	category: string;
}
