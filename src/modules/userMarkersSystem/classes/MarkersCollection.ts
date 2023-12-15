import { Snowflake, User } from "discord.js";
import { INTEGRITY_LEVEL_MAX_VALUE, INTEGRITY_LEVEL_MIN_VALUE, Marker, MarkerData, UsersMarkersBase } from "./../../../index.js";

export class MarkersCollection {
	constructor(
		public readonly user: User,
		private _markers: Markers
	) {

	}

	public get length(): number {
		this._filterMarkersOnNonExists();
		return Object.values(this._markers).length;
	}

	public async addMarker(data: MarkerData): Promise<void> {
		const base = new UsersMarkersBase();
		await base.addMarkerForUser(this.user.id, data);

		const marker = new Marker(this.user.id, data.guildId, data.markerType, data.reason, data.hiddenInGuilds);
		this._markers[data.guildId] = marker;
	}

	public async removeMarker(guildId: Snowflake): Promise<void> {
		if (!this.hasMarkerInGuild(guildId)) return;
		const base = new UsersMarkersBase();
		await base.deleteMarkerFromUserByGuildId(this.user.id, guildId);

		const filteredMarkers = Object.values(this._markers).filter((marker) => (marker.guildId !== guildId));
		this._markers = Object.fromEntries(filteredMarkers.map((marker) => [guildId, marker]));
	}

	public hasMarkerInGuild(guildId: Snowflake): boolean {
		const guildMarker = this._markers[guildId];
		return (guildMarker ? guildMarker.exists : false);
	}

	public getMarkerByGuildId(guildId: Snowflake): Marker | undefined {
		if (!this.hasMarkerInGuild(guildId)) return undefined;
		else return this._markers[guildId];
	}

	public getAllMarkers(guildId?: Snowflake): Markers {
		this._filterMarkersOnNonExists();
		if (guildId) return this._getMarkersFilteredByNotHiddenInGuild(guildId);
		return this._markers;
	}

	private _filterMarkersOnNonExists(): void {
		const markersEntries = Object.entries(this._markers);
		const filteredMarkers = Object.fromEntries(markersEntries.filter(([_, marker]) => (marker.exists)));
		this._markers = filteredMarkers;
	}

	public getUserIntegrityLevel(guildId?: Snowflake): number {
		const sumOfIntegrityPoints = (this.getSumOfIntegrityPoints(guildId));
		return (
			sumOfIntegrityPoints <= INTEGRITY_LEVEL_MIN_VALUE
			? INTEGRITY_LEVEL_MIN_VALUE
			: (
				sumOfIntegrityPoints >= INTEGRITY_LEVEL_MAX_VALUE
				? INTEGRITY_LEVEL_MAX_VALUE
				: sumOfIntegrityPoints
			)
		);
	}

	public getSumOfIntegrityPoints(guildId?: Snowflake): number {
		const markers = (Object.values(guildId ? this._getMarkersFilteredByNotHiddenInGuild(guildId) : this._markers));
		if (markers.length <= 0) return 0;
		else return markers.reduce((sum, marker) => (sum + marker.integrityPoint), 0);
	}

	public getAverageOfIntegrityPoints(guildId?: Snowflake): number {
		const markers = (Object.values(guildId ? this._getMarkersFilteredByNotHiddenInGuild(guildId) : this._markers));
		if (markers.length <= 0) return 0;
		else return (this.getSumOfIntegrityPoints(guildId) / markers.length);
	}

	private _getMarkersFilteredByNotHiddenInGuild(guildId: Snowflake): Markers {
		const filteredMarkers = Object.values(this._markers).filter((marker) => (!marker.isHiddenInGuild(guildId)));
		return Object.fromEntries(filteredMarkers.map((marker) => ([marker.guildId, marker])));
	}
}

interface Markers {
	[guildId: Snowflake]: Marker
}
