import { GuildChannel, GuildMember, PermissionResolvable, PermissionsBitField } from "discord.js";

export class PermissionsChecker {
	public static checkOnMissingPermissions(neededPermissions: PermissionResolvable[], targetMember: GuildMember, targetChannel: GuildChannel): boolean {
		return (PermissionsChecker._getMissingPermissions(neededPermissions, targetMember, targetChannel).length > 0);
	}

	public static getMissingPermissions(neededPermissions: PermissionResolvable[], targetMember: GuildMember, targetChannel: GuildChannel): ReturnType<PermissionsBitField['toArray']> {
		return PermissionsChecker._getMissingPermissions(neededPermissions, targetMember, targetChannel);
	}

	private static _getMissingPermissions(neededPermissions: PermissionResolvable[], targetMember: GuildMember, targetChannel: GuildChannel): ReturnType<PermissionsBitField['toArray']> {
		const permissionsForMember = targetChannel.permissionsFor(targetMember);
		const missingPermissions: PermissionResolvable[] = [];

		for (const permission of neededPermissions) {
			if (!permissionsForMember.has(permission)) missingPermissions.push(permission);
		}

		return new PermissionsBitField(missingPermissions).toArray();
	}
}
