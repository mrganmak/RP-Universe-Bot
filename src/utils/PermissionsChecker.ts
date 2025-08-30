import { GuildChannel, GuildMember, PermissionResolvable, PermissionsBitField } from "discord.js";

export class PermissionsChecker {
	public static isMemberHasMissingPermissions(neededPermissions: PermissionResolvable[], targetMember: GuildMember): boolean {
		return (PermissionsChecker._getMissingPermissions(neededPermissions, targetMember.permissions).length > 0);
	}

	public static getMemberMissingPermissions(neededPermissions: PermissionResolvable[], targetMember: GuildMember): ReturnType<PermissionsBitField['toArray']> {
		return PermissionsChecker._getMissingPermissions(neededPermissions, targetMember.permissions);
	}

	public static isMemberHasMissingPermissionsInChannel(neededPermissions: PermissionResolvable[], targetMember: GuildMember, targetChannel: GuildChannel): boolean {
		return (PermissionsChecker._getMissingPermissions(neededPermissions, targetChannel.permissionsFor(targetMember)).length > 0);
	}

	public static getMissingPermissionsInChannel(neededPermissions: PermissionResolvable[], targetMember: GuildMember, targetChannel: GuildChannel): ReturnType<PermissionsBitField['toArray']> {
		return PermissionsChecker._getMissingPermissions(neededPermissions, targetChannel.permissionsFor(targetMember));
	}

	private static _getMissingPermissions(neededPermissions: PermissionResolvable[], memberPermissions: PermissionsBitField): ReturnType<PermissionsBitField['toArray']> {
		const missingPermissions: PermissionResolvable[] = [];

		for (const permission of neededPermissions) {
			if (!memberPermissions.has(permission)) missingPermissions.push(permission);
		}

		return new PermissionsBitField(missingPermissions).toArray();
	}
}
