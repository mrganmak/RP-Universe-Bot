import { MongoClient } from "mongodb";

export class MongoClientFactory {
	private static _client: MongoClient | null = null;

	static async getClient(uri: string): Promise<MongoClient> {
		if (MongoClientFactory._client) return MongoClientFactory._client;
		
		MongoClientFactory._client = await new MongoClient(uri).connect();
		return MongoClientFactory._client;
	}
}
