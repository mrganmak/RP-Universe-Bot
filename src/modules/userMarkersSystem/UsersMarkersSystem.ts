import { Message, User } from "discord.js";
import { Marker, MarkersCollection, UsersMarkersBase } from "../../index.js";

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
		if (!userMarkers) return null
		const markersByGuilds = Object.fromEntries(
			userMarkers.markers.map(
				(marker) => ([
					marker.guildId,
					new Marker(
						user.id,
						marker.guildId,
						marker.markerType,
						marker.reason
					)
				])
			)
		);
		const markersCollection = new MarkersCollection(user, markersByGuilds);

		return markersCollection;
	}
}
