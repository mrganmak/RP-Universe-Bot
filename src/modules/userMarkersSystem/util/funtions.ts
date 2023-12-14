import { RepliableInteraction, User } from "discord.js";
import { LocalizationsLanguages, getUserConfirmation, getLocalizationForText, TextsLocalizationsIds, UsersMarkersSystem } from "../../../index.js";

export async function userDoNotHaveMarkersErrorHandler(user: User, interaction: RepliableInteraction, language: LocalizationsLanguages): Promise<void> {
	if (!interaction.replied && !interaction.deferred) await interaction.deferReply({ ephemeral: true });

	const answer = await getUserConfirmation(
		interaction, 
		{
			content: getLocalizationForText(
				TextsLocalizationsIds.USER_MARKERS_INFO_USER_DO_NOT_HAVE_MARKERS,
				language
			),
			language
		}
	);
	
	if (answer === 'confirm') return UsersMarkersSystem.addNewMarkerInteraction(user, interaction);
	else return;
}
