import { Channel, Client, Guild, GuildEmoji, Message, MessageCreateOptions, Snowflake } from "discord.js";

export function findEmojiInClient(clinet: Client, { id }: { id: string }): GuildEmoji | null {
	return (clinet.emojis.cache.get(id) ?? null);
}

export function findGuildInClient(clinet: Client, { id }: { id: string }): Guild | null {
	return (clinet.guilds.cache.get(id) ?? null);
}

export function findChannelInClient(clinet: Client, { guildId, channelId }: { guildId: string, channelId: Snowflake }): Channel | null {
	const guild = (clinet.guilds.cache.get(guildId) ?? null);
	const channel = (guild ? (guild.channels.cache.get(channelId) ?? null) : null);

	return channel;
}

export function sendMessageIntoChannel(clinet: Client, options: SendMessageIntoChannelOptions): Promise<Message> | null {
	const guild = (clinet.guilds.cache.get(options.guildId) ?? null);
	const channel = (guild ? (guild.channels.cache.get(options.channelId) ?? null) : null);

	if (!channel?.isTextBased()) return null;
	return channel.send(options.messageOptions);
}

interface SendMessageIntoChannelOptions {
	guildId: string;
	channelId: Snowflake;
	messageOptions: MessageCreateOptions
}
