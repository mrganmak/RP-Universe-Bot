import { generateApiKey } from "generate-api-key";
import GuildsIdentifiersBase from "../Databases/bases_list/GuildsIdentifiersBase.js";

export default class TokenGenerator {
	public static async createTokenForGuild(): Promise<string> {
		const database = new GuildsIdentifiersBase();
		const token = generateApiKey({ method: 'string' });
	
		if (await database.getByToken(Array.isArray(token) ? token[0] : token)) return await this.createTokenForGuild();
		return (Array.isArray(token) ? token[0] : token);
	}
}
