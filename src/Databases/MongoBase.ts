import { MongoClient, Db, Collection, Document, WithId } from "mongodb";

export abstract class BaseCollection<T extends Document> {
	protected static _instance: BaseCollection<any>;
	protected _database!: typeof MongoBase['database'];
	protected _collection!: Collection<T>;
	protected _localCache: Map<string, WithId<T>> = new Map();

	constructor(collectionName: string) {
		const constructor = this.constructor as typeof BaseCollection;
		if (constructor._instance) return constructor._instance;
		constructor._instance = this;

		this._database = MongoBase.database;
		this._collection = this._database.collection<T>(collectionName);
	}

	protected async initCache(): Promise<void> {
		await this._collection.find().forEach((doc) => {
			this._localCache.set(this.getCacheKey(doc), doc);
		});
	}

	protected abstract getCacheKey(doc: WithId<T>): string;

	protected async getFromCache(key: string): Promise<WithId<T> | null> {
		return this._localCache.get(key) || null;
	}

	protected setToCache(key: string, value: WithId<T>): void {
		this._localCache.set(key, value);
	}

	protected removeFromCache(key: string): void {
		this._localCache.delete(key);
	}

	protected clearCache(): void {
		this._localCache.clear();
	}
}

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
