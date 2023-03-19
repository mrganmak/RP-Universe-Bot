import { Snowflake } from "discord.js";
import MongoBase from "../MongoBase.js";
import { Collection, DeleteResult, InsertOneResult, UpdateResult } from "mongodb";

export default class GuildsIdentifiersBase {
	private static _instance: GuildsIdentifiersBase | undefined;

	private _database!: typeof MongoBase['database'];
	private _collection!: Collection<GuildIdentifiersBase>;

	constructor() {
		if (GuildsIdentifiersBase._instance) return GuildsIdentifiersBase._instance;
		GuildsIdentifiersBase._instance = this;

		this._database = MongoBase.database;
		this._collection = this._database.collection<GuildIdentifiersBase>(process.env.DB_GUILDS_IDENTIFIRES);
	}

	public async getByGuildId(guildId: Snowflake): Promise<GuildIdentifiersBase | null> {
		return await this._collection.findOne({ guildId });
	}

	public async getByToken(token: string): Promise<GuildIdentifiersBase | null> {
		return await this._collection.findOne({ token });
	}

	public async addIdentifier(identifier: GuildIdentifiersBase): Promise<InsertOneResult<GuildIdentifiersBase>> {
		const identifierById = await this.getByGuildId(identifier.guildId);
		const identifierByToken = await this.getByToken(identifier.token);

		if (identifierById || identifierByToken) throw new Error('I cant add identifier with same property');

		return await this._collection.insertOne(identifier);
	}

	public async deleteIdentifierByGuildId(guildId: Snowflake): Promise<DeleteResult> {
		return await this._collection.deleteOne({ guildId });
	}

	public async deleteIdentifierByToken(token: string): Promise<DeleteResult> {
		return await this._collection.deleteOne({ token });
	}

	public async addAPIKeyForGuild(guildId: Snowflake, APIKey: string): Promise<UpdateResult> {
		return await this._collection.updateOne(
			{ guildId },
			{ $set: { APIKey } },
			{ upsert: false }
		);
	}

	public async getByAPIKey(APIKey: string): Promise<GuildIdentifiersBase | null> {
		return await this._collection.findOne({ APIKey });
	}
}

interface GuildIdentifiersBase {
	guildId: Snowflake;
	token: string;
	APIKey?: string;
}
