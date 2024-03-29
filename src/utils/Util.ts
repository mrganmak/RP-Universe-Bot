import { Guild, GuildMember, Snowflake, User } from "discord.js";
import { devMode } from "../index.js";

export class Util {
	private constructor() {}

	public static getUserAvatarUrl(user: User): string {
		return user.avatarURL() ?? user.defaultAvatarURL;
	}

	public static createPercentBar({ length, firstValue, secondValue }: IPercentBarSettings): string {
		if (firstValue < 0 || secondValue < 0 || length < 0) throw new Error('Аргументы не могут быть меньше 0');

		let percentBar = '';
		let filledSegments = (firstValue + secondValue > 0 ? Math.floor(length * firstValue / (firstValue + secondValue)) : 0);

		for (let i = 0; i < length; i++) percentBar += (filledSegments-- > 0 ? '█' : '▒');

		return `${percentBar}`;
	}

	public static debug(content: any): void {
		if (devMode) console.log(content);
	}

	public static getRandomInRange(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	public static async getMembersByRoles(guild: Guild, roleIds: Snowflake[]): Promise<GuildMember[] | undefined>  {
		const members: GuildMember[] = [];
		const membersIds: Snowflake[] = [];

		for(const roleId of roleIds) {
			const membersThatHaveRole = await Util.getMembersByRole(guild, roleId);
			if (!membersThatHaveRole) continue;

			for (const member of membersThatHaveRole) {
				if (membersIds.includes(member.id)) continue;

				members.push(member);
				membersIds.push(member.id);
			}
		}

		return (members.length > 0 ? members : undefined);
	}

	public static async getMembersByRole(guild: Guild, roleId: Snowflake): Promise<GuildMember[] | undefined> {
		await guild.members.fetch();
		const role = await guild.roles.fetch(roleId).catch(() => {});
		if (!role) return;

		const members = Array.from(role.members.values()).filter((member) => (!member.user.bot));

		return members;
	}

	public static async hasMemberHaveRoles(member: GuildMember, roleIds: Snowflake[]): Promise<boolean> {
		for (const roleId of roleIds) if (await Util.hasMemberHaveRole(member, roleId)) return true;
		return false;
	}

	public static async hasMemberHaveRole(member: GuildMember, roleId: Snowflake): Promise<boolean> {
		await member.fetch();

		return member.roles.cache.has(roleId);
	}

	public static filterOnlyOnlineMembers(members: GuildMember[]): GuildMember[] {
		return members.filter((member) => (member.presence?.status !== 'offline'));
	}

	public static async convertUsersArrayIntoMembersArray(users: User[], guild: Guild): Promise<GuildMember[]> {
		await guild.members.fetch();

		const members = [];

		for (const user of users) {
			const member = guild.members.cache.get(user.id);
			if (!member) continue;

			members.push(member);
		}

		return members;
	}
	
	public static randomizeArray<T>(array: T[]): T[] {
		for (const i in array) {
			const randomIndex = Util.getRandomInRange(0, array.length - 1);

			[array[i], array[randomIndex]] = [array[randomIndex], array[i]];
		}

		return array;
	}
}

interface IPercentBarSettings {
	length: number;
	firstValue: number;
	secondValue: number;
}
