import { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, ChatInputCommandInteraction, ComponentType, EmbedBuilder, PermissionsBitField } from "discord.js";
import { Discord, Slash } from "discordx";
import { Category } from "@discordx/utilities";
import {
	CommandsCategoriesIds,
	CommandsIds,
	LocalizationsLanguages,
	getAllLocalizationsForCommandProperty,
	getLocalizationForCommand,
	getGuildLanguage,
	getLocalizationForText,
	getUserConfirmation,
	TextsLocalizationsIds,
	PaginationSelectMenu,
	ticketsSettingsSelectMenuComponents
} from "../index.js";

const { name, description } = getLocalizationForCommand(CommandsIds.TICKETS_SETTINGS, LocalizationsLanguages.EN);

@Discord()
@Category(CommandsCategoriesIds.ONLY_WITH_TICKETS_INITED)
class TicketsSettingsCommand {
	@Slash({
		name,
		description,
		nameLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.TICKETS_SETTINGS, 'name', [LocalizationsLanguages.EN]),
		descriptionLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.TICKETS_SETTINGS, 'description', [LocalizationsLanguages.EN]),
		defaultMemberPermissions: PermissionsBitField.Flags.Administrator
	})
	async ticketSettings(interaction: ChatInputCommandInteraction) {
		if (!interaction.guild) return;
		if (!interaction.replied && !interaction.deferred) await interaction.deferReply({ ephemeral: true });
		const guildLanguage = await getGuildLanguage(interaction.guild.id);

		const embed = new EmbedBuilder();
		embed
			.setTitle(getLocalizationForText(TextsLocalizationsIds.TICKETS_SETTINGS_EMBED_LABLE, guildLanguage))
			.setDescription(getLocalizationForText(TextsLocalizationsIds.TICKETS_SETTINGS_EMBED_DESCRIPTION, guildLanguage))

		await interaction.editReply({ embeds: [embed], content: '' });

		const paginationSelectMenu = await PaginationSelectMenu.create(interaction, interaction.user, {
			isLocalizationRequer: true,
			choices: ticketsSettingsSelectMenuComponents,
			language: guildLanguage
		});
		const answerInteraction = (await paginationSelectMenu.getUserAnswer());
		if (!answerInteraction) return null; //TODO

		await answerInteraction.deferUpdate();
		const answer = answerInteraction.values[0];

		if (answer === 'change_category') {
			const changeCategoryEmbed = new EmbedBuilder();
			changeCategoryEmbed
				.setTitle(getLocalizationForText(TextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_EMBED_LABLE, guildLanguage))
				.setDescription(getLocalizationForText(TextsLocalizationsIds.TICKETS_SETTINGS_CHANGE_CATEGORY_EMBED_DESCRIPTION, guildLanguage))
			const selectMenu = new ChannelSelectMenuBuilder().setChannelTypes(ChannelType.GuildCategory).setCustomId('selectmenu');
			interaction.editReply({ embeds: [changeCategoryEmbed], components: [new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(selectMenu)] });

			const message = await interaction.fetchReply();
			const component = await message.awaitMessageComponent({ componentType: ComponentType.ChannelSelect });
			await component.update({ embeds: [] });

			const category = component.channels.first(); //TODO: BD;
		}

		const isAnyChangeNeeded = await getUserConfirmation(
			interaction,
			{
				content: (
					getLocalizationForText(TextsLocalizationsIds.TICKETS_SETTINGS_IT_IS_DONE, guildLanguage) +
					' ' +
					getLocalizationForText(TextsLocalizationsIds.TICKETS_SETTINGS_IS_ANY_CHANGE_NEEDED, guildLanguage)
				),
				language: guildLanguage
			}
		);

		if (isAnyChangeNeeded === 'confirm') this.ticketSettings(interaction);
		else interaction.editReply({ content: getLocalizationForText(TextsLocalizationsIds.TICKETS_SETTINGS_IT_IS_DONE, guildLanguage), components: [] });
	}
}
