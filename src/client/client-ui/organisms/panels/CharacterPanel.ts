/**
 * @file src/client/client-ui/organisms/panels/CharacterPanel.ts
 * @module CharacterPanel
 * @layer Client/UI/Organisms
 * @description Character UI window panel displaying player's persistent data including level, abilities, and resources
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-09 - Created character panel with ss-fusion integration
 */

import Fusion, { Children, Computed, ForKeys, New, Value } from "@rbxts/fusion";
import { Label, ProgressBar } from "@trembus/ss-fusion";
import { PanelWindow } from "./PanelWindow";
import { PlayerStateInstance } from "client/states";
import { ResourcesCatalog, RESOURCE_KEYS, ResourceKey } from "shared/catalogs/resources-catalog";
import { AbilityCatalog, ABILITY_KEYS, AbilityKey } from "shared/catalogs/ability-catalog";
import { HorizontalLayout, VerticalLayout, makePadding, Flex } from "../../helpers";

export interface CharacterPanelProps {
	visible?: Value<boolean>;
	onClose?: () => void;
	Position?: UDim2;
	Size?: UDim2;
}

/**
 * Individual resource display component showing current/max values with progress bar
 * Compact version for grid layout
 */
function ResourceDisplay(props: { resourceKey: ResourceKey }): Frame {
	const resourceMeta = ResourcesCatalog[props.resourceKey];
	const resourceState = PlayerStateInstance.Resources[props.resourceKey];

	const currentText = Computed(() => {
		return `${resourceState.current.get()}/${resourceState.max.get()}`;
	});

	return New("Frame")({
		Name: `Resource_${props.resourceKey}`,
		Size: new UDim2(0.5, -4, 0, 35),
		BackgroundTransparency: 1,
		[Children]: [
			VerticalLayout(2),

			// Resource name and value in horizontal layout
			New("Frame")({
				Name: "ResourceHeader",
				Size: new UDim2(1, 0, 0, 14),
				BackgroundTransparency: 1,
				LayoutOrder: 1,
				[Children]: [
					HorizontalLayout(4),

					// Resource name
					New("TextLabel")({
						Name: "ResourceName",
						Text: resourceMeta.displayName,
						Size: new UDim2(0.6, 0, 1, 0),
						BackgroundTransparency: 1,
						TextXAlignment: Enum.TextXAlignment.Left,
						TextColor3: Color3.fromRGB(255, 255, 255),
						TextSize: 12,
						Font: Enum.Font.Gotham,
						LayoutOrder: 1,
					}),

					// Current/Max text
					New("TextLabel")({
						Name: "ResourceValue",
						Text: currentText,
						Size: new UDim2(0.4, 0, 1, 0),
						BackgroundTransparency: 1,
						TextXAlignment: Enum.TextXAlignment.Right,
						TextColor3: Color3.fromRGB(180, 180, 180),
						TextSize: 10,
						Font: Enum.Font.Gotham,
						LayoutOrder: 2,
					}),
				],
			}),

			// Progress bar
			ProgressBar({
				currentValue: resourceState.current,
				maxValue: resourceState.max,
				fillColor: resourceMeta.color,
				showLabel: false,
				Size: new UDim2(1, 0, 0, 12),
				LayoutOrder: 2,
			}) as unknown as Instance,
		],
	});
}

/**
 * Individual ability display component showing ability name and level
 * Compact horizontal layout
 */
