import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Events, GuildMember } from "discord.js";
import { ArgsOf, Discord, On } from "discordx";
import { getGuildLanguage, getLocalizationForEmbed, EmbedsLocalizationsIds, UsersMarkersSystem, userDoNotHaveMarkersErrorHandler, MarkersInfoInteraction, PermissionsChecker, getLocalizationForText, TextsLocalizationsIds } from "../../index.js";

@Discord()
class onGuildMemberAdd {
	@On({ event: Events.GuildMemberAdd })
	async onGuildMemberAdd([member]: ArgsOf<Events.GuildMemberAdd>) {
		const guild = member.guild;
		const channel = guild.systemChannel;

		if (!channel) return;
		
		if (PermissionsChecker.isMemberHasMissingPermissionsInChannel(
			['SendMessages', 'ViewChannel'],
			guild.members.me!,
			channel
		)) return;

		const language = await getGuildLanguage(guild.id);
		
		const embed = getLocalizationForEmbed({
			embedId: EmbedsLocalizationsIds.WELCOME_MESSAGE,
			language,
			replaceValues: {
				user: member.toString()
			}
		});

		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId(`show_markers`)
					.setLabel(getLocalizationForText(
						TextsLocalizationsIds.WELCOME_MESSAGE_SHOW_MARKERS_BUTTON,
						language
					))
					.setStyle(ButtonStyle.Primary)
			);

		const message = await channel.send({ embeds: [embed], components: [row] });

		try {
			const interaction = await message.awaitMessageComponent({ time: 24 * 60 * 60 * 1000 });
			
			if (interaction.customId === 'show_markers') {
				const markers = await UsersMarkersSystem.getUserMarkersCollection(member.user);
				
				if (!markers) {
					return userDoNotHaveMarkersErrorHandler(member.user, interaction, language);
				}

				const info = new MarkersInfoInteraction(member, interaction, markers, language);
				info.sendInfo();
			}
		} catch (error) {
			// Игнорируем ошибку таймаута
		} finally {
			await message.edit({ components: [] });
		}
	}
}
