import { Panel, PanelWindow, TextBox } from "@trembus/ss-fusion";

export const PlayerDataPanel = PanelWindow({
	panelVariant: "primary",
	titleLabel: "Player Data",
	shadow: "md",
	children: [TextBox({})],
});