function AbilityDisplay(props: { abilityKey: AbilityKey }): Frame {
	const abilityMeta = AbilityCatalog[props.abilityKey];
	const abilityLevel = PlayerStateInstance.Abilities[props.abilityKey];

	const levelText = Computed(() => {
		return `Lv.${abilityLevel.get()}`;
	});

	return New("Frame")({
		Name: `Ability_${props.abilityKey}`,
		Size: new UDim2(0.5, -4, 0, 32),
		BackgroundColor3: Color3.fromRGB(40, 40, 44),
		BorderSizePixel: 0,
		[Children]: [
			New("UICorner")({ CornerRadius: new UDim(0, 4) }),
			makePadding(6),
			HorizontalLayout(6),

			// Ability icon
			New("ImageLabel")({
				Name: "AbilityIcon",
				Size: new UDim2(0, 20, 0, 20),
				BackgroundColor3: Color3.fromRGB(60, 60, 65),
				BorderSizePixel: 0,
				Image: abilityMeta.icon,
				ScaleType: Enum.ScaleType.Fit,
				LayoutOrder: 1,
				[Children]: [New("UICorner")({ CornerRadius: new UDim(0, 3) })],
			}),

			// Ability info container
			New("Frame")({
				Name: "AbilityInfo",
				Size: new UDim2(1, -26, 1, 0),
				BackgroundTransparency: 1,
				LayoutOrder: 2,
				[Children]: [
					VerticalLayout(0),

					// Ability name
					New("TextLabel")({
						Name: "AbilityName",
						Text: abilityMeta.displayName,
						Size: new UDim2(1, 0, 0, 12),
						BackgroundTransparency: 1,
						TextXAlignment: Enum.TextXAlignment.Left,
						TextColor3: Color3.fromRGB(255, 255, 255),
						TextSize: 11,
						Font: Enum.Font.Gotham,
						LayoutOrder: 1,
					}),

					// Ability level
					New("TextLabel")({
						Name: "AbilityLevel",
						Text: levelText,
						Size: new UDim2(1, 0, 0, 8),
						BackgroundTransparency: 1,
						TextXAlignment: Enum.TextXAlignment.Left,
						TextColor3: Color3.fromRGB(150, 150, 150),
						TextSize: 9,
						Font: Enum.Font.Gotham,
						LayoutOrder: 2,
					}),
				],
			}),
		],
	});
}

/**
 * Character Panel - displays player's persistent data in a windowed interface
 */
