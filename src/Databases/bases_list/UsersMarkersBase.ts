import { Snowflake } from "discord.js";
import { MongoBase } from "../MongoBase.js";
import { Collection, DeleteResult, InsertOneResult, UpdateResult } from "mongodb";

export class UsersMarkersBase {
	private static _instance: UsersMarkersBase | undefined;

	private _database!: typeof MongoBase['database'];
	private _collection!: Collection<UserMarkersBase>;

	constructor() {
		if (UsersMarkersBase._instance) return UsersMarkersBase._instance;
		UsersMarkersBase._instance = this;

		this._database = MongoBase.database;
		this._collection = this._database.collection<UserMarkersBase>(process.env.DB_GUILDS_USERS_MARKERS);
	}

	public async getByUserId(userId: Snowflake): Promise<UserMarkersBase | null> {
		return await this._collection.findOne({ userId });
	}

	public async addUser(userMarkers: UserMarkersBase): Promise<InsertOneResult<UserMarkersBase>> {
		const markersById = await this.getByUserId(userMarkers.userId);

		if (markersById) throw new Error('I cant add markers with same property');

		return await this._collection.insertOne(userMarkers);
	}

	public async deleteMarkersByUserId(userId: Snowflake): Promise<DeleteResult> {
		return await this._collection.deleteOne({ userId });
	}

	public async changeMarkerForUser(userId: Snowflake, marker: MarkerData): Promise<UpdateResult | InsertOneResult<UserMarkersBase>> {
		return await this.addMarkerForUser(userId, marker);
	}

	public async addMarkerForUser(userId: Snowflake, marker: MarkerData): Promise<UpdateResult | InsertOneResult<UserMarkersBase>> {
		const userMarkersData = await this.getByUserId(userId);
		if (!userMarkersData) return await this.addUser({ userId, markers: [marker] });

		const existedMarker = this._findMarkerInUserMarkersByGuildId(marker.guildId, userMarkersData.markers);
		if (existedMarker) {
			existedMarker.markerType = marker.markerType;
			existedMarker.reason = marker.reason;
		} else {
			userMarkersData.markers.push(marker);
		}

		return await this._collection.updateOne(
			{ userId },
			{ $set: { userMarkersData } },
			{ upsert: false }
		);
	}

	private _findMarkerInUserMarkersByGuildId(guildId: Snowflake, markers: MarkerData[]): MarkerData | undefined {
		for (const marker of markers) {
			if (marker.guildId === guildId) return marker; //TODO: Проверить
		}

		return undefined;
	}

	public async deleteMarkerFromUserByGuildId(userId: Snowflake, guildId: Snowflake): Promise<UpdateResult | null> {
		const userMarkersData = await this.getByUserId(userId);
		if (!userMarkersData) return null;

		userMarkersData.markers = userMarkersData.markers.filter((marker) => (marker.guildId !== guildId));

		return await this._collection.updateOne(
			{ userId },
			{ $set: { userMarkersData } },
			{ upsert: false }
		);
	}
}

interface UserMarkersBase {
	userId: Snowflake;
	markers: MarkerData[];
}

export interface MarkerData {
	guildId: Snowflake;
	markerType: MarkerTypes
	reason: string;
}

export enum MarkerTypes {
	BLACK = -3,
	RED,
	YELLOW,
	GREEN = 1
}
