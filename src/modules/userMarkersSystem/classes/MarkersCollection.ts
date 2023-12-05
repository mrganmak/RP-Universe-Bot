import { Snowflake, User } from "discord.js";
import { Marker, MarkerData, UsersMarkersBase } from "./../../../index.js";

export class MarkersCollection {
	constructor(
		public readonly user: User,
		private _markers: Markers
	) {

	}

	public async addMarker(data: MarkerData): Promise<void> {
		const base = new UsersMarkersBase();
		await base.addMarkerForUser(this.user.id, data);
		const marker = new Marker(this.user.id, data.guildId, data.markerType, data.reason);
		this._markers[data.guildId] = marker;
	}

	public hasMarkerInGuild(guildId: Snowflake): boolean {
		const guildMarker = this._markers[guildId];
		return (guildMarker ? guildMarker.exists : false);
	}

	public getMarkerByGuildId(guildId: Snowflake): Marker | undefined {
		if (!this.hasMarkerInGuild(guildId)) return undefined;
		else return this._markers[guildId];
	}

	public getAllMarkers(): Markers {
		this._filterMarkersOnNonExists();
		return this._markers;
	}

	private _filterMarkersOnNonExists(): void {
		const markersEntries = Object.entries(this._markers);
		const filteredMarkers = Object.fromEntries(markersEntries.filter(([_, marker]) => (marker.exists)));
		this._markers = filteredMarkers;
	}

	public getSumOfIntegrityPoints(): number {
		const markers = Object.values(this._markers);
		if (markers.length <= 0) return 0;
		else return markers.reduce((sum, marker) => (sum + marker.integrityPoint), 0);
	}

	public getAverageOfIntegrityPoints(): number {
		const markers = Object.values(this._markers);
		if (markers.length <= 0) return 0;
		else return (this.getSumOfIntegrityPoints() / markers.length);
	}
}

interface Markers {
	[guildId: Snowflake]: Marker
}
