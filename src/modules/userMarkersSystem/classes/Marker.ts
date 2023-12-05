import { Snowflake } from "discord.js";
import { MarkerData, MarkerTypes, UsersMarkersBase } from "../../../index.js";

export class Marker {
	private _exists: boolean = true;

	constructor(
		public readonly userId: Snowflake,
		public readonly guildId: Snowflake,
		private _markerType: MarkerTypes,
		private _reason: string
	) {

	}

	public get integrityPoint(): number {
		return this._markerType;
	}

	public get reason(): string {
		return this._reason
	}

	public get exists(): boolean {
		return this._exists;
	}
	
	public delete(): void {
		const base = new UsersMarkersBase();
		base.deleteMarkerFromUserByGuildId(this.userId, this.guildId);
		this._exists = false;
	}

	public changeReason(reason: string): void {
		const base = new UsersMarkersBase();
		const markerData = this.toJSON();
		markerData.reason = reason;

		base.changeMarkerForUser(this.userId, markerData);
	}

	public changeType(markerType: MarkerTypes): void {
		const base = new UsersMarkersBase();
		const markerData = this.toJSON();
		markerData.markerType = markerType;

		base.changeMarkerForUser(this.userId, markerData);
	}

	public toJSON(): MarkerData {
		return {
			guildId: this.guildId,
			markerType: this._markerType,
			reason: this._reason
		};
	}
}
