import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, Guild, GuildMember, RepliableInteraction } from "discord.js";
import { LocalizationsLanguages, MarkerEmbedBuilder, MarkersCollection, TextsLocalizationsIds, UsersMarkersSystem, Util, findGuildInClient, getLocalizationForText, getUserConfirmation, userDoNotHaveMarkersErrorHandler } from "../../../index.js"
import { ButtonWrapper, PaginationSent, PaginationWrapper } from "djs-button-pages";
import { Translator } from "ytranslate";
import { NextPageButton, PreviousPageButton  } from '@djs-button-pages/presets';

export class MarkersInfoInteraction {
	private _type: 'general' | 'markers' = 'general'; 

	constructor(
		private _member: GuildMember,
		private _interaction: RepliableInteraction,
		private _markers: MarkersCollection,
		private _language: LocalizationsLanguages
	) {}

	public async sendInfo() {
		const markersLength = Object.values(this._markers.getAllMarkers(this._interaction.guild?.id)).length;

		if (markersLength <= 0) {
			return userDoNotHaveMarkersErrorHandler(this._member.user, this._interaction, this._language);
		} else if (this._type === 'general') {
			this._interaction.editReply({
				content: '',
				embeds: this._getEmbendForGeneral(),
				components: this._getButtonsForGeneral()
			});

			const reply = await this._interaction.fetchReply();
			const interaction = await reply.awaitMessageComponent({ componentType: ComponentType.Button });
			await interaction.deferUpdate();

			if (interaction.customId === 'markers_info') this._changeType();
			else if (interaction.customId === 'remove_marker') this._removeMarker();
			else if (interaction.customId === 'change_marker') UsersMarkersSystem.addNewMarkerInteraction(this._member.user, this._interaction);
			else if (interaction.customId === 'add_marker') UsersMarkersSystem.addNewMarkerInteraction(this._member.user, this._interaction);
		} else {
			const pagination = new PaginationWrapper()
				.setButtons(this._getButtonsForPagination())
				.setEmbeds(await this._getEmbedsForMarkers());
			await pagination.interactionReply(this._interaction);
		}
	}

	private async _removeMarker(): Promise<void> {
		const answer = await getUserConfirmation(
			this._interaction, 
			{
				content: getLocalizationForText(
					TextsLocalizationsIds.USER_MARKERS_REMOVE_MARKER_CONFIRMATION,
					this._language
				),
				language: this._language
			}
		);
		
		if (answer === 'confirm') {
			await this._markers.removeMarker(this._interaction.guild?.id ?? '');
			this._interaction.editReply({ content: getLocalizationForText(
				TextsLocalizationsIds.USER_MARKERS_REMOVE_MARKER_SUCCESS,
				this._language
			) });
		}
		else {
			return this.sendInfo();
		}
	}

	private _changeType(): void {
		this._type = (this._type === 'general' ? 'markers' : 'general');
		this.sendInfo();
	}

	private _getEmbendForGeneral(): EmbedBuilder[] {
		const userIntegrityLevel = this._markers.getUserIntegrityLevel(this._interaction.guild?.id);
		const normalizedIntegrityLevel = userIntegrityLevel + (3 * 1000);
		const markersLength = Object.values(this._markers.getAllMarkers(this._interaction.guild?.id)).length;

		const embed = new EmbedBuilder();
		embed
			.setTitle(
				getLocalizationForText(
					TextsLocalizationsIds.USER_MARKERS_INFO_GENERAL_INFO_EMBED_TITLE,
					this._language
				).replace('{USER}', this._member.nickname ?? this._member.user.username)
			)
			.setFields([
				{
					name: getLocalizationForText(TextsLocalizationsIds.USER_MARKERS_INFO_MARKERS_COUNT_FIELD, this._language),
					value: `${markersLength}`,
					inline: true
				},
				{
					name: getLocalizationForText(TextsLocalizationsIds.USER_MARKERS_INFO_INTEGRITY_FIELD, this._language),
					value: `${userIntegrityLevel}`,
					inline: true
				},
				{
					name: getLocalizationForText(TextsLocalizationsIds.USER_MARKERS_INFO_INTEGRITY_SCALE_FIELD, this._language),
					value: `**-3000** ${Util.createPercentBar({ length: 32, firstValue: normalizedIntegrityLevel, secondValue: 4000 - normalizedIntegrityLevel })} **1000**`
				}
			]);

		return [embed];
	}

