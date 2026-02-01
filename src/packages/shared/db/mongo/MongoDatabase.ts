import type { Db, MongoClient } from "mongodb";

export class MongoDatabase {
	private static _db: Db | null = null;

	static initialize(client: MongoClient, dbName = "app") {
		if (!MongoDatabase._db) MongoDatabase._db = client.db(dbName);
	}

	static get database(): Db {
		if (!MongoDatabase._db) throw new Error("MongoDatabase is not initialized");
		return MongoDatabase._db;
	}
}
