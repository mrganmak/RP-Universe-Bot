import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, Collection, CollectorFilter, CommandInteraction, ComponentEmojiResolvable, ComponentType, InteractionCollector, Message } from "discord.js";
import ETextsLocalizationsIds from "../../localizations/texts/types/ETextsLocalizationsIds.js"
import { EButtosPanelSSettingsIds, ELocalizationsLanguages } from "../../enum.js";
import { buttonsPanelsSettings } from "../../config.js";
import { getLocalizationForText } from "../../localizations/texts/index.js";
import EventEmitter from "events";

class ButtonsPanel extends EventEmitter {
	private _message: Message;
	private _settings: IButtonsPanelSettings;
	private _collector: InteractionCollector<ButtonInteraction>;
	private _categoryName: string = 'begin';
	private _language: ELocalizationsLanguages;

	constructor(message: Message, settings: IButtonsPanelSettings, language: ELocalizationsLanguages) {
		super();

		this._message = message;
		this._settings = settings;
		this._language = language;

		this._message.edit({ components: [this._createButtons()] });
		this._collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, filter: settings.filter });
		this._collector.on('collect', this._onCollect);
	}

	public async close(): Promise<void> {
		this._message.edit({ components: [] });
		this._collector.stop();
	}

	public get ended(): boolean {
		return this._collector.ended;
	}

	private _createButtons(): ActionRowBuilder<ButtonBuilder> {
		const row = new ActionRowBuilder<ButtonBuilder>();

		for (const [id, button] of Object.entries(this._settings.buttons[this._categoryName])) {
			const buttonComponent = new ButtonBuilder()
			buttonComponent
				.setCustomId(id)
				.setLabel(getLocalizationForText(button.label, this._language))
				.setStyle(button.style)

			if (button.emoji) buttonComponent.setEmoji(button.emoji);

			row.addComponents(buttonComponent);
		}

		return row;
	}

	private async _onCollect(interaction: ButtonInteraction) {
		const collectedButton = this._settings.buttons[this._categoryName][Number(interaction.id)];

		if (collectedButton.type == 'category') {
			this._categoryName = collectedButton.category;

			await interaction.update({ components: [this._createButtons()] });
		} else if (collectedButton.type == 'value') {
			await interaction.deferUpdate();
			this.emit('collect', collectedButton.value);
		}

		if (collectedButton.isClose) this.close();
	}
}

async function createButtonsPanel(message: Message, panelName: EButtosPanelSSettingsIds, language: ELocalizationsLanguages): Promise<ButtonsPanel> {
	const settings = buttonsPanelsSettings[panelName];

	return new ButtonsPanel(message, settings, language);
}

export default createButtonsPanel;

export type TButtonsPanelsSettings = {
	[key in EButtosPanelSSettingsIds]: IButtonsPanelSettings;
}

export interface IButtonsPanelSettings {
	buttons: IButtonsPanelButtonsCategorys
	filter?: CollectorFilter<[ButtonInteraction<CacheType>, Collection<string, ButtonInteraction<CacheType>>]>;
}

interface IButtonsPanelButtonsCategorys {
	[key: string]: IButtosPanelButtonsCategory
}

type IButtosPanelButtonsCategory = Array<IButtosPanelButtonSettings>;
type IButtosPanelButtonSettings = IButtonsPanelButtonSettingsWithCategoryChange | IButtonsPanelButtonSettingsWithValueReturn;

interface IButtonsPanelButtonSettingsDefault {
	label: ETextsLocalizationsIds;
	style: ButtonStyle;
	isClose?: true;
	emoji?: ComponentEmojiResolvable;
}

interface IButtonsPanelButtonSettingsWithCategoryChange extends IButtonsPanelButtonSettingsDefault {
	type: 'category'
	category: string;
}

interface IButtonsPanelButtonSettingsWithValueReturn extends IButtonsPanelButtonSettingsDefault {
	type: 'value';
	value: string;
}

