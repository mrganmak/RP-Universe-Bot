import { ActionRowBuilder, ComponentType, Interaction, ModalBuilder, TextInputBuilder, TextInputStyle, User } from "discord.js";
import { INTEGRITY_POINTS_MULTIPLE_VALUE, Marker, MarkerData, MarkerEmbedBuilder, MarkerTypes, MarkersCollection, PaginationSelectMenu, TextsLocalizationsIds, UsersMarkersBase, getGuildLanguage, getLocalizationForText, getUserConfirmation, selectMarkerTypeSelectMenuComponents } from "../../index.js";

export class UsersMarkersSystem {
	public static async hasUserHaveMarkers(user: User): Promise<boolean> {
		const base = new UsersMarkersBase();
		const userMarkers = await base.getByUserId(user.id);

		return (userMarkers ? (userMarkers.markers.length > 0) : false);
	}

	public static async getUserMarkersCollection(user: User): Promise<MarkersCollection | null> {
		if (!UsersMarkersSystem.hasUserHaveMarkers(user)) return null;

		const base = new UsersMarkersBase();
		const userMarkers = await base.getByUserId(user.id);
		if (!userMarkers) return null;
		const markersByGuilds = Object.fromEntries(
			userMarkers.markers.map(
				(marker) => ([
					marker.guildId,
					new Marker(
						user.id,
						marker.guildId,
						marker.markerType,
						marker.reason,
						marker.hiddenInGuilds
					)
				])
			)
		);
		const markersCollection = new MarkersCollection(user, markersByGuilds);

		return markersCollection;
	}

	public static async addMarkerToUser(user: User, { guildId, markerType, reason }: AddMarkerToUserData): Promise<void> {
		const userMarkers = (await this.getUserMarkersCollection(user)) ?? new MarkersCollection(user, {});
		
		return await userMarkers.addMarker({
			guildId,
			reason,
			markerType,
			hiddenInGuilds: []
		});
	}

	public static async addNewMarkerInteraction(user: User, interaction: Interaction): Promise<void> {
		if (!interaction.isRepliable()) throw new Error('Interaction is nor repliable');
		if (!interaction.guild) throw new Error('Interaction is not in guild');
		if (!interaction.replied || !interaction.deferred) interaction.deferReply({ ephemeral: true });

		const guildLanguage = await getGuildLanguage(interaction.guild?.id);
		
		await interaction.editReply({
			content: getLocalizationForText(
				TextsLocalizationsIds.USER_MARKERS_SELECT_MARKER_TYPE_TEXT,
				guildLanguage,
			),
			embeds: []
		});
		
		const paginationSelectMenu = await PaginationSelectMenu.create(interaction, interaction.user, {
			isLocalizationRequer: true,
			choices: selectMarkerTypeSelectMenuComponents,
			language: guildLanguage
		});
		const answerInteracion = (await paginationSelectMenu.getUserAnswer()) ;
		const markerType = Number(answerInteracion.values[0]) as unknown as MarkerTypes;

		const modal = new ModalBuilder();
		modal
		.setCustomId('modal')
		.setComponents(
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setLabel(getLocalizationForText(TextsLocalizationsIds.USER_MARKERS_SET_MARKER_REASON_TEXT, guildLanguage))
					.setPlaceholder(getLocalizationForText(TextsLocalizationsIds.USER_MARKERS_SET_MARKER_REASON_PLACEHOLDER, guildLanguage))
					.setCustomId('reason')
					.setRequired(true)
					.setStyle(TextInputStyle.Paragraph)
			)
		)
		.setTitle(getLocalizationForText(TextsLocalizationsIds.USER_MARKERS_SET_MARKER_REASON_MODAL_TEXT, guildLanguage));

		await answerInteracion.showModal(modal);
		const modalSubmit = await answerInteracion.awaitModalSubmit({ time: 60*60*1000 }).catch((error) => { });

		if (!modalSubmit) return;
		await modalSubmit.deferUpdate();

		const userAnswer = modalSubmit.fields.getField('reason');
		if (userAnswer.type !== ComponentType.TextInput) return;
		const reason = userAnswer.value;
		
		const userConfirmationAnswer = await getUserConfirmation(
			interaction,
			{
				content: getLocalizationForText(TextsLocalizationsIds.USER_MARKERS_ADD_MARKER_CONFIRMATION_TEXT, guildLanguage),
				language: guildLanguage,
				embeds: [new MarkerEmbedBuilder(
					guildLanguage,
					markerType * INTEGRITY_POINTS_MULTIPLE_VALUE,
					markerType,
					reason,
					interaction.guild.name
				)]
			}
		)

		if (userConfirmationAnswer === 'confirm') {
			await this.addMarkerToUser(user, {
				guildId: interaction.guild.id,
				reason,
				markerType
			});

			interaction.editReply({
				content: getLocalizationForText(TextsLocalizationsIds.USER_MARKERS_ADD_MARKER_SUCCESS, guildLanguage),
				embeds: []
			});
		} else {
			return await this.addNewMarkerInteraction(user, interaction);
		}
	}
}

type AddMarkerToUserData = Omit<MarkerData, "hiddenInGuilds">;
