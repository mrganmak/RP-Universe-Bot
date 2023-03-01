import { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";
import { ECommandsId, ELocalizationsLanguages } from "../enum.js";
import { getAllLocalizationsForCommandProperty, getLocalizationForCommand } from "../localizations/commands/index.js";

const { name, description } = getLocalizationForCommand(ECommandsId.TEST, ELocalizationsLanguages.EN);

@Discord()
class TestCommand {
	@Slash({
		name,
		description,
		nameLocalizations: getAllLocalizationsForCommandProperty(ECommandsId.TEST, 'name', [ELocalizationsLanguages.EN]),
		descriptionLocalizations: getAllLocalizationsForCommandProperty(ECommandsId.TEST, 'description', [ELocalizationsLanguages.EN]),
		guilds: [process.env.TEST_GUILD_ID]
	})
	async test(interaction: CommandInteraction) {
		interaction.reply({ content: 'test', ephemeral: true });
	}
}
