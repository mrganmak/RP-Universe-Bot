import { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, CommandInteraction, ComponentType, EmbedBuilder, ModalBuilder, PermissionsBitField, TextInputBuilder, TextInputStyle } from "discord.js";
import { Discord, Slash } from "discordx";
import { ECommandsCategirysIds, ECommandsIds, ELocalizationsLanguages } from "../enum.js";
import { getAllLocalizationsForCommandProperty, getLocalizationForCommand } from "../localizations/commands/index.js";
import { Category } from "@discordx/utilities";
import GuildsModulesBase from "../Databases/bases_list/GuildsModulesBase.js";
import CommandsIniter from "../utils/CommandsIniter.js";
import { getLocalizationForText } from "../localizations/texts/index.js";
import ETextsLocalizationsIds from "../localizations/texts/types/ETextsLocalizationsIds.js";
import { getGuildLanguage } from "../localizations/index.js";

const { name, description } = getLocalizationForCommand(ECommandsIds.START_TICKETS, ELocalizationsLanguages.EN);

@Discord()
@Category(ECommandsCategirysIds.ONLY_WITH_TICKETS_NOT_INITED)
class StartTicketsCommand {
	@Slash({
		name,
		description,
		nameLocalizations: getAllLocalizationsForCommandProperty(ECommandsIds.START_TICKETS, 'name', [ELocalizationsLanguages.EN]),
		descriptionLocalizations: getAllLocalizationsForCommandProperty(ECommandsIds.START_TICKETS, 'description', [ELocalizationsLanguages.EN]),
		defaultMemberPermissions: PermissionsBitField.Flags.Administrator
	})
	async test(interaction: CommandInteraction) {
		if (!interaction.guild) return;
		const guildLanguage = await getGuildLanguage(interaction.guild.id);

		const changeCategoryEmbed = new EmbedBuilder();
		changeCategoryEmbed
			.setTitle(getLocalizationForText(ETextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_EMBED_LABLE, guildLanguage))
			.setDescription(getLocalizationForText(ETextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_EMBED_DESCRIPTION, guildLanguage));
		const categorySelectMenu = new ChannelSelectMenuBuilder().setChannelTypes(ChannelType.GuildCategory).setCustomId('selectmenu');
		await interaction.reply({ embeds: [changeCategoryEmbed], components: [new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(categorySelectMenu)], ephemeral: true });

		const message = await interaction.fetchReply();
		const categoryComponent = await message.awaitMessageComponent({ componentType: ComponentType.ChannelSelect });
		await categoryComponent.update({ components: [] });

		const category = categoryComponent.channels.first(); //TODO: BD;

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
		CommandsIniter.changeCommandsForGuild(interaction.guild.id);
	}
}
