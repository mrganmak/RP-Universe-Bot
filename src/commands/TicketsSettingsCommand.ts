import { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, CommandInteraction, ComponentType, EmbedBuilder } from "discord.js";
import { Discord, Slash } from "discordx";
import { ECommandsIds, ELocalizationsLanguages } from "../enum.js";
import { getAllLocalizationsForCommandProperty, getLocalizationForCommand } from "../localizations/commands/index.js";
import { getGuildLanguage } from "../localizations/index.js";
import { getLocalizationForText } from "../localizations/texts/index.js";
import ETextsLocalizationsIds from "../localizations/texts/types/ETextsLocalizationsIds.js";
import PaginationSelectMenu from "../modules/paginations/PaginationSelectMenu.js";
import { ticketsSettingsSelectMenuComponents } from "../config.js";
import getUserConfirmation from "../modules/interactions/UserConfirmation.js";

const { name, description } = getLocalizationForCommand(ECommandsIds.TICKETS_SETTINGS, ELocalizationsLanguages.EN);

@Discord()
class TicketsSettingsCommand {
	@Slash({
		name,
		description,
		nameLocalizations: getAllLocalizationsForCommandProperty(ECommandsIds.TICKETS_SETTINGS, 'name', [ELocalizationsLanguages.EN]),
		descriptionLocalizations: getAllLocalizationsForCommandProperty(ECommandsIds.TICKETS_SETTINGS, 'description', [ELocalizationsLanguages.EN]),
		dmPermission: false
	})
	async ticketSettings(interaction: CommandInteraction) {
		if (!interaction.guild) return;
		if (!interaction.replied && !interaction.deferred) await interaction.deferReply({ ephemeral: true });
		const guildLanguage = await getGuildLanguage(interaction.guild.id);

		const embed = new EmbedBuilder();
		embed
			.setTitle(getLocalizationForText(ETextsLocalizationsIds.TICKETS_SETTINGS_EMBED_LABLE, guildLanguage))
			.setDescription(getLocalizationForText(ETextsLocalizationsIds.TICKETS_SETTINGS_EMBED_DESCRIPTION, guildLanguage))

		await interaction.editReply({ embeds: [embed], content: '' });

		const paginationSelectMenu = await PaginationSelectMenu.create(interaction, interaction.user, ticketsSettingsSelectMenuComponents, guildLanguage, {});
		const answer = await paginationSelectMenu.getUserAnswer();
		
		if (answer[0] == 'change_category') {
			const changeCateforyEmbed = new EmbedBuilder();
			changeCateforyEmbed
				.setTitle(getLocalizationForText(ETextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_EMBED_LABLE, guildLanguage))
				.setDescription(getLocalizationForText(ETextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_EMBED_DESCRIPTION, guildLanguage))
			const selectMenu = new ChannelSelectMenuBuilder().setChannelTypes(ChannelType.GuildCategory).setCustomId('selectmenu');
			interaction.editReply({ embeds: [changeCateforyEmbed], components: [new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(selectMenu)] });

			const message = await interaction.fetchReply();
			const component = await message.awaitMessageComponent({ componentType: ComponentType.ChannelSelect });
			await component.update({ embeds: [] });

			const category = component.channels.first(); //TODO: BD;
		}

		const isAnyChangeNeeded = await getUserConfirmation(
			interaction,
			{
				content: (
					getLocalizationForText(ETextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_IT_IS_DONE, guildLanguage) +
					' ' +
					getLocalizationForText(ETextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_IS_ANY_CHANGE_NEEDED, guildLanguage)
				),
				language: guildLanguage
			}
		);

		if (isAnyChangeNeeded == 'confirm') this.ticketSettings(interaction);
		else interaction.editReply({ content: getLocalizationForText(ETextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_IT_IS_DONE, guildLanguage), components: [] });
	}
}
