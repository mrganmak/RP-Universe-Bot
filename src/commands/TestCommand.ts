import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { ECommandsIds, ELocalizationsLanguages } from "../enum.js";
import { getAllLocalizationsForCommandProperty, getLocalizationForCommand } from "../localizations/commands/index.js";
import { createHash } from "crypto";
import GuildsIdentifiersBase from "../Databases/bases_list/GuildsIdentifiersBase.js";

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
	async test(
		@SlashOption({
			name,
			description,
			nameLocalizations: getAllLocalizationsForCommandProperty(ECommandsIds.TEST, 'name', [ELocalizationsLanguages.EN]),
			descriptionLocalizations: getAllLocalizationsForCommandProperty(ECommandsIds.TEST, 'description', [ELocalizationsLanguages.EN]),
			required: true,
			type: ApplicationCommandOptionType.String
		})
		test: string,
		interaction: CommandInteraction
	) {
		const base = new GuildsIdentifiersBase();
		const keyHash = createHash('sha512').update(test).digest('hex');
		const guildIdentifiers = await base.getByAPIKey(keyHash);

		interaction.reply({ content: (guildIdentifiers ? 'yes' : 'no'), ephemeral: true });
	}
}
