import { EmbedBuilder } from "discord.js"
import { TextsLocalizationsIds, getLocalizationForText, MarkerTypes, LocalizationsLanguages, markersColors } from "../../../index.js";

export class MarkerEmbedBuilder extends EmbedBuilder {
	constructor (
		language: LocalizationsLanguages,
		integrityPoint: number,
		markerType: MarkerTypes,
		reason: string,
		guildName: string
	) {
		super();
		super
			.addFields([
				{
					name: getLocalizationForText(TextsLocalizationsIds.USER_MARKERS_INFO_GUILD_FIELD, language),
					value: guildName,
					inline: true
				},
				{
					name: getLocalizationForText(TextsLocalizationsIds.USER_MARKERS_INFO_IMPACT_ON_INTEGRITY_FIELD, language),
					value: `${integrityPoint}`,
					inline: true
				}
			])
			.setDescription(reason.length > 4056 ? `${reason.substring(0, 4053)}...` : reason.substring(0, 4053))
			.setColor(markersColors[markerType]);
	}

}
