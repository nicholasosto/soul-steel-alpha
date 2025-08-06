/**
 * @file src/client/client-ui/organisms/resource-bars/ResourceBarDTO.ts
 * @module ResourceBarDTO
 * @layer Client/UI/Organisms
 * @description DTO-based resource management UI component using the new PlayerResourceSlice with reactive updates
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-04 - Added layout, dynamic keys, and props for simplification
 */

import Fusion, { Children, Computed, New } from "@rbxts/fusion";
import { ProgressBar } from "../../atoms";
import { ResourceKey } from "shared/catalogs/resources-catalog";
import { ResourcesCatalog } from "shared/catalogs/resources-catalog";
import { PlayerStateInstance } from "client/states";

const PlayerResources = PlayerStateInstance.Resources;

export interface ResourceBarProps extends Fusion.PropertyTable<Frame> {
	resourceKey: ResourceKey;
	showLabel?: boolean; // New: Allow toggling labels
}

export function ResourceBar(props: ResourceBarProps): Frame | undefined {
	if (props.resourceKey === undefined) {
		warn("ResourceBar: Missing resourceKey prop");
		return undefined; // Return undefined if no key is provided
	}
	const resourceMeta = ResourcesCatalog[props.resourceKey];
	const resourceState = PlayerResources[props.resourceKey];
	warn(`ResourceBar: Creating bar for resource "${props.resourceKey}" with state:`, resourceState, resourceMeta);
	if (resourceMeta === undefined || resourceState === undefined) {
		warn(`ResourceBar: Invalid resource key "${props.resourceKey}"`);
		return New("Frame")({}); // Return empty frame if invalid
	}

	const resourceBar = ProgressBar({
		Name: `${resourceMeta.displayName}_Bar`,
		progress: resourceState.current,
		maxValue: resourceState.max,
		fillColor: resourceMeta.color,
		showLabel: props.showLabel ?? true, // Default to true for visibility
		labelText: Computed(() => {
			const current = math.floor(resourceState.current.get()) || 0; // Ensure current is a number
			const max = math.floor(resourceState.max.get()) || 1; // Avoid division by zero
			return `${resourceMeta.displayName}: ${current}/${max}`;
		}),
		Size: new UDim2(1, 0, 0, 30), // New: Consistent height
		...props, // Merge additional props (e.g., Position if needed)
	});

	return resourceBar;
}

export interface ResourceBarsProps extends Fusion.PropertyTable<Frame> {
	resourceKeys?: ResourceKey[]; // New: Dynamic list of resources
}

export function ResourceBars(props: ResourceBarsProps): Frame {
	const resourceKeys = props.resourceKeys ?? ["Health", "Mana", "Stamina"]; // Default keys

	return New("Frame")({
		Name: "ResourceBarDTOContainer",
		Size: props.Size ?? UDim2.fromOffset(300, 150),
		Position: props.Position ?? new UDim2(0.05, 0, 0.05, 0),
		BackgroundTransparency: 1,
		[Children]: [
			// New: Add UIListLayout for vertical stacking
			New("UIListLayout")({
				SortOrder: Enum.SortOrder.LayoutOrder,
				Padding: new UDim(0, 5), // Space between bars
				FillDirection: Enum.FillDirection.Vertical,
				HorizontalAlignment: Enum.HorizontalAlignment.Center,
			}),
			// Dynamic creation via map
			...resourceKeys.map((key) => ResourceBar({ resourceKey: key, showLabel: true })),
		],
	});
}
