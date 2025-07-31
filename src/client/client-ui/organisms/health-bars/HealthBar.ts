/**
 * @file src/client/client-ui/organisms/health-bars/HealthBar.ts
 * @module HealthBar
 * @layer Client/UI/Organisms
 * @description Health, mana, and stamina bar UI component using Fusion
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-07-31 - Initial health system implementation
 */

import Fusion, { Children, Computed, New, Value } from "@rbxts/fusion";
import { ProgressBar } from "../../atoms";
import { PlayerResources } from "shared/types/health-types";

export interface HealthBarProps {
	resources: Fusion.StateObject<PlayerResources>;
	size?: UDim2;
	position?: UDim2;
}

/**
 * Creates a health bar component with health, mana, and stamina bars
 */
export function HealthBar(props: HealthBarProps): Frame {
	const size = props.size || new UDim2(0, 300, 0, 80);
	const position = props.position || new UDim2(0, 20, 0, 20);

	// Individual bar creation helper using ProgressBar atom
	const createResourceBar = (
		name: string,
		color: Color3,
		currentValue: Fusion.Computed<number>,
		maxValue: Fusion.Computed<number>,
		yOffset: number,
	): Frame => {
		return ProgressBar({
			Name: `${name}Bar`,
			Size: new UDim2(1, -20, 0, 20),
			Position: new UDim2(0, 10, 0, yOffset),
			progress: currentValue,
			maxValue: maxValue,
			fillColor: color,
			showLabel: true,
			labelText: Computed(() => {
				const current = math.floor(currentValue.get());
				const max = math.floor(maxValue.get());
				return `${name}: ${current}/${max}`;
			}),
		});
	};

	return New("Frame")({
		Name: "HealthBarContainer",
		Size: size,
		Position: position,
		BackgroundColor3: Color3.fromRGB(30, 30, 30),
		BackgroundTransparency: 0.2,
		BorderSizePixel: 2,
		BorderColor3: Color3.fromRGB(80, 80, 80),

		[Children]: {
			// Health Bar (Red)
			HealthBar: createResourceBar(
				"Health",
				Color3.fromRGB(220, 50, 50),
				Computed(() => props.resources.get().health),
				Computed(() => props.resources.get().maxHealth),
				5,
			),

			// Mana Bar (Blue)
			ManaBar: createResourceBar(
				"Mana",
				Color3.fromRGB(50, 50, 220),
				Computed(() => props.resources.get().mana),
				Computed(() => props.resources.get().maxMana),
				30,
			),

			// Stamina Bar (Yellow)
			StaminaBar: createResourceBar(
				"Stamina",
				Color3.fromRGB(220, 220, 50),
				Computed(() => props.resources.get().stamina),
				Computed(() => props.resources.get().maxStamina),
				55,
			),
		},
	});
}
