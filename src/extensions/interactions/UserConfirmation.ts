import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, RepliableInteraction, ComponentType, InteractionCollector, Message, MessageComponentCollectorOptions, StageChannel, TextBasedChannel, User, BaseInteraction, EmbedBuilder } from "discord.js";
import { TextsLocalizationsIds, getLocalizationForText, DEFAULT_SERVER_LANGUAGE, LocalizationsLanguages, userConfirmationInteractionButtonsSettings } from "../../index.js";

class UserConfirmation {
	public static async create(data: User | TextBasedChannel | Message | RepliableInteraction, options: UserConfirmationInteractionOptions, isNeedToEdit: boolean = true): Promise<UserConfirmation> {
		if (data instanceof User) {
			const dmMessage = await data.send({
				content: options.content,
				embeds: options.embeds ?? [],
				components: [this._createButtons(options.language ?? DEFAULT_SERVER_LANGUAGE, options)]
			}).catch(console.error);
			if (!dmMessage) throw new Error('Can\'t send message to this user');

			return new this(dmMessage, options);
		} else if (data instanceof Message) {
			await data.fetch();
			if (isNeedToEdit) await data.edit({ components: [this._createButtons(options.language ?? DEFAULT_SERVER_LANGUAGE, options)] });

			return new this(data, options);
		} else if (data instanceof BaseInteraction) {
			if (isNeedToEdit) {
				if (data.replied || data.deferred) await data.editReply({
					content: options.content,
					embeds: options.embeds ?? [],
					components: [this._createButtons(options.language ?? DEFAULT_SERVER_LANGUAGE, options)]
				});
				else await data.reply({
					content: options.content,
					embeds: options.embeds ?? [], 
					components: [this._createButtons(options.language ?? DEFAULT_SERVER_LANGUAGE, options)]
				});	
			}
			const interactionMessage = await data.fetchReply();

			return new this(data, options, interactionMessage);
		} else {
			if (data instanceof StageChannel) throw new Error('Can\'t send message to stage channel');
			const message = await data.send({
				content: options.content,
				embeds: options.embeds ?? [],
				components: [this._createButtons(options.language ?? DEFAULT_SERVER_LANGUAGE, options)]
			}).catch(console.error);
			if (!message) throw new Error('Something went wrong');

			return new this(message, options);
		}
	}

	private static _createButtons(language: LocalizationsLanguages, options: UserConfirmationInteractionOptions): ActionRowBuilder<ButtonBuilder> {
		const row = new ActionRowBuilder<ButtonBuilder>();

		for (const buttonSettings of Object.values(userConfirmationInteractionButtonsSettings)) {
			const button = new ButtonBuilder();
			button
				.setCustomId(buttonSettings.customId)
				.setLabel(getLocalizationForText(
					(options.labels ? options.labels[buttonSettings.customId] : buttonSettings.label),
					language
				))
				.setStyle(buttonSettings.style);
			row.addComponents(button);
		}

		return row;
	}

	private _messageOrInteraction: Message | RepliableInteraction;
	private _answer: UserConfirmationsAnswers | null = null;
	private _buttonCollector: InteractionCollector<ButtonInteraction>;

	private constructor(message: Message, options: UserConfirmationInteractionOptions)
	private constructor(interaction: RepliableInteraction, options: UserConfirmationInteractionOptions, interactionMessage: Message)
	private constructor(messageOrInteraction: Message | RepliableInteraction, options: UserConfirmationInteractionOptions, interactionMessage?: Message) {
		this._messageOrInteraction = messageOrInteraction;

		const message = ((messageOrInteraction instanceof Message) ? messageOrInteraction : interactionMessage) as Message;
		this._buttonCollector = message.createMessageComponentCollector({ componentType: ComponentType.Button, filter: options.filter, time: options.time, idle: 60*60*1000 });
		this._buttonCollector.on('collect', (interaction) => (this._onCollect(interaction)));
	}

	public getUserAnswer(): Promise<UserConfirmationsAnswers> {
		return new Promise((resolve) => {
			if (this._answer) return resolve(this._answer);
			this._buttonCollector.on('collect', (interaction) => (resolve(interaction.customId === 'confirm' ? 'confirm' : 'deny')));
			this._buttonCollector.on('end', () => {
				if (!this._answer) resolve('deny');
			});
		});
	}

	private _onCollect(interaction: ButtonInteraction) {
		interaction.deferUpdate();
		this._answer = (interaction.customId === 'confirm' ? 'confirm' : 'deny');
		this._buttonCollector.stop();

		if ((this._messageOrInteraction instanceof Message) && this._messageOrInteraction.deletable) {
			this._messageOrInteraction.delete()
		} else {
			if (this._messageOrInteraction instanceof Message) this._messageOrInteraction.edit({ components: [] });
			else this._messageOrInteraction.editReply({ components: [] });
		}
	}
}

export async function getUserConfirmation(user: User, options: UserConfirmationInteractionOptions): Promise<UserConfirmationsAnswers>;
export async function getUserConfirmation(channel: TextBasedChannel, options: UserConfirmationInteractionOptions): Promise<UserConfirmationsAnswers>;
export async function getUserConfirmation(message: Message, options: UserConfirmationInteractionOptions, isNeedToEdit?: boolean): Promise<UserConfirmationsAnswers>;
export async function getUserConfirmation(interaction: RepliableInteraction, options: UserConfirmationInteractionOptions, isNeedToEdit?: boolean): Promise<UserConfirmationsAnswers>;
export async function getUserConfirmation(data: User | TextBasedChannel | Message | RepliableInteraction, options: UserConfirmationInteractionOptions, isNeedToEdit?: boolean): Promise<UserConfirmationsAnswers> {
	const userConfirmation = await UserConfirmation.create(data, options, isNeedToEdit);

	return await userConfirmation.getUserAnswer();
}

export type UserConfirmationsAnswers = 'confirm' | 'deny';
export type UserConfirmationInteractionButtonsSettings = {
	[key in UserConfirmationsAnswers]: UserConfirmationInteractionButtonSettings
}
export interface UserConfirmationInteractionButtonSettings {
	label: TextsLocalizationsIds;
	style: ButtonStyle;
	customId: UserConfirmationsAnswers;
}

interface UserConfirmationInteractionOptions extends MessageComponentCollectorOptions<ButtonInteraction> {
	content?: string;
	language?: LocalizationsLanguages;
	labels?: UserConfirmationButtonsLabels;
	embeds?: EmbedBuilder[];
}

export type UserConfirmationButtonsLabels = Record<UserConfirmationsAnswers, TextsLocalizationsIds>;
