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

import Fusion, { Children, New } from "@rbxts/fusion";
import { ProgressBar } from "@trembus/ss-fusion";
import { ResourceKey, ResourcesCatalog } from "shared/catalogs/resources-catalog";
import { PlayerStateInstance } from "client/states";

// Do not capture a snapshot; always read from PlayerStateInstance.Resources

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
	const resourceState = PlayerStateInstance.Resources[props.resourceKey];
	warn(`ResourceBar: Creating bar for resource "${props.resourceKey}" with state:`, resourceState, resourceMeta);
	if (resourceMeta === undefined || resourceState === undefined) {
		warn(`ResourceBar: Invalid resource key "${props.resourceKey}"`);
		return New("Frame")({}); // Return empty frame if invalid
	}
	const resourceBar = ProgressBar({
		currentValue: resourceState.current,
		maxValue: resourceState.max,
		fillColor: resourceMeta.color,
		showLabel: props.showLabel ?? true, // Default to true if not specified
		Size: props.Size ?? UDim2.fromOffset(200, 30), //
	});

	return resourceBar;
}

export interface ResourceBarsProps extends Fusion.PropertyTable<Frame> {
	resourceKeys?: ResourceKey[]; // New: Dynamic list of resources
}

export function ResourceBars(props: ResourceBarsProps): Frame {
	const resourceKeys = props.resourceKeys ?? ["Health", "Mana", "Stamina"]; // Default keys

	return New("Frame")({
		Name: "ResourceBarContainer",
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
