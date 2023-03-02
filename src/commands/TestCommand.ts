import { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";
import { ECommandsIds, ELocalizationsLanguages } from "../enum.js";
import { getAllLocalizationsForCommandProperty, getLocalizationForCommand } from "../localizations/commands/index.js";

const { name, description } = getLocalizationForCommand(ECommandsIds.TEST, ELocalizationsLanguages.EN);

@Discord()
class TestCommand {
	@Slash({
		name,
		description,
		nameLocalizations: getAllLocalizationsForCommandProperty(ECommandsIds.TEST, 'name', [ELocalizationsLanguages.EN]),
		descriptionLocalizations: getAllLocalizationsForCommandProperty(ECommandsIds.TEST, 'description', [ELocalizationsLanguages.EN]),
		guilds: [process.env.TEST_GUILD_ID],
		dmPermission: false
	})
	async test(interaction: CommandInteraction) {
		interaction.reply({ content: 'test', ephemeral: true });
	}
}
