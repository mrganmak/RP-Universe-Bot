import { Snowflake } from "discord.js";
import { INTEGRITY_POINTS_MULTIPLE_VALUE, MarkerData, MarkerTypes, UsersMarkersBase } from "../../../index.js";

export class Marker {
	private _exists: boolean = true;

	constructor(
		public readonly userId: Snowflake,
		public readonly guildId: Snowflake,
		private _markerType: MarkerTypes,
		private _reason: string,
		private _hiddenInGuilds: string[]
	) {

	}

	public get integrityPoint(): number {
		return this._markerType * INTEGRITY_POINTS_MULTIPLE_VALUE;
	}

	public get type(): MarkerTypes {
		return this._markerType;
	}

	public get reason(): string {
		return this._reason
	}

	public get exists(): boolean {
		return this._exists;
	}

	public isHiddenInGuild(guildId: Snowflake): boolean {
		for (const hiddenInGuildId of this._hiddenInGuilds) {
			if (hiddenInGuildId === guildId) return true;
		}

		return false;
	}
	
	public delete(): void {
		const base = new UsersMarkersBase();
		base.deleteMarkerFromUserByGuildId(this.userId, this.guildId);
		this._exists = false;
	}

	public changeReason(reason: string): void {
		const base = new UsersMarkersBase();
		this._reason = reason;
		const markerData = this.toJSON();

		base.changeMarkerForUser(this.userId, markerData);
	}

	public changeType(markerType: MarkerTypes): void {
		const base = new UsersMarkersBase();
		this._markerType = this.type;
		const markerData = this.toJSON();

		base.changeMarkerForUser(this.userId, markerData);
	}

	public toJSON(): MarkerData {
		return {
			guildId: this.guildId,
			markerType: this._markerType,
			reason: this._reason,
			hiddenInGuilds: this._hiddenInGuilds
		};
	}

	public async hide(guildId?: Snowflake): Promise<void> {
		if (!guildId) return;

		const base = new UsersMarkersBase();
		this._hiddenInGuilds.push(guildId);
		const markerData = this.toJSON();

		await base.changeMarkerForUser(this.userId, markerData);
	} 

	public async unhide(guildId?: Snowflake): Promise<void> {
		if (!guildId) return;

		const base = new UsersMarkersBase();
		this._hiddenInGuilds = this._hiddenInGuilds.filter((hiddenGuildId) => (hiddenGuildId !== guildId));
		const markerData = this.toJSON();

		await base.changeMarkerForUser(this.userId, markerData);
	} 
}
