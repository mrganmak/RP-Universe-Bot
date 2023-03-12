import { APISelectMenuOption, CommandInteraction, PermissionsBitField } from "discord.js";
import { Discord, Slash } from "discordx";
import { ECommandsCategirysIds, ECommandsIds, ELocalizationsLanguages } from "../enum.js";
import { getAllLocalizationsForCommandProperty, getLocalizationForCommand } from "../localizations/commands/index.js";
import { Category, EnumChoice } from "@discordx/utilities";
import GuildsModulesBase from "../Databases/bases_list/GuildsModulesBase.js";
import CommandsIniter from "../utils/CommandsIniter.js";
import { getAllLocalizationsForText, getLocalizationForText } from "../localizations/texts/index.js";
import ETextsLocalizationsIds from "../localizations/texts/types/ETextsLocalizationsIds.js";
import PaginationSelectMenu from "../modules/paginations/PaginationSelectMenu.js";
import GuildsLocalizationSettingsBase from "../Databases/bases_list/GuildsLocalizationSettingsBase.js";

const { name, description } = getLocalizationForCommand(ECommandsIds.START, ELocalizationsLanguages.EN);

@Discord()
@Category(ECommandsCategirysIds.ONLY_IN_NOT_INITED_GUILDS)
class StartCommand {
	@Slash({
		name,
		description,
		nameLocalizations: getAllLocalizationsForCommandProperty(ECommandsIds.START, 'name', [ELocalizationsLanguages.EN]),
		descriptionLocalizations: getAllLocalizationsForCommandProperty(ECommandsIds.START, 'description', [ELocalizationsLanguages.EN]),
		defaultMemberPermissions: PermissionsBitField.Flags.Administrator
	})
	async test(interaction: CommandInteraction) {
		if (!interaction.guild) return;

		const content = [
			...getAllLocalizationsForText(ETextsLocalizationsIds.START_ABOUT_ME, { isLangugageEmojiNeeded: true }),
			...getAllLocalizationsForText(ETextsLocalizationsIds.START_CHOOSE_LANGUAGE, { isLangugageEmojiNeeded: true })
		].join('\n\n');

		await interaction.reply({ content, ephemeral: true });
		const choices: Array<APISelectMenuOption> = Object.entries(ELocalizationsLanguages).map(([label, value]) => ({ label, value }));

		const selectMenu = await PaginationSelectMenu.create(interaction, interaction.user, {
			isLocalizationRequer: false,
			choices: choices
		});
		const answer = (await selectMenu.getUserAnswer())[0] as unknown as ELocalizationsLanguages;

		const settingsBase = new GuildsLocalizationSettingsBase();
		await settingsBase.addSettings({ guildId: interaction.guild.id, language: answer });

		const modulesBase = new GuildsModulesBase();
		await modulesBase.changeModuleState(interaction.guild.id, 'isGuildInited', true);
		CommandsIniter.changeCommandsForGuild(interaction.guild.id);

		interaction.editReply({ content: getLocalizationForText(ETextsLocalizationsIds.START_FINAL, answer) });
	}
}
