import { Client, Guild, GuildEmoji } from "discord.js";

export function findEmojiInClient(clinet: Client, { id }: { id: string }): GuildEmoji | null {
	return (clinet.emojis.cache.get(id) ?? null);
}

export function findGuildInClient(clinet: Client, { id }: { id: string }): Guild | null {
	return (clinet.guilds.cache.get(id) ?? null);
}
