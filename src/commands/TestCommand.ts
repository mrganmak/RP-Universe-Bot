import { ApplicationCommandOptionType, CommandInteraction, PermissionsBitField } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { CommandsCategirysIds, CommandsIds, LocalizationsLanguages } from "../enum.js";
import { getAllLocalizationsForCommandProperty, getLocalizationForCommand } from "../localizations/commands/index.js";
import { createHash } from "crypto";
import GuildsIdentifiersBase from "../Databases/bases_list/GuildsIdentifiersBase.js";
import { Category } from "@discordx/utilities";

const { name, description } = getLocalizationForCommand(CommandsIds.TEST, LocalizationsLanguages.EN);

@Discord()
@Category(CommandsCategirysIds.DEVELOPMENT)
class TestCommand {
	@Slash({
		name,
		description,
		nameLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.TEST, 'name', [LocalizationsLanguages.EN]),
		descriptionLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.TEST, 'description', [LocalizationsLanguages.EN]),
		defaultMemberPermissions: PermissionsBitField.Flags.Administrator
	})
	async test(
		@SlashOption({
			name,
			description,
			nameLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.TEST, 'name', [LocalizationsLanguages.EN]),
			descriptionLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.TEST, 'description', [LocalizationsLanguages.EN]),
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
