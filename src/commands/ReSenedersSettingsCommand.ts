import { CommandInteraction, EmbedBuilder, PermissionsBitField } from "discord.js";
import { Discord, Slash } from "discordx";
import { Category } from "@discordx/utilities";
import {
	CommandsCategoriesIds,
	CommandsIds,
	LocalizationsLanguages,
	getAllLocalizationsForCommandProperty,
	getLocalizationForCommand,
	GuildsReSendingSettingsBase,
	getGuildLanguage,
	TextsLocalizationsIds,
	reSendingSettingsSelectMenuComponents,
	PaginationSelectMenu,
	getLocalizationForText,
	PaginationSelectMenuOptions
} from "../index.js";

const { name, description } = getLocalizationForCommand(CommandsIds.RE_SENDERS_SETTINGS, LocalizationsLanguages.EN);

@Discord()
@Category(CommandsCategoriesIds.ONLY_IN_INITED_GUILDS)
class ReSenedersSettingsCommand {
	@Slash({
		name,
		description,
		nameLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.RE_SENDERS_SETTINGS, 'name', [LocalizationsLanguages.EN]),
		descriptionLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.RE_SENDERS_SETTINGS, 'description', [LocalizationsLanguages.EN]),
		defaultMemberPermissions: PermissionsBitField.Flags.Administrator
	})
	async reSenedersSettingsCommand(
		interaction: CommandInteraction
	) {
		if (!interaction.guild || !interaction.isRepliable()) return;
		if (!interaction.replied && !interaction.deferred) await interaction.deferReply({ ephemeral: true });
		const guildLanguage = await getGuildLanguage(interaction.guild.id);
		const base = new GuildsReSendingSettingsBase();

		if (!await base.getByGuildId(interaction.guild.id)) await base.addSettings({ guildId: interaction.guild.id, reSenders: { } });

		const embed = new EmbedBuilder();
		embed
			.setTitle(getLocalizationForText(TextsLocalizationsIds.RE_SENDERS_SETTINGS_EMBED_LABLE, guildLanguage))
			.setDescription(getLocalizationForText(TextsLocalizationsIds.RE_SENDERS_SETTINGS_EMBED_DESCRIPTION, guildLanguage))

		await interaction.editReply({ embeds: [embed], content: '' });

		const paginationSelectMenu = await PaginationSelectMenu.create(interaction, interaction.user, {
			isLocalizationRequer: true,
			choices: reSendingSettingsSelectMenuComponents,
			language: guildLanguage
		});
		const answer = (await paginationSelectMenu.getUserAnswer()).values[0];

		if (answer === 'delete_re_sender') return await this._deleteReSender(interaction);
		else if (answer === 'add_re_sender') return await this._addReSender(interaction);
	}

	private async _deleteReSender(interaction: CommandInteraction) {
		if (!interaction.guild || !interaction.isRepliable()) return;
		const base = new GuildsReSendingSettingsBase();
		const guildSettings = await base.getByGuildId(interaction.guild.id);
		if (!guildSettings) return;

		const guildLanguage = await getGuildLanguage(interaction.guild.id);

		const options: PaginationSelectMenuOptions = {
			isLocalizationRequer: false,
			choices: []
		};

		for (const reSender of Object.values(guildSettings.reSenders)) {
			const channel = await interaction.guild.channels.fetch(reSender.channelId).catch(() => { });
			if (!channel) continue;

			options.choices.push({ label: channel.name, value: channel.id })
		}

		if (Object.keys(options.choices).length <= 0) {
			return await interaction.editReply({
				content: getLocalizationForText(
					TextsLocalizationsIds.RE_SENDERS_SETTINGS_NO_RE_SENDERS_FOR_DELETE_ERROR,
					guildLanguage
				),
				embeds: []
			});
		}

		const paginationSelectMenu = await PaginationSelectMenu.create(interaction, interaction.user, options);
		const answer = (await paginationSelectMenu.getUserAnswer()).values[0];

		guildSettings.reSenders = Object.fromEntries(Object.entries(guildSettings.reSenders).filter(([id]) => (id !== answer)));
		await base.changeSettings(guildSettings);
	}

	private async _addReSender(interaction: CommandInteraction) {

	}
}
