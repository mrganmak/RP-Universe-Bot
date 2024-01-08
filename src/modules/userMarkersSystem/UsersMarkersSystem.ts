import { ComponentType, GuildMember, Interaction, RepliableInteraction, User } from "discord.js";
import { CollectedQuestionAnswer, DataCollectionPoll, INTEGRITY_POINTS_MULTIPLE_VALUE, Marker, MarkerData, MarkerEmbedBuilder, MarkerTypes, MarkersCollection, QuestionTypes, TextsLocalizationsIds, UsersMarkersBase, getGuildLanguage, getLocalizationForText, getUserConfirmation, markerCreatePollQuestions } from "../../index.js";

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

	public static async addNewMarkerInteraction(user: User, interaction: RepliableInteraction): Promise<void> {
		if (!interaction.isRepliable()) throw new Error('Interaction is nor repliable');
		if (!interaction.guild || !interaction.member) throw new Error('Interaction is not in guild');
		if (!interaction.replied || !interaction.deferred) interaction.deferReply({ ephemeral: true });

		const guildLanguage = await getGuildLanguage(interaction.guild?.id);
		const member = (
			interaction.member instanceof GuildMember
			? interaction.member
			: await interaction.guild.members.fetch(interaction.member.user.id).catch(() => {})
		);
		if (!member) throw new Error('Cant find member');

		const dataCollectionPoll = new DataCollectionPoll({
			language: guildLanguage,
			interaction: interaction,
			respondent: member,
			questions: markerCreatePollQuestions
		});
		const pollData = await dataCollectionPoll.collectPollData();
		if (!pollData) return;

		const markerType = UsersMarkersSystem._getMarkerTypeFromPollData(pollData[0]);
		const reason = UsersMarkersSystem._getReasonFromPollData(pollData[1]);
		if (!markerType || !reason) return;

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
		);

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

	private static _getMarkerTypeFromPollData(pollData: CollectedQuestionAnswer): MarkerTypes | undefined {
		if (pollData.type !== QuestionTypes.SELECT_MENU || pollData.seletMenuType !== ComponentType.StringSelect) return undefined;

		return Number(pollData.answer[0].value) as unknown as MarkerTypes;
	}

	private static _getReasonFromPollData(pollData: CollectedQuestionAnswer): string | undefined {
		if (pollData.type !== QuestionTypes.MODAL_MENU) return undefined;

		return pollData.answer['reason']?.value ?? undefined;
	}
}

type AddMarkerToUserData = Omit<MarkerData, "hiddenInGuilds">;
