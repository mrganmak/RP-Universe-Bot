import { CommandInteraction, PermissionsBitField } from "discord.js";
import { Discord, Slash } from "discordx";
import { Category } from "@discordx/utilities";
import {
	CommandsCategirysIds,
	CommandsIds,
	LocalizationsLanguages,
	getAllLocalizationsForCommandProperty,
	getLocalizationForCommand,
	getGuildLanguage,
	getLocalizationForText,
	TextsLocalizationsIds
} from "../index.js";

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
