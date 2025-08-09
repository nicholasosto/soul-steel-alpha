import { TabGroup, TabSpec } from "@trembus/ss-fusion";
import { Value, New } from "@rbxts/fusion";
export function CreateTabGroupExample() {
	const active = Value<string>("Inventory");

	const tabs: TabSpec[] = [
		{
			id: "Inventory",
			label: "Inventory",
			panel: () =>
				New("TextLabel")({
					Text: "Inventory Panel",
					Size: UDim2.fromScale(1, 1),
					BackgroundTransparency: 1,
					TextScaled: true,
				}),
		},
		{
			id: "Skills",
			label: "Skills",
			panel: () =>
				New("TextLabel")({
					Text: "Skills Panel",
					Size: UDim2.fromScale(1, 1),
					BackgroundTransparency: 1,
					TextScaled: true,
				}),
		},
		{
			id: "Character",
			label: "Character",
			panel: () =>
				New("TextLabel")({
					Text: "Character Panel",
					Size: UDim2.fromScale(1, 1),
					BackgroundTransparency: 1,
					TextScaled: true,
				}),
		},
	];

	const container = new Instance("Frame");
	container.Name = "TabGroupExample";
	container.Size = new UDim2(0, 480, 0, 220);
	container.BackgroundColor3 = Color3.fromRGB(45, 45, 45);

	const tabGroup = TabGroup({
		Name: "DemoTabs",
		Size: new UDim2(1, -40, 1, -40),
		Position: new UDim2(0, 20, 0, 20),
		active,
		tabs,
		layout: "Top",
		mountOnlyActive: false,
	});

	tabGroup.Parent = container;
	return container;
}
