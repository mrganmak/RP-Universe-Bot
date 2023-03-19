import { GuildChannel, GuildMember, PermissionResolvable, PermissionsBitField } from "discord.js";

export class PermissionsChecker {
	public static checkOnMissingPermissions(neededPermissions: Array<PermissionResolvable>, targetMember: GuildMember, targetChannel: GuildChannel): boolean {
		return this._getMissingPermissions(neededPermissions, targetMember, targetChannel).length > 0;
	}

	public static getMissingPermissions(neededPermissions: Array<PermissionResolvable>, targetMember: GuildMember, targetChannel: GuildChannel): ReturnType<PermissionsBitField['toArray']> {
		return this._getMissingPermissions(neededPermissions, targetMember, targetChannel);
	}

	private static _getMissingPermissions(neededPermissions: Array<PermissionResolvable>, targetMember: GuildMember, targetChannel: GuildChannel): ReturnType<PermissionsBitField['toArray']> {
		const permissionsForMember = targetChannel.permissionsFor(targetMember);
		const missingPermissions: Array<PermissionResolvable> = [];

		for (const permission of neededPermissions) {
			if (!permissionsForMember.has(permission)) missingPermissions.push(permission);
		}

		return new PermissionsBitField(missingPermissions).toArray();
	}
}
