import { ArgsOf, Discord, On } from "discordx";
import { GuildsIdentifiersBase, TokenGenerator } from "../../index.js";
import { Events } from "discord.js";

@Discord()
class onGuildCreate {
	@On({ event: Events.GuildCreate })
	async onGuildCreate([guild]: ArgsOf<Events.GuildCreate>) {
		const database = new GuildsIdentifiersBase();
		const guildIdentifier = await database.getByGuildId(guild.id);
		if (guildIdentifier) return;

		const token = await TokenGenerator.createTokenForGuild();
		const guildId = guild.id;

		database.addIdentifier({ token, guildId });
	}
}
