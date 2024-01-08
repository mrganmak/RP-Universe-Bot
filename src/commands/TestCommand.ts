import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder, PermissionResolvable, PermissionsBitField } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { createHash } from "crypto";
import { Category } from "@discordx/utilities";
import {
	CommandsCategoriesIds,
	CommandsIds,
	LocalizationsLanguages,
	getAllLocalizationsForCommandProperty,
	getLocalizationForCommand,
	GuildsIdentifiersBase,
	GuildsReSendingSettingsBase,
} from "../index.js";

const { name, description } = getLocalizationForCommand(CommandsIds.TEST, LocalizationsLanguages.EN);

@Discord()
@Category(CommandsCategoriesIds.DEVELOPMENT)
class TestCommand {
	@Slash({
		name,
		description,
		nameLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.TEST, 'name', [LocalizationsLanguages.EN]),
		descriptionLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.TEST, 'description', [LocalizationsLanguages.EN]),
		defaultMemberPermissions: PermissionsBitField.Flags.Administrator
	})
	async test(
		interaction: CommandInteraction
	) {
		if (!interaction.guild) return;

		const embed = new EmbedBuilder();
		embed
			.setTitle('Обработчик тикетов')
			.setDescription('Нажмите на кнопку снизу, если вам нужна помощь')
			.setColor('DarkPurple')
		const row: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder();
		row.addComponents(
			new ButtonBuilder()
				.setCustomId('open_ticket')
				.setLabel('Открыть тикет')
				.setStyle(ButtonStyle.Secondary)
		);

		interaction.channel?.send({ embeds: [embed], components: [row] });
	}
}