	private _getButtonsForGeneral(): [ActionRowBuilder<ButtonBuilder>] {
		const row: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder();

		row.addComponents([
			new ButtonBuilder()
				.setCustomId('markers_info')
				.setStyle(ButtonStyle.Secondary)
				.setLabel(getLocalizationForText(TextsLocalizationsIds.USER_MARKERS_INFO_LIST_OF_MARKERS_BUTTON, this._language)),
		].concat(
			(
				this._markers.hasMarkerInGuild(this._interaction.guild?.id ?? '')
				? [
					new ButtonBuilder()
						.setCustomId('remove_marker')
						.setStyle(ButtonStyle.Danger)
						.setLabel(getLocalizationForText(TextsLocalizationsIds.USER_MARKERS_INFO_REMOVE_MARKER_BUTTON, this._language)),
					new ButtonBuilder()
						.setCustomId('change_marker')
						.setStyle(ButtonStyle.Primary)
						.setLabel(getLocalizationForText(TextsLocalizationsIds.USER_MARKERS_INFO_CHANGE_MARKER_BUTTON, this._language))
				]
				: [
					new ButtonBuilder()
					.setCustomId('add_marker')
					.setStyle(ButtonStyle.Success)
					.setLabel(getLocalizationForText(TextsLocalizationsIds.USER_MARKERS_INFO_ADD_MARKER_BUTTON, this._language))
				]
			)
		));

		return [row];
	}

	private async _getEmbedsForMarkers(): Promise<EmbedBuilder[]> {
		const embeds = [];

		for (const marker of Object.values(this._markers.getAllMarkers())) {
			const guild = await this._interaction.client.shard?.broadcastEval(
				findGuildInClient,
				{ context: { id: marker.guildId }
			}).catch(() => {}) as unknown as Guild[];
			if (!guild) continue;
			const translatedReason = await Translator.translate(marker.reason, { key: process.env.YANDEX_API_KEY, to: this._language.split('-')[0] });

			embeds.push(
				new MarkerEmbedBuilder(
					this._language,
					marker.integrityPoint,
					marker.type,
					translatedReason,
					guild[0].name
				)
			);
		}

		return embeds;
	}

	private _getButtonsForPagination(): ButtonWrapper[] {
		const firstMarker = Object.values(this._markers.getAllMarkers())[0];

		const setChangeMarkerStateButtonData = (pagination: PaginationSent) => {
			const hidenButton = pagination.getButtonByCustomId('change_marker_state');

			if (hidenButton) {
				const marker = Object.values(this._markers.getAllMarkers())[pagination.page];
				
				if (marker.isHiddenInGuild(this._interaction.guild?.id ?? '')) {
					hidenButton.setData({
						custom_id: 'change_marker_state',
						label: getLocalizationForText(TextsLocalizationsIds.USER_MARKERS_INFO_UNHIDE_MARKER, this._language),
						style: ButtonStyle.Success
					});
				} else {
					hidenButton.setData({
						custom_id: 'change_marker_state',
						label: getLocalizationForText(TextsLocalizationsIds.USER_MARKERS_INFO_HIDE_MARKER, this._language),
						style: ButtonStyle.Danger
					});
				}
			}
		};

		return [
			new PreviousPageButton({
				custom_id: 'prev_page',
				emoji: '◀',
				style: ButtonStyle.Secondary
			})
				.setAction((pagination) => {
					pagination.setPage(pagination.page - 1);

					setChangeMarkerStateButtonData(pagination);

					return pagination.update();
				}),

			new NextPageButton({
				custom_id: 'next_page',
				emoji: '▶',
				style: ButtonStyle.Secondary
			})
				.setAction((pagination) => {
					pagination.setPage(pagination.page + 1);

					setChangeMarkerStateButtonData(pagination);

					return pagination.update();
				}),

			new ButtonWrapper({
				custom_id: 'general_info',
				label: getLocalizationForText(TextsLocalizationsIds.USER_MARKERS_INFO_GENERAL_INFO, this._language),
				style: ButtonStyle.Primary
			})
				.setAction(async (pagination) => {
					pagination.stop();
					return this._changeType();
				})
				.setSwitch(() => (false)),
				
			new ButtonWrapper({
				custom_id: 'change_marker_state',
				label: (
					firstMarker.isHiddenInGuild(this._interaction.guild?.id ?? '')
					? getLocalizationForText(TextsLocalizationsIds.USER_MARKERS_INFO_UNHIDE_MARKER, this._language)
					: getLocalizationForText(TextsLocalizationsIds.USER_MARKERS_INFO_HIDE_MARKER, this._language)
				),
				style: (
					firstMarker.isHiddenInGuild(this._interaction.guild?.id ?? '')
					? ButtonStyle.Success
					: ButtonStyle.Danger
				)
			})
				.setAction(async (pagination) => {
					const marker = Object.values(this._markers.getAllMarkers())[pagination.page];
					if (marker.isHiddenInGuild(this._interaction.guild?.id ?? '')) await marker?.unhide(this._interaction.guild?.id);
					else await marker?.hide(this._interaction.guild?.id);

					setChangeMarkerStateButtonData(pagination);

					pagination.update();
				})
				.setSwitch((pagination) => {
					const marker = Object.values(this._markers.getAllMarkers())[pagination.page];

					if (marker.guildId === this._interaction.guild?.id) return true;
					else return false;
				})
		];
	}
}
