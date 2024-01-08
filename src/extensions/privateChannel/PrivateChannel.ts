import { ChannelType, GuildChannelCreateOptions, GuildMember, OverwriteResolvable, PermissionFlagsBits, PermissionOverwriteOptions, PermissionResolvable, Snowflake, TextChannel, VoiceChannel } from "discord.js";

export class PrivateChannel<T extends PrivateChannelTypes> {
	public static async create<T extends PrivateChannelTypes>(type: T, name: string, owner: GuildMember, adminsRolesId: Snowflake[], parent?: Snowflake): Promise<PrivateChannel<PrivateChannelTypes>> {
		const channel = await owner.guild.channels.create({
			name,
			type: privateChannelsCreateTypes[type],
			parent,
			permissionOverwrites: PrivateChannel._getPermissions(type, owner, adminsRolesId),
		}) as unknown as PrivateChannelsTypesToDiscordTypes[T];

		return new PrivateChannel(type, owner, adminsRolesId, channel);
	}

	private static _getPermissions(type: PrivateChannelTypes, owner: GuildMember, adminsRolesId: Snowflake[], state: boolean = true): OverwriteResolvable[] {
		const createMembersPermissions = privateChannelCreateMembersPermissions[type];
		const permissionOverwrites: OverwriteResolvable[] = [
			PrivateChannel._getOwnerPermissions(type, owner, state),
			{ id: owner.guild.id, deny: createMembersPermissions.everyone.deny },
		];

		for (const adminRoleId of adminsRolesId) {
			permissionOverwrites.push({ id: adminRoleId, allow: createMembersPermissions.admins.allow });
		}

		return permissionOverwrites;
	}

	private static _getOwnerPermissions(type: PrivateChannelTypes, owner: GuildMember, state: boolean = true): OverwriteResolvable {
		const createMembersPermissions = privateChannelCreateMembersPermissions[type];

		return(
			state
			? { id: owner.id, allow: createMembersPermissions.owner.allow }
			: { id: owner.id, deny: createMembersPermissions.owner.allow }
		);
	}

	constructor(
		private readonly _type: T,
		private _owner: GuildMember,
		private _adminsRolesId: Snowflake[],
		public readonly channel: PrivateChannelsTypesToDiscordTypes[T],
	) {}

	public get id(): Snowflake {
		return this.channel.id;
	}

	public async close(): Promise<void> {
		const permissions = this.channel.permissionOverwrites;

		permissions.set(PrivateChannel._getPermissions(this._type, this._owner, this._adminsRolesId, false));
	}

	public async open(): Promise<void> {
		const permissions = this.channel.permissionOverwrites;

		permissions.set(PrivateChannel._getPermissions(this._type, this._owner, this._adminsRolesId));
	}

	public async delete(): Promise<void> {
		await this.channel.delete();
	}

	public isText(): this is PrivateChannel<PrivateChannelTypes.TEXT> {
		return (this._type === PrivateChannelTypes.TEXT);
	}

	public isVoice(): this is PrivateChannel<PrivateChannelTypes.VOICE> {
		return (this._type === PrivateChannelTypes.VOICE);
	}
}

export enum PrivateChannelTypes {
	TEXT = ChannelType.GuildText,
	VOICE = ChannelType.GuildVoice,
}

const privateChannelCreateMembersPermissions: PrivateChannelsCreateMembersPermissions = {
	[PrivateChannelTypes.TEXT]: {
		everyone: { deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
		owner: { allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
		admins: { allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
	},
	[PrivateChannelTypes.VOICE]: {
		everyone: { deny: [PermissionFlagsBits.ViewChannel] },
		owner: { allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Speak] },
		admins: { allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Speak] },
	}
}

export interface PrivateChannelsTypesToDiscordTypes {
	[PrivateChannelTypes.TEXT]: TextChannel;
	[PrivateChannelTypes.VOICE]: VoiceChannel;
}

const privateChannelsCreateTypes: PrivateChannelsCreateTypes = {
	[PrivateChannelTypes.TEXT]: ChannelType.GuildText,
	[PrivateChannelTypes.VOICE]: ChannelType.GuildVoice,
}

type PrivateChannelsCreateTypes = {
	[Key in PrivateChannelTypes]: GuildChannelCreateOptions['type'];
}

type PrivateChannelsCreateMembersPermissions = {
	[Key in PrivateChannelTypes]: PrivateChannelCreateMembersPermissions;
}

interface PrivateChannelCreateMembersPermissions {
	owner: PrivateChannelCreateMemberPermissions;
	everyone: PrivateChannelCreateMemberPermissions;
	admins: PrivateChannelCreateMemberPermissions;
}

interface PrivateChannelCreateMemberPermissions {
	allow?: PermissionResolvable[];
	deny?: PermissionResolvable[];
}
