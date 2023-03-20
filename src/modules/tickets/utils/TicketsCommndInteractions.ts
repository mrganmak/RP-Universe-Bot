import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CategoryChannel, ChannelSelectMenuBuilder, ChannelType, CommandInteraction, ComponentType, GuildChannel, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { EmbedBuilder } from "@discordjs/builders";
import { TextsLocalizationsIds, getLocalizationForText, getGuildLanguage } from "../../../index.js";

export class TicketsCommndInteractions {
	public static async getSetedCategoryForTickets(interaction: CommandInteraction): Promise<CategoryChannel> {
		if (!interaction.guild?.id) throw new Error('This no guild in this interaction');

		const replyFunction = (interaction.replied || interaction.deferred ? interaction.editReply : interaction.reply).bind(interaction);
		const guildLanguage = await getGuildLanguage(interaction.guild.id);

		const changeCategoryEmbed = new EmbedBuilder();
		changeCategoryEmbed
			.setTitle(getLocalizationForText(TextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_EMBED_LABLE, guildLanguage))
			.setDescription(getLocalizationForText(TextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_EMBED_DESCRIPTION, guildLanguage));
		const categorySelectMenu = new ChannelSelectMenuBuilder().setChannelTypes(ChannelType.GuildCategory).setCustomId('selectmenu');
		await replyFunction({ embeds: [changeCategoryEmbed], components: [new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(categorySelectMenu)], ephemeral: true });

		const message = await interaction.fetchReply();
		const categoryComponent = await message.awaitMessageComponent({ componentType: ComponentType.ChannelSelect });
		await categoryComponent.update({ components: [] });
		const category = categoryComponent.channels.first();
		if (!category) throw new Error('Something went wrong in getSetedCategoryForTickets');

		return category as CategoryChannel;
	}

	public static async getSetedChannelForTickets(interaction: CommandInteraction): Promise<GuildChannel> {
		if (!interaction.guild?.id) throw new Error('This no guild in this interaction');

		const replyFunction = (interaction.replied || interaction.deferred ? interaction.editReply : interaction.reply).bind(interaction);
		const guildLanguage = await getGuildLanguage(interaction.guild.id);

		const changeChannelEmbed = new EmbedBuilder();
		changeChannelEmbed
			.setTitle(getLocalizationForText(TextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CHANNEL_EMBED_LABLE, guildLanguage))
			.setDescription(getLocalizationForText(TextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CHANNEL_EMBED_DESCRIPTION, guildLanguage));
		const channelSelectMenu = new ChannelSelectMenuBuilder().setChannelTypes(ChannelType.GuildText).setCustomId('selectmenu');
		await replyFunction({ embeds: [changeChannelEmbed], components: [new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(channelSelectMenu)], ephemeral: true });

		const message = await interaction.fetchReply();
		const channelComponent = await message.awaitMessageComponent({ componentType: ComponentType.ChannelSelect });
		await channelComponent.update({ components: [] });
		const channel = channelComponent.channels.first();
		if (!channel) throw new Error('Something went wrong in getSetedChannelForTickets');

		return channel as GuildChannel;
	}

	public static async getTextForTicketsMessage(interaction: CommandInteraction): Promise<string> {
		if (!interaction.guild?.id) throw new Error('This no guild in this interaction');

		const replyFunction = (interaction.replied || interaction.deferred ? interaction.editReply : interaction.reply).bind(interaction);
		const guildLanguage = await getGuildLanguage(interaction.guild.id);

		const messageEmbed = new EmbedBuilder();
		messageEmbed
			.setTitle('Отправить сообщение')
			.setDescription('Нажмите снизу, чтобы отправить сообщение в канал для тикетов');
		const sendMessageButton = new ButtonBuilder().setLabel('Отправить').setCustomId('selectmenu').setStyle(ButtonStyle.Success);
		await replyFunction({ embeds: [messageEmbed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(sendMessageButton)], ephemeral: true });

		const message = await interaction.fetchReply();
		const messageComponent = await message.awaitMessageComponent({ componentType: ComponentType.Button });

		const modal = new ModalBuilder()
		modal
			.setCustomId('modal')
			.setComponents(
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setLabel('test1')
						.setCustomId('test')
						.setRequired(true)
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder('testatsatastsa')
				),
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setLabel('test2')
						.setCustomId('test2')
						.setRequired(true)
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('testatsatastsa')
						.setMaxLength(25)
				)
			)
			.setTitle('Test modal')

		await messageComponent.showModal(modal);
		const modalSubmit = await messageComponent.awaitModalSubmit({ time: 10*60*1000 }).catch((error) => { throw error; });
		const testField = modalSubmit.fields.getField('test');
		const text = (testField.type === ComponentType.TextInput ? testField.value : '');
		if (!modalSubmit.isFromMessage()) throw new Error('Something went wrong with modal in getTextForTicketsMessage');
		await modalSubmit.update({ components: [] });

		return text;
	}
}
