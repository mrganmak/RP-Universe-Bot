import { ArgsOf, Discord, On } from "discordx";
import { MessageReSender, MessageThreadCreator } from "../../index.js";
import { Events } from "discord.js";

@Discord()
class onMessageCreate {
	@On({ event: Events.MessageCreate })
	async onMessageCreate([message]: ArgsOf<Events.MessageCreate>) {
		if (message.author.bot) return;

		if (await MessageReSender.hasMassageNeedToReSend(message)) return MessageReSender.handleMessage(message);
		if (await MessageThreadCreator.hasMassageNeedToCreateAThread(message)) return MessageThreadCreator.handleMessage(message);
	}
}
