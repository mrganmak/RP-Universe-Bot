import { ArgsOf, Discord, On } from "discordx";

@Discord()
class onGuildDelete {
	@On({ event: 'guildDelete' })
	async onGuildDelete([guild]: ArgsOf<'guildDelete'>) {
		
	}
}
