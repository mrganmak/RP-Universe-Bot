import { GuildMember, Message, TextChannel, VoiceChannel } from "discord.js";
import { PrivateChannel, PrivateChannelTypes } from "../../../extensions/index.js";
import { GuildsTicketsBase } from "../../../Databases/index.js";
import { ButtonsPanel } from "../../../extensions/index.js";

export class Ticket {
	private _base = new GuildsTicketsBase();

	constructor(
		public readonly author: GuildMember,
		public readonly textChannel: PrivateChannel<PrivateChannelTypes.TEXT>,
		public readonly buttonsPanel: ButtonsPanel,
		private _ticketNumber: number,
		private _message: Message,
		private _voiceChannel?: PrivateChannel<PrivateChannelTypes.VOICE>
	) {}

	public get voiceChannel(): PrivateChannel<PrivateChannelTypes.VOICE> | undefined {
		return this._voiceChannel;
	}

	public get ticketNumber(): number {
		return this._ticketNumber;
	}

	public async close(): Promise<void> {
		await this.textChannel.close();
		if (this._voiceChannel) {
			await this._voiceChannel.close();
		}
	}

	public async open(): Promise<void> {
		await this.textChannel.open();
		if (this._voiceChannel) {
			await this._voiceChannel.open();
		}
	}

	public async remove(): Promise<void> {
		await this.textChannel.delete();
		if (this._voiceChannel) {
			await this._voiceChannel.delete();
		}
		await this._base.deleteTicketFromGuildByChannelId(this.author.guild.id, this.textChannel.id);
	}

	public async createVoiceChannel(): Promise<void> {
		if (this._voiceChannel) return;

		const voiceChannel = await PrivateChannel.create(
			PrivateChannelTypes.VOICE,
			`voice-${this._ticketNumber}`,
			this.author,
			this.textChannel.allowedRoles,
			this.textChannel.categoryId
		);

		this._voiceChannel = voiceChannel;
		await this._base.changeTicketForGuild(this.author.guild.id, {
			authorId: this.author.id,
			ticketChannelId: this.textChannel.id,
			buttonsPanelCategory: this.buttonsPanel.categoryName,
			ticketVoiceChannelId: voiceChannel.id
		});
	}
}
