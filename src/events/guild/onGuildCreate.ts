import { ArgsOf, Discord, On } from "discordx";
import { GuildsIdentifiersBase, TokenGenerator } from "../../index.js";

@Discord()
class onGuildCreate {
	@On({ event: 'guildCreate' })
	async onGuildCreate([guild]: ArgsOf<'guildCreate'>) {
		const database = new GuildsIdentifiersBase();
		const guildIdentifier = await database.getByGuildId(guild.id);
		if (guildIdentifier) return;

		const token = await TokenGenerator.createTokenForGuild();
		const guildId = guild.id;

		database.addIdentifier({ token, guildId });
	}
}
