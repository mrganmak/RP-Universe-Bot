import { Events } from "discord.js";
import { ArgsOf, Discord, On } from "discordx";

@Discord()
class onGuildDelete {
	@On({ event: Events.GuildDelete })
	async onGuildDelete([guild]: ArgsOf<Events.GuildDelete>) {
		
	}
}