export function CharacterPanel(props: CharacterPanelProps): Frame {
	const visible = props.visible ?? Value(false);
	const playerLevel = PlayerStateInstance.Level;

	const levelText = Computed(() => {
		return `Level ${playerLevel.get()}`;
	});

	return PanelWindow({
		Name: "CharacterPanel",
		title: "Character",
		visible: visible,
		onClose: props.onClose,
		Size: props.Size ?? new UDim2(0, 400, 0, 450),
		Position: props.Position ?? new UDim2(0.5, -200, 0.5, -225),
		contentPadding: 12,
		ZIndex: 15,
		[Children]: [
			VerticalLayout(10),

			// Player Level Section - Horizontal layout with level and XP
			New("Frame")({
				Name: "LevelSection",
				Size: new UDim2(1, 0, 0, 50),
				BackgroundColor3: Color3.fromRGB(44, 44, 48),
				BorderSizePixel: 0,
				LayoutOrder: 1,
				[Children]: [
					New("UICorner")({ CornerRadius: new UDim(0, 8) }),
					makePadding(12),
					HorizontalLayout(12),

					// Level info
					New("Frame")({
						Name: "LevelInfo",
						Size: new UDim2(0.6, 0, 1, 0),
						BackgroundTransparency: 1,
						LayoutOrder: 1,
						[Children]: [
							VerticalLayout(2),

							New("TextLabel")({
								Name: "LevelTitle",
								Text: "Player Level",
								Size: new UDim2(1, 0, 0, 14),
								BackgroundTransparency: 1,
								TextXAlignment: Enum.TextXAlignment.Left,
								TextColor3: Color3.fromRGB(200, 200, 200),
								TextSize: 12,
								Font: Enum.Font.Gotham,
								LayoutOrder: 1,
							}),

							New("TextLabel")({
								Name: "LevelValue",
								Text: levelText,
								Size: new UDim2(1, 0, 0, 20),
								BackgroundTransparency: 1,
								TextXAlignment: Enum.TextXAlignment.Left,
								TextColor3: Color3.fromRGB(100, 200, 255),
								TextSize: 18,
								Font: Enum.Font.GothamBold,
								LayoutOrder: 2,
							}),
						],
					}),

					// Experience bar placeholder
					New("Frame")({
						Name: "ExperienceSection",
						Size: new UDim2(0.4, 0, 1, 0),
						BackgroundTransparency: 1,
						LayoutOrder: 2,
						[Children]: [
							VerticalLayout(2),

							New("TextLabel")({
								Name: "ExpTitle",
								Text: "Experience",
								Size: new UDim2(1, 0, 0, 14),
								BackgroundTransparency: 1,
								TextXAlignment: Enum.TextXAlignment.Right,
								TextColor3: Color3.fromRGB(200, 200, 200),
								TextSize: 12,
								Font: Enum.Font.Gotham,
								LayoutOrder: 1,
							}),

							// Experience progress bar using the Experience resource
							ProgressBar({
								currentValue: PlayerStateInstance.Resources.Experience.current,
								maxValue: PlayerStateInstance.Resources.Experience.max,
								fillColor: ResourcesCatalog.Experience.color,
								showLabel: false,
								Size: new UDim2(1, 0, 0, 12),
								LayoutOrder: 2,
							}) as unknown as Instance,
						],
					}),
				],
			}),

			// Resources Section - 2x2 Grid
			New("Frame")({
				Name: "ResourcesSection",
				Size: new UDim2(1, 0, 0, 120),
				BackgroundColor3: Color3.fromRGB(44, 44, 48),
				BorderSizePixel: 0,
				LayoutOrder: 2,
				[Children]: [
					New("UICorner")({ CornerRadius: new UDim(0, 8) }),
					makePadding(12),
					VerticalLayout(8),

					// Resources title
					New("TextLabel")({
						Name: "ResourcesTitle",
						Text: "Resources",
						Size: new UDim2(1, 0, 0, 16),
						BackgroundTransparency: 1,
						TextXAlignment: Enum.TextXAlignment.Left,
						TextColor3: Color3.fromRGB(255, 255, 255),
						TextSize: 14,
						Font: Enum.Font.GothamBold,
						LayoutOrder: 1,
					}),

					// Resources Grid Container
					New("Frame")({
						Name: "ResourcesGrid",
						Size: new UDim2(1, 0, 1, -24),
						BackgroundTransparency: 1,
						LayoutOrder: 2,
						[Children]: [
							VerticalLayout(8),

							// First row (Health, Mana)
							New("Frame")({
								Name: "ResourcesRow1",
								Size: new UDim2(1, 0, 0.5, -4),
								BackgroundTransparency: 1,
								LayoutOrder: 1,
								[Children]: [
									HorizontalLayout(8),
									ResourceDisplay({ resourceKey: "Health" }) as Instance,
									ResourceDisplay({ resourceKey: "Mana" }) as Instance,
								],
							}),

							// Second row (Stamina, Experience moved to level section)
							New("Frame")({
								Name: "ResourcesRow2",
								Size: new UDim2(1, 0, 0.5, -4),
								BackgroundTransparency: 1,
								LayoutOrder: 2,
								[Children]: [
									HorizontalLayout(8),
									ResourceDisplay({ resourceKey: "Stamina" }) as Instance,
									// Empty slot for future resource or stat
									New("Frame")({
										Name: "EmptySlot",
										Size: new UDim2(0.5, -4, 1, 0),
										BackgroundTransparency: 1,
									}),
								],
							}),
						],
					}),
				],
			}),

			// Abilities Section - 2x2 Grid
			New("Frame")({
				Name: "AbilitiesSection",
				Size: new UDim2(1, 0, 0, 120),
				BackgroundColor3: Color3.fromRGB(44, 44, 48),
				BorderSizePixel: 0,
				LayoutOrder: 3,
				[Children]: [
					New("UICorner")({ CornerRadius: new UDim(0, 8) }),
					makePadding(12),
					VerticalLayout(8),

					// Abilities title
					New("TextLabel")({
						Name: "AbilitiesTitle",
						Text: "Abilities",
						Size: new UDim2(1, 0, 0, 16),
						BackgroundTransparency: 1,
						TextXAlignment: Enum.TextXAlignment.Left,
						TextColor3: Color3.fromRGB(255, 255, 255),
						TextSize: 14,
						Font: Enum.Font.GothamBold,
						LayoutOrder: 1,
					}),

					// Abilities Grid Container
					New("Frame")({
						Name: "AbilitiesGrid",
						Size: new UDim2(1, 0, 1, -24),
						BackgroundTransparency: 1,
						LayoutOrder: 2,
						[Children]: [
							VerticalLayout(6),

							// First row (Melee, Soul-Drain)
							New("Frame")({
								Name: "AbilitiesRow1",
								Size: new UDim2(1, 0, 0.5, -3),
								BackgroundTransparency: 1,
								LayoutOrder: 1,
								[Children]: [
									HorizontalLayout(8),
									AbilityDisplay({ abilityKey: "Melee" }) as Instance,
									AbilityDisplay({ abilityKey: "Soul-Drain" }) as Instance,
								],
							}),

							// Second row (Earthquake, Ice-Rain)
							New("Frame")({
								Name: "AbilitiesRow2",
								Size: new UDim2(1, 0, 0.5, -3),
								BackgroundTransparency: 1,
								LayoutOrder: 2,
								[Children]: [
									HorizontalLayout(8),
									AbilityDisplay({ abilityKey: "Earthquake" }) as Instance,
									AbilityDisplay({ abilityKey: "Ice-Rain" }) as Instance,
								],
							}),
						],
					}),
				],
			}),
		],
	});
}
