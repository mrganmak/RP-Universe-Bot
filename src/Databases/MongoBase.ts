import { MongoClient, Db } from "mongodb";

export class MongoBase {
	private static _client: MongoClient;
	public static database: Db;

	public static async initBase(): Promise<void> {
		this._client = new MongoClient(process.env.DB_URL)
		await this._client.connect();
		this.database = this._client.db(process.env.DB_NAME);

		console.log(`Connected to ${this.database.databaseName} database`);
	}
}
