import { ActionRowBuilder, CategoryChannel, ChannelSelectMenuBuilder, ChannelType, CommandInteraction, ComponentType } from "discord.js";
import { getGuildLanguage } from "../../../localizations/index.js";
import { EmbedBuilder } from "@discordjs/builders";
import { getLocalizationForText } from "../../../localizations/texts/index.js";
import ETextsLocalizationsIds from "../../../localizations/texts/types/ETextsLocalizationsIds.js";

export default class TicketsCommndInteractions {
	public static async setCategoryForTickets(interaction: CommandInteraction): Promise<CategoryChannel> {
		if (!interaction.guild?.id) throw new Error('This no guild in this interaction');

		const replyFunction = (interaction.replied || interaction.deferred ? interaction.editReply : interaction.reply);
		const guildLanguage = await getGuildLanguage(interaction.guild.id);

		const changeCategoryEmbed = new EmbedBuilder();
		changeCategoryEmbed
			.setTitle(getLocalizationForText(ETextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_EMBED_LABLE, guildLanguage))
			.setDescription(getLocalizationForText(ETextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_EMBED_DESCRIPTION, guildLanguage));
		const categorySelectMenu = new ChannelSelectMenuBuilder().setChannelTypes(ChannelType.GuildCategory).setCustomId('selectmenu');
		await replyFunction({ embeds: [changeCategoryEmbed], components: [new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(categorySelectMenu)], ephemeral: true });

		const message = await interaction.fetchReply();
		const categoryComponent = await message.awaitMessageComponent({ componentType: ComponentType.ChannelSelect });
		await categoryComponent.update({ components: [] });

		const category = categoryComponent.channels.first() as CategoryChannel;

		return category;
	}
}

/*if (!interaction.guild) return;
		const changeChannelEmbed = new EmbedBuilder();
		changeChannelEmbed
			.setTitle(getLocalizationForText(ETextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CHANNEL_EMBED_LABLE, guildLanguage))
			.setDescription(getLocalizationForText(ETextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CHANNEL_EMBED_DESCRIPTION, guildLanguage));
		const channelSelectMenu = new ChannelSelectMenuBuilder().setChannelTypes(ChannelType.GuildText).setCustomId('selectmenu2');
		await interaction.editReply({ embeds: [changeChannelEmbed], components: [new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(channelSelectMenu)] });

		const channelComponent = await message.awaitMessageComponent({ componentType: ComponentType.ChannelSelect });

		const channel = channelComponent.channels.first(); //TODO: BD;
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

		channelComponent.showModal(modal);
		const modalSubmit = await channelComponent.awaitModalSubmit({ time: 10*60*1000 });
		console.log(modalSubmit.fields.getField('test'));

		const modulesBase = new GuildsModulesBase();
		await modulesBase.changeModuleState(interaction.guild.id, 'isTicketsModuleInited', true);
		CommandsIniter.changeCommandsForGuild(interaction.guild.id);*/
