import { EmbedBuilder } from "discord.js"
import { TextsLocalizationsIds, getLocalizationForText, MarkerTypes, LocalizationsLanguages, markersColors, getLocalizationForEmbed, EmbedsLocalizationsIds } from "../../../index.js";

export class MarkerEmbedBuilder extends EmbedBuilder {
	constructor (
		language: LocalizationsLanguages,
		integrityPoint: number,
		markerType: MarkerTypes,
		reason: string,
		guildName: string
	) {
		const normalizedReason = reason.length > 4056 ? `${reason.substring(0, 4053)}...` : reason.substring(0, 4053);
		const embed = getLocalizationForEmbed({
			embedId: EmbedsLocalizationsIds.USER_MARKERS_INFO_MARKER_INFO_EMBED,
			language: language,
			replaceValues: {
				guildName: guildName,
				integrityPoint: String(integrityPoint),
				reason: normalizedReason
			}
		}).setColor(markersColors[markerType]);
		super(embed.toJSON());
	}

}
