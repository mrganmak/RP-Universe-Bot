import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CategoryChannel, ChannelSelectMenuBuilder, ChannelType, CommandInteraction, ComponentType, GuildChannel, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { EmbedBuilder } from "@discordjs/builders";
import { TextsLocalizationsIds, getLocalizationForText, getGuildLanguage } from "../../../index.js";

export class TicketsCommndInteractions {
	public static async getAllTicketsSettings(interaction: CommandInteraction): Promise<TicketsSettings> {
		if (!interaction.guild?.id) throw new Error('This no guild in this interaction');

		const category = await TicketsCommndInteractions.getSetedCategoryForTickets(interaction);
		const channel = await TicketsCommndInteractions.getSetedChannelForTickets(interaction);
		const messageSettings = await TicketsCommndInteractions.getSettingsForTicketsMessage(interaction);

		return {
			category,
			channel,
			messageSettings
		};
	}

	public static async getSetedCategoryForTickets(interaction: CommandInteraction): Promise<CategoryChannel> {
		if (!interaction.guild?.id) throw new Error('This no guild in this interaction');

		const guildLanguage = await getGuildLanguage(interaction.guild.id);

		const changeCategoryEmbed = new EmbedBuilder();
		changeCategoryEmbed
			.setTitle(getLocalizationForText(TextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_EMBED_LABLE, guildLanguage))
			.setDescription(getLocalizationForText(TextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_EMBED_DESCRIPTION, guildLanguage));
		const categorySelectMenu = new ChannelSelectMenuBuilder().setChannelTypes(ChannelType.GuildCategory).setCustomId('selectmenu');
		await interaction.editReply({ embeds: [changeCategoryEmbed], components: [new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(categorySelectMenu)] });

		const message = await interaction.fetchReply();
		const categoryComponent = await message.awaitMessageComponent({ componentType: ComponentType.ChannelSelect });
		await categoryComponent.update({ components: [] });

		const category = categoryComponent.channels.first();
		if (!category) throw new Error('Something went wrong in getSetedCategoryForTickets');

		return category as CategoryChannel;
	}

	public static async getSetedChannelForTickets(interaction: CommandInteraction): Promise<GuildChannel> {
		if (!interaction.guild?.id) throw new Error('This no guild in this interaction');

		const guildLanguage = await getGuildLanguage(interaction.guild.id);

		const changeChannelEmbed = new EmbedBuilder();
		changeChannelEmbed
			.setTitle(getLocalizationForText(TextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CHANNEL_EMBED_LABLE, guildLanguage))
			.setDescription(getLocalizationForText(TextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CHANNEL_EMBED_DESCRIPTION, guildLanguage));
		const channelSelectMenu = new ChannelSelectMenuBuilder().setChannelTypes(ChannelType.GuildText).setCustomId('selectmenu');
		await interaction.editReply({ embeds: [changeChannelEmbed], components: [new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(channelSelectMenu)] });

		const message = await interaction.fetchReply();
		const channelComponent = await message.awaitMessageComponent({ componentType: ComponentType.ChannelSelect });
		await channelComponent.update({ components: [] });

		const channel = channelComponent.channels.first();
		if (!channel) throw new Error('Something went wrong in getSetedChannelForTickets');

		return channel as GuildChannel;
	}

	public static async getSettingsForTicketsMessage(interaction: CommandInteraction): Promise<TicketsMessageSettings> {
		if (!interaction.guild?.id) throw new Error('This no guild in this interaction');

		const guildLanguage = await getGuildLanguage(interaction.guild.id);

		const messageEmbed = new EmbedBuilder();
		messageEmbed
			.setTitle('Отправить сообщение')
			.setDescription('Нажмите снизу, чтобы отправить сообщение в канал для тикетов');
		const sendMessageButton = new ButtonBuilder().setLabel('Отправить').setCustomId('selectmenu').setStyle(ButtonStyle.Success);
		await interaction.editReply({ embeds: [messageEmbed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(sendMessageButton)] });

		const message = await interaction.fetchReply();
		const messageComponent = await message.awaitMessageComponent({ componentType: ComponentType.Button });

		const messageSettings: TicketsMessageSettings = {
			title: getLocalizationForText(TextsLocalizationsIds.TICKETS_DEFAULT_TICKET_MESSAGE_TITLE_TEXT, guildLanguage),
			description: getLocalizationForText(TextsLocalizationsIds.TICKETS_DEFAULT_TICKET_MESSAGE_DESCRIPTION_TEXT, guildLanguage),
			buttonText: getLocalizationForText(TextsLocalizationsIds.TICKETS_DEFAULT_TICKET_MESSAGE_BUTTON_TEXT, guildLanguage)
		}

		const modal = new ModalBuilder()
		modal
			.setCustomId('modal')
			.setComponents(
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setLabel(getLocalizationForText(TextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_TICKET_MESSAGE_TITLE_TEXT, guildLanguage))
						.setCustomId('title')
						.setRequired(false)
						.setStyle(TextInputStyle.Short)
				),
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setLabel(getLocalizationForText(TextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_TICKET_MESSAGE_DESCRIPTION_TEXT, guildLanguage))
						.setCustomId('description')
						.setRequired(false)
						.setStyle(TextInputStyle.Paragraph)
				),
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setLabel(getLocalizationForText(TextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_TICKET_MESSAGE_BUTTON_TEXT, guildLanguage))
						.setCustomId('button')
						.setRequired(false)
						.setStyle(TextInputStyle.Short)
				),
			)
			.setTitle('Test modal');

		await messageComponent.showModal(modal);
		const modalSubmit = await messageComponent.awaitModalSubmit({ time: 10*60*1000 }).catch((error) => { throw error; });

		const titleField = modalSubmit.fields.getField('title');
		const descriptionField = modalSubmit.fields.getField('description');
		const buttonTextField = modalSubmit.fields.getField('button');
		if (!modalSubmit.isFromMessage()) throw new Error('Something went wrong with modal in getTextForTicketsMessage');
		
		await modalSubmit.update({ components: [] });

		messageSettings.title = (
			titleField.type === ComponentType.TextInput
			? (
				titleField.value.length > 0
				? titleField.value
				: null
			)
			: null
		) ?? messageSettings.title;
		messageSettings.description = (
			descriptionField.type === ComponentType.TextInput
			? (
				descriptionField.value.length > 0
				? descriptionField.value
				: null
			)
			: null
		) ?? messageSettings.description;
		messageSettings.buttonText = (
			buttonTextField.type === ComponentType.TextInput
			? (
				buttonTextField.value.length > 0
				? buttonTextField.value
				: null
			)
			: null
		) ?? messageSettings.buttonText;

		return messageSettings;
	}
}

interface TicketsSettings {
	category: CategoryChannel,
	channel: GuildChannel,
	messageSettings: TicketsMessageSettings
}

interface TicketsMessageSettings {
	title: string,
	description: string,
	buttonText: string
}
