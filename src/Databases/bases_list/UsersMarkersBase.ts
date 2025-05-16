import { Colors, Snowflake } from "discord.js";
import { DeleteResult, InsertOneResult, UpdateResult, WithId } from "mongodb";
import { BaseCollection } from "../MongoBase.js";

export class UsersMarkersBase extends BaseCollection<UsersMarkersBaseData> {
	constructor() {
		super(process.env.DB_GUILDS_USERS_MARKERS);
		this.initCache();
	}

	protected getCacheKey(doc: WithId<UsersMarkersBaseData>): string {
		return doc.userId;
	}

	public async getByUserId(userId: Snowflake): Promise<WithId<UsersMarkersBaseData> | null> {
		const cached = await this.getFromCache(userId);
		if (cached) return cached;

		const markers = await this._collection.findOne({ userId });
		if (!markers) return null;

		this.setToCache(userId, markers);
		return markers;
	}

	public async addUser(markers: UsersMarkersBaseData): Promise<InsertOneResult<UsersMarkersBaseData>> {
		const markersById = await this.getByUserId(markers.userId);

		if (markersById) throw new Error('I cant add markers with same property');

		const result = await this._collection.insertOne(markers);
		this.setToCache(markers.userId, { ...markers, _id: result.insertedId });
		return result;
	}

	public async deleteMarkersByUserId(userId: Snowflake): Promise<DeleteResult> {
		const result = await this._collection.deleteOne({ userId });
		this.removeFromCache(userId);
		return result;
	}

	public async changeMarkerForUser(userId: Snowflake, marker: MarkerData): Promise<UpdateResult | InsertOneResult<UsersMarkersBaseData> | void> {
		return await this.addMarkerForUser(userId, marker);
	}

	public async addMarkerForUser(userId: Snowflake, marker: MarkerData): Promise<UpdateResult | InsertOneResult<UsersMarkersBaseData> | void> {
		const markersById = await this.getByUserId(userId);
		if (!markersById) return;

		const existedMarker = this._findMarkerInUserMarkersByGuildId(marker.guildId, markersById.markers);
		if (existedMarker) {
			existedMarker.guildId = marker.guildId;
			existedMarker.reason = marker.reason;
			existedMarker.hiddenInGuilds = marker.hiddenInGuilds
		} else {
			markersById.markers.push(marker);
		}

		this.setToCache(userId, markersById);
		return await this._collection.updateOne(
			{ userId },
			{ $set: markersById },
			{ upsert: false }
		);
	}

	private _findMarkerInUserMarkersByGuildId(guildId: Snowflake, markers: MarkerData[]): MarkerData | undefined {
		for (const marker of markers) {
			if (marker.guildId === guildId) return marker;
		}

		return undefined;
	}

	public async deleteMarkerFromUserByGuildId(userId: Snowflake, guildId: Snowflake): Promise<UpdateResult | null> {
		const guildMarkers = await this.getByUserId(userId);
		if (!guildMarkers) return null;

		guildMarkers.markers = guildMarkers.markers.filter((marker) => (marker.guildId !== guildId));
		
		this.setToCache(guildId, guildMarkers);
		return await this._collection.updateOne(
			{ guildId },
			{ $set: guildMarkers },
			{ upsert: false }
		);
	}
}

interface UsersMarkersBaseData {
	userId: Snowflake;
	markers: MarkerData[];
}

export interface MarkerData {
	guildId: Snowflake;
	markerType: MarkerTypes
	reason: string;
	hiddenInGuilds: Snowflake[];
}

export enum MarkerTypes {
	BLACK = -3,
	RED,
	YELLOW,
	GREEN = 1
}

export const markersColors = {
	[MarkerTypes.BLACK]: Colors.NotQuiteBlack,
	[MarkerTypes.RED]: Colors.Red,
	[MarkerTypes.YELLOW]: Colors.Yellow,
	[MarkerTypes.GREEN]: Colors.Green,
}
