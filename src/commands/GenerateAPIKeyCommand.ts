import { CommandInteraction, EmbedBuilder, PermissionsBitField } from "discord.js";
import { Discord, Slash } from "discordx";
import { CommandsCategirysIds, CommandsIds, LocalizationsLanguages } from "../enum.js";
import { getAllLocalizationsForCommandProperty, getLocalizationForCommand } from "../localizations/commands/index.js";
import TokenGenerator from "../utils/TokenGenerator.js";
import { getGuildLanguage } from "../localizations/index.js";
import { getLocalizationForText } from "../localizations/texts/index.js";
import GuildsIdentifiersBase from "../Databases/bases_list/GuildsIdentifiersBase.js";
import getUserConfirmation from "../modules/interactions/UserConfirmation.js";
import TextsLocalizationsIds from "../localizations/texts/types/TextsLocalizationsIds.js";
import { Category } from "@discordx/utilities";

const { name, description } = getLocalizationForCommand(CommandsIds.GENERATE_API_KEY, LocalizationsLanguages.EN);

@Discord()
@Category(CommandsCategirysIds.ONLY_IN_INITED_GUILDS)
class GenerateAPIKeyCommand {
	@Slash({
		name,
		description,
		nameLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.GENERATE_API_KEY, 'name', [LocalizationsLanguages.EN]),
		descriptionLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.GENERATE_API_KEY, 'description', [LocalizationsLanguages.EN]),
		defaultMemberPermissions: PermissionsBitField.Flags.Administrator
	})
	async generateAPIKey(interaction: CommandInteraction) {
		if (!interaction.guild) return;
		await interaction.deferReply({ ephemeral: true });
		const base = new GuildsIdentifiersBase();
		const guildLanguage = await getGuildLanguage(interaction.guild.id);

		if ((await base.getByGuildId(interaction.guild.id))?.APIKey) {
			const userConfirmation = await getUserConfirmation(
				interaction,
				{
					content: getLocalizationForText(
						TextsLocalizationsIds.GENERATE_API_KEY_RESET_WARNING_TEXT,
						guildLanguage
					),
					language: guildLanguage
				}	
			);

			if (userConfirmation == 'deny') return await interaction.editReply({ content: getLocalizationForText(TextsLocalizationsIds.GENERATE_API_KEY_RESET_CANCELED_TEXT, guildLanguage) });
		}

		const APIKey = await TokenGenerator.createAPIKey();
		const embed = new EmbedBuilder();
		embed
			.setTitle(getLocalizationForText(TextsLocalizationsIds.GENERATE_API_KEY_EMBED_LABLE, guildLanguage))
			.setDescription(getLocalizationForText(TextsLocalizationsIds.GENERATE_API_KEY_EMBED_DESCRIPTION, guildLanguage))
			.setFields({
				name: getLocalizationForText(TextsLocalizationsIds.GENERATE_API_KEY_EMBED_KEY_FIELD_NAME, guildLanguage),
				value: APIKey.key
			});

		await base.addAPIKeyForGuild(interaction.guild.id, APIKey.hash);
		await interaction.editReply({ content: '', embeds: [embed] });
	}
}
