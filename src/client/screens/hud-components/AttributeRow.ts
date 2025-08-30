import { Children, Computed, New, OnEvent, Value } from "@rbxts/fusion";
import { AttributeCatalog, AttributeKey, AttributeStateValue } from "shared/catalogs/attribute-catalog";
import { ImageConstants } from "shared";
import { PlayerStateInstance } from "client/states";
const RowConstants = {
	Height: 60,
	Padding: 3,
	Width: 400,
};
const LayoutOrders = {
	DisplayName: 0,
	Icon: 1,
	Base: 2,
	Equipment: 3,
	StatusEffects: 4,
	TempEffects: 5,
	Total: 6,
	Controls: 7,
};

interface StateLabelProps {
	stateValue: Value<number | string>;
	layoutOrder: number;
	name: string;
}

function createStateLabel({ stateValue, layoutOrder, name }: StateLabelProps) {
	const computedText = Computed(() => `${stateValue.get()}`);
	return New("TextLabel")({
		Name: name,
		Size: new UDim2(0, 50, 1, 0),
		BackgroundTransparency: 1,
		Text: computedText,
		TextColor3: Color3.fromRGB(255, 255, 255),
		Font: Enum.Font.SourceSans,
		TextSize: 18,
		LayoutOrder: layoutOrder,
	});
}

const Layouts = {
	Vertical: () => {
		return New("UIListLayout")({
			FillDirection: Enum.FillDirection.Vertical,
			Padding: new UDim(0, 0),
			VerticalAlignment: Enum.VerticalAlignment.Center,
			HorizontalAlignment: Enum.HorizontalAlignment.Center,
			SortOrder: Enum.SortOrder.LayoutOrder,
		});
	},
	Horizontal: () => {
		return New("UIListLayout")({
			FillDirection: Enum.FillDirection.Horizontal,
			Padding: new UDim(0, 0),
			VerticalAlignment: Enum.VerticalAlignment.Center,
			HorizontalAlignment: Enum.HorizontalAlignment.Center,
			SortOrder: Enum.SortOrder.LayoutOrder,
		});
	},
};
export interface AttributeRowProps {
	attributeKey: AttributeKey;
	attributeState: AttributeStateValue;
	onIncrement: () => void;
	onDecrement: () => void;
}

export const AttributeRow = (props: AttributeRowProps) => {
	const displayCatalog = AttributeCatalog[props.attributeKey];
	const displayNameText = displayCatalog.displayName;
	const iconId = displayCatalog.icon ?? ImageConstants.StatusIcon.Chill;

	const displayName = createStateLabel({
		stateValue: Value(displayNameText),
		layoutOrder: LayoutOrders.DisplayName,
		name: props.attributeKey + "_name",
	});

	const attributeIcon = New("ImageLabel")({
		Name: props.attributeKey + "_icon",
		Size: new UDim2(0, RowConstants.Height, 0, RowConstants.Height),
		BackgroundTransparency: 1,
		Image: iconId,
		LayoutOrder: LayoutOrders.Icon,
	});

	const baseValue = createStateLabel({
		stateValue: PlayerStateInstance.Attributes[props.attributeKey].base,
		layoutOrder: LayoutOrders.Base,
		name: props.attributeKey + "_base",
	});

	const equipmentValue = createStateLabel({
		stateValue: PlayerStateInstance.Attributes[props.attributeKey]?.equipment ?? Value(0),
		layoutOrder: LayoutOrders.Equipment,
		name: props.attributeKey + "_equipment",
	});

	const statusEffectsVal = createStateLabel({
		stateValue: PlayerStateInstance.Attributes[props.attributeKey]?.statusEffects ?? Value(0),
		layoutOrder: LayoutOrders.StatusEffects,
		name: props.attributeKey + "_statusEffects",
	});

	const incrementButton = New("ImageButton")({
		Size: new UDim2(0, (RowConstants.Height - 2) / 2, 0, (RowConstants.Height - 2) / 2),
		Name: props.attributeKey + "_increment",
		Image: ImageConstants.Control.Increment,
		BackgroundTransparency: 1,
		[OnEvent("Activated")]: () => {
			props.onIncrement();
		},
		LayoutOrder: 0,
	});

	const decrementButton = New("ImageButton")({
		Size: new UDim2(0, (RowConstants.Height - 2) / 2, 0, (RowConstants.Height - 2) / 2),
		Name: props.attributeKey + "_decrement",
		Image: ImageConstants.Control.Decrement,
		BackgroundTransparency: 1,
		[OnEvent("Activated")]: () => {
			props.onDecrement();
		},
		LayoutOrder: 1,
	});

	const buttonControls = New("Frame")({
		Name: props.attributeKey + "_controls",
		Size: new UDim2(0, RowConstants.Height, 0, RowConstants.Height),
		BackgroundTransparency: 0.94,
		[Children]: [Layouts.Vertical(), incrementButton, decrementButton],
		LayoutOrder: LayoutOrders.Controls,
	});

	const rowComponent = New("Frame")({
		Size: new UDim2(0, RowConstants.Width, 0, RowConstants.Height),
		AnchorPoint: new Vector2(0.5, 0.5),
		Position: new UDim2(0.5, 0, 0.5, 0),
		BackgroundTransparency: 0.5,
		BackgroundColor3: Color3.fromRGB(0, 0, 0),
		ClipsDescendants: true,
		[Children]: [
			Layouts.Horizontal(),
			displayName,
			attributeIcon,
			baseValue,
			equipmentValue,
			statusEffectsVal,
			buttonControls,
		],
	});

	return rowComponent;
};
