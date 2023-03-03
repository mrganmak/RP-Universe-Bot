import { generateApiKey } from "generate-api-key";
import GuildsIdentifiersBase from "../Databases/bases_list/GuildsIdentifiersBase.js";
import { createHash } from "crypto";

export default class TokenGenerator {
	public static async createTokenForGuild(): Promise<string> {
		const database = new GuildsIdentifiersBase();
		const token = generateApiKey({ method: 'string' });
	
		if (await database.getByToken(Array.isArray(token) ? token[0] : token)) return await this.createTokenForGuild();
		return (Array.isArray(token) ? token[0] : token);
	}

	public static async createAPIKey(): Promise<APIKey> {
		const database = new GuildsIdentifiersBase();
		const key = generateApiKey({ method: 'string', min: 45, max: 60 });
		const keyHash = createHash('sha512').update(Array.isArray(key) ? key[0] : key).digest('hex');

		if (await database.getByAPIKey(keyHash)) return await this.createAPIKey();
		return { key: (Array.isArray(key) ? key[0] : key), hash: keyHash };
	}
}

interface APIKey {
	key: string;
	hash: string;
}
