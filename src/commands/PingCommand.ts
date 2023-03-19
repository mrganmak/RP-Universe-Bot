import { CommandInteraction, PermissionsBitField } from "discord.js";
import { Discord, Slash } from "discordx";
import { CommandsCategirysIds, CommandsIds, LocalizationsLanguages } from "../enum.js";
import { getAllLocalizationsForCommandProperty, getLocalizationForCommand } from "../localizations/commands/index.js";
import { getLocalizationForText } from "../localizations/texts/index.js";
import { getGuildLanguage } from "../localizations/index.js";
import TextsLocalizationsIds from "../localizations/texts/types/TextsLocalizationsIds.js";
import { Category } from "@discordx/utilities";

const { name, description } = getLocalizationForCommand(CommandsIds.PING, LocalizationsLanguages.EN);

@Discord()
@Category(CommandsCategirysIds.DEVELOPMENT)
class PingCommand {
	@Slash({
		name,
		description,
		nameLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.PING, 'name', [LocalizationsLanguages.EN]),
		descriptionLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.PING, 'description', [LocalizationsLanguages.EN]),
		defaultMemberPermissions: PermissionsBitField.Flags.Administrator
	})
	async ping(interaction: CommandInteraction) {
		if (!interaction.guild) return;

		interaction.reply({
			content: getLocalizationForText(
				TextsLocalizationsIds.PING_COMMAND_MESSAGE_TEXT,
				await getGuildLanguage(interaction.guild.id)
			).replace('{ping}', String(Math.round(interaction.client.ws.ping))),
			ephemeral: true
		});
	}
}
