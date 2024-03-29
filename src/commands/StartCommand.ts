import { APISelectMenuOption, CommandInteraction, PermissionsBitField } from "discord.js";
import { Discord, Slash } from "discordx";
import { Category } from "@discordx/utilities";
import {
	CommandsCategoriesIds,
	CommandsIds,
	LocalizationsLanguages,
	getAllLocalizationsForCommandProperty,
	getLocalizationForCommand,
	getLocalizationForText,
	TextsLocalizationsIds,
	getAllLocalizationsForText,
	PaginationSelectMenu,
	GuildsLocalizationSettingsBase,
	GuildsModulesBase,
	CommandsIniter,
	GuildModules
} from "../index.js";

const { name, description } = getLocalizationForCommand(CommandsIds.START, LocalizationsLanguages.EN);

@Discord()
@Category(CommandsCategoriesIds.ONLY_IN_NOT_INITED_GUILDS)
class StartCommand {
	@Slash({
		name,
		description,
		nameLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.START, 'name', [LocalizationsLanguages.EN]),
		descriptionLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.START, 'description', [LocalizationsLanguages.EN]),
		defaultMemberPermissions: PermissionsBitField.Flags.Administrator
	})
	async test(interaction: CommandInteraction) {
		if (!interaction.guild || !interaction.isRepliable()) return;

		const content = [
			...getAllLocalizationsForText(TextsLocalizationsIds.START_ABOUT_ME, { isLangugageEmojiNeeded: true }),
			...getAllLocalizationsForText(TextsLocalizationsIds.START_CHOOSE_LANGUAGE, { isLangugageEmojiNeeded: true })
		].join('\n\n');

		await interaction.reply({ content, ephemeral: true });
		const choices: APISelectMenuOption[] = Object.entries(LocalizationsLanguages).map(([label, value]) => ({ label, value }));

		const selectMenu = await PaginationSelectMenu.create(interaction, interaction.user, {
			isLocalizationRequer: false,
			choices: choices
		});
		const answer = (await selectMenu.getUserAnswer()).values[0] as unknown as LocalizationsLanguages;

		const settingsBase = new GuildsLocalizationSettingsBase();
		await settingsBase.addSettings({ guildId: interaction.guild.id, language: answer });

		const modulesBase = new GuildsModulesBase();
		await modulesBase.changeModuleState(interaction.guild.id, GuildModules.INITED_GUILD, true);
		CommandsIniter.changeCommandsForGuild(interaction.guild.id);

		interaction.editReply({ content: getLocalizationForText(TextsLocalizationsIds.START_FINAL, answer) });
	}
}
