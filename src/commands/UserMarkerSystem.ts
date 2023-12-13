import { ApplicationCommandOptionType, ChatInputCommandInteraction, GuildMember, PermissionsBitField } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { Category } from '@discordx/utilities';
import {
	CommandsCategoriesIds,
	CommandsIds,
	LocalizationsLanguages,
	getAllLocalizationsForCommandProperty,
	getLocalizationForCommand,
	DEFAULT_SERVER_LANGUAGE,
	UsersMarkersSystem,
	getGuildLanguage,
	userDoNotHaveMarkersErrorHandler,
	MarkersInfoInteraction,
} from '../index.js';


const {
	name,
	description,
	targetUserName,
	targetUserDescription
} = getLocalizationForCommand(CommandsIds.USER_MARKERS_INFO, DEFAULT_SERVER_LANGUAGE);

@Discord()
@Category(CommandsCategoriesIds.ONLY_IN_INITED_GUILDS)
class UserMarkersinfo {
	@Slash({
		name,
		description,
		nameLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.USER_MARKERS_INFO, 'name', [LocalizationsLanguages.EN]),
		descriptionLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.USER_MARKERS_INFO, 'description', [LocalizationsLanguages.EN]),
		defaultMemberPermissions: PermissionsBitField.Flags.Administrator
	})
	async userMarkersInfo(
		@SlashOption({
			name: targetUserName,
			description: targetUserDescription,
			required: true,
			type: ApplicationCommandOptionType.User,
			nameLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.USER_MARKERS_INFO, 'targetUserName', [LocalizationsLanguages.EN]),
			descriptionLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.USER_MARKERS_INFO, 'targetUserDescription', [LocalizationsLanguages.EN]),
		})
		member: GuildMember,
		interaction: ChatInputCommandInteraction
	) {
		if (!interaction.guild) return;
		if (!interaction.replied && !interaction.deferred) await interaction.deferReply({ ephemeral: true });

		const language = await getGuildLanguage(interaction.guild.id);
		const markers = await UsersMarkersSystem.getUserMarkersCollection(member.user);
		if (!markers) {
			return userDoNotHaveMarkersErrorHandler(member.user, interaction, language);
		};

		const info = new MarkersInfoInteraction(member, interaction, markers, language);
		info.sendInfo();
	}
}
