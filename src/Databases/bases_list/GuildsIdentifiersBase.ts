import { Snowflake } from "discord.js";
import MongoBase from "../MongoBase.js";
import { Collection, DeleteResult, InsertOneResult } from "mongodb";

export default class GuildsIdentifiersBase {
	private static _instance: GuildsIdentifiersBase | undefined;

	private _database!: typeof MongoBase['database'];
	private _collection!: Collection<IGuildIdentifiersBase>;

	constructor() {
		if (GuildsIdentifiersBase._instance) return GuildsIdentifiersBase._instance;
		GuildsIdentifiersBase._instance = this;

		this._database = MongoBase.database;
		this._collection = this._database.collection<IGuildIdentifiersBase>(process.env.DB_GUILDS_IDENTIFIRES);
	}

	public async getByGuildId(id: Snowflake): Promise<IGuildIdentifiersBase | null> {
		return await this._collection.findOne({ guildId: id });
	}

	public async getByToken(token: string): Promise<IGuildIdentifiersBase | null> {
		return await this._collection.findOne({ token });
	}

	public async addIdentifier(identifier: IGuildIdentifiersBase): Promise<InsertOneResult<IGuildIdentifiersBase>> {
		const identifierById = await this.getByGuildId(identifier.guildId);
		const identifierByToken = await this.getByToken(identifier.token);

		if (identifierById || identifierByToken) throw new Error('I cant add identifier with same property');

		return await this._collection.insertOne(identifier);
	}

	public async deleteIdentifierByGuildId(id: Snowflake): Promise<DeleteResult> {
		return await this._collection.deleteOne({ guildId: id });
	}

	public async deleteIdentifierByToken(token: string): Promise<DeleteResult> {
		return await this._collection.deleteOne({ token });
	}
}

interface IGuildIdentifiersBase {
	guildId: Snowflake;
	token: string;
}
