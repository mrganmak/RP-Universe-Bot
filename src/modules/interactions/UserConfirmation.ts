import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction, ComponentType, Interaction, InteractionCollector, Message, MessageComponentCollectorOptions, StageChannel, TextBasedChannel, User } from "discord.js";
import { userConfirmationInteractionButtonsSettings } from "../../config.js";
import { ELocalizationsLanguages } from "../../enum.js";
import { DEFAULT_SERVER_LANGUAGE } from "../../consts.js";
import { getLocalizationForText } from "../../localizations/texts/index.js";
import ETextsLocalizationsIds from "../../localizations/texts/types/ETextsLocalizationsIds.js";

class UserConfirmation {
	public static async create(data: User | TextBasedChannel | Message | CommandInteraction, options: IUserConfirmationInteractionOptions): Promise<UserConfirmation> {
		if (data instanceof User) {
			const dmMessage = await data.send({ content: options.content, components: [this._createButtons(options.language ?? DEFAULT_SERVER_LANGUAGE)]  }).catch(() => {});
			if (!dmMessage) throw new Error('Can\'t send message to this user');

			return new this(dmMessage, options);
		} else if (data instanceof Message) {
			await data.fetch();
			await data.edit({ components: [this._createButtons(options.language ?? DEFAULT_SERVER_LANGUAGE)] });

			return new this(data, options);
		} else if (data instanceof CommandInteraction) {
			if (data.replied || data.deferred) await data.editReply({ content: options.content, components: [this._createButtons(options.language ?? DEFAULT_SERVER_LANGUAGE)] });
			else await data.reply({ content: options.content, components: [this._createButtons(options.language ?? DEFAULT_SERVER_LANGUAGE)] });
			const interactionMessage = await data.fetchReply();

			return new this(data, options, interactionMessage);
		} else {
			if (data instanceof StageChannel) throw new Error('Can\'t send message to stage channel');
			const message = await data.send({ content: options.content, components: [this._createButtons(options.language ?? DEFAULT_SERVER_LANGUAGE)]  }).catch(() => {});
			if (!message) throw new Error('Something went wrong');

			return new this(message, options);
		}
	}

	private static _createButtons(language: ELocalizationsLanguages): ActionRowBuilder<ButtonBuilder> {
		const row = new ActionRowBuilder<ButtonBuilder>();

		for (const buttonSettings of userConfirmationInteractionButtonsSettings) {
			const button = new ButtonBuilder();
			button
				.setCustomId(buttonSettings.customId)
				.setLabel(getLocalizationForText(buttonSettings.label, language))
				.setStyle(buttonSettings.style);
			row.addComponents(button);
		}

		return row;
	}

	private _messageOrInteraction: Message | CommandInteraction;
	private _answer: TUserAnswers | null = null;
	private _buttonCollector!: InteractionCollector<ButtonInteraction>; 

	private constructor(message: Message, options: IUserConfirmationInteractionOptions)
	private constructor(interaction: CommandInteraction, options: IUserConfirmationInteractionOptions, interactionMessage: Message)
	private constructor(messageOrInteraction: Message | CommandInteraction, options: IUserConfirmationInteractionOptions, interactionMessage?: Message) {
		this._messageOrInteraction = messageOrInteraction;

		const message = ((messageOrInteraction instanceof Message) ? messageOrInteraction : interactionMessage) as Message;
		this._buttonCollector = message.createMessageComponentCollector({ componentType: ComponentType.Button, filter: options.filter, time: options.time });
		this._buttonCollector.on('collect', (interaction) => (this._onCollect(interaction)));
	}

	public getUserAnswer(): Promise<TUserAnswers> {
		return new Promise((resolve) => {
			if (this._answer) return resolve(this._answer);
			this._buttonCollector.on('collect', (interaction) => (resolve(interaction.customId == 'confirm' ? 'confirm' : 'deny')));
			this._buttonCollector.on('end', () => {
				if (!this._answer) resolve('deny');
			});
		});
	}

	private _onCollect(interaction: ButtonInteraction) {
		this._answer = (interaction.customId == 'confirm' ? 'confirm' : 'deny');
		this._buttonCollector.stop();

		if ((this._messageOrInteraction instanceof Message) && this._messageOrInteraction.deletable) {
			this._messageOrInteraction.delete()
		} else {
			if (this._messageOrInteraction instanceof Message) this._messageOrInteraction.edit({ components: [] });
			else this._messageOrInteraction.editReply({ components: [] });
		}
	}
}

async function getUserConfirmation(user: User, options: IUserConfirmationInteractionOptions): Promise<TUserAnswers>;
async function getUserConfirmation(channel: TextBasedChannel, options: IUserConfirmationInteractionOptions): Promise<TUserAnswers>;
async function getUserConfirmation(message: Message, options: IUserConfirmationInteractionOptions): Promise<TUserAnswers>;
async function getUserConfirmation(interaction: CommandInteraction, options: IUserConfirmationInteractionOptions): Promise<TUserAnswers>;
async function getUserConfirmation(data: User | TextBasedChannel | Message | CommandInteraction, options: IUserConfirmationInteractionOptions): Promise<TUserAnswers> {
	const userConfirmation = await UserConfirmation.create(data, options);

	return await userConfirmation.getUserAnswer();
}

export default getUserConfirmation;

type TUserAnswers = 'confirm' | 'deny';
export interface IUserConfirmationInteractionButtonSettings {
	label: ETextsLocalizationsIds;
	style: ButtonStyle;
	customId: TUserAnswers;
}

interface IUserConfirmationInteractionOptions extends MessageComponentCollectorOptions<ButtonInteraction> {
	content: string;
	language?: ELocalizationsLanguages;
	labels?: TUserConfirmationButtonsLabels;
}

export type TUserConfirmationButtonsLabels = {
	[key in TUserAnswers]: ETextsLocalizationsIds;
}