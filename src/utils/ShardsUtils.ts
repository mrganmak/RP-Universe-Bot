import { Client, GuildEmoji } from "discord.js";

export function findEmojiInClient(clinet: Client, { id }: { id: string }): GuildEmoji | null {
	return (clinet.emojis.cache.get(id) ?? null);
}
