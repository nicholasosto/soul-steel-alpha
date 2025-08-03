/**
 * @file src/client/client-ui/organisms/resource-bars/ResourceBarDTO.ts
 * @module ResourceBarDTO
 * @layer Client/UI/Organisms
 * @description DTO-based resource management UI component using the new PlayerResourceSlice with reactive updates
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-01 - Added proper reactive updates and cleanup
 */

import Fusion, { Children, Computed, New, Value, cleanup } from "@rbxts/fusion";
import { ProgressBar } from "../../atoms";
import { PlayerResourceSlice, ResourcesState } from "client/states";
import { RunService } from "@rbxts/services";

export interface ResourceBarDTOProps {
	ResourcesState: ResourcesState;
	size?: UDim2;
	position?: UDim2;
}

/**
 * Creates a resource bar component using DTO-based resource slice
 */
export function ResourceBarDTO(props: ResourceBarDTOProps): Frame {
	const size = props.size || new UDim2(0, 300, 0, 80);
	const position = props.position || new UDim2(0, 20, 0, 20);

	// Individual bar creation helper using ProgressBar atom
	const createResourceBar = (
		name: string,
		color: Color3,
		currentValue: Fusion.Value<number>,
		maxValue: Fusion.Value<number>,
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
		Name: "ResourceBarDTOContainer",
		Size: size,
		Position: position,
		BackgroundColor3: Color3.fromRGB(30, 30, 30),
		BackgroundTransparency: 0.2,
		BorderSizePixel: 2,
		BorderColor3: Color3.fromRGB(80, 80, 80),
		[Children]: {
			// Health Bar (Red)
			Health: createResourceBar(
				"Health",
				Color3.fromRGB(220, 50, 50),
				props.ResourcesState.Health.current,
				props.ResourcesState.Health.max,
				5,
			),

			// Mana Bar (Blue)
			Mana: createResourceBar(
				"Mana",
				Color3.fromRGB(50, 50, 220),
				props.ResourcesState.Mana.current,
				props.ResourcesState.Mana.max,
				30,
			),

			// Stamina Bar (Yellow)
			Stamina: createResourceBar(
				"Stamina",
				Color3.fromRGB(220, 220, 50),
				props.ResourcesState.Stamina.current,
				props.ResourcesState.Stamina.max,
				55,
			),
		},
	});
}

/**
 * Example usage:
 *
 * const resourceSlice = new PlayerResourceSlice();
 * await resourceSlice.fetch();
 *
 * const resourceBar = ResourceBarDTO({
 *     resourceSlice: resourceSlice,
 *     size: new UDim2(0, 300, 0, 80),
 *     position: new UDim2(0, 20, 0, 20)
 * });
 *
 * // The component will automatically update when the resourceSlice receives updates
 * // from the server via ResourcesUpdated, HealthChanged, or ResourceChanged events
 */
