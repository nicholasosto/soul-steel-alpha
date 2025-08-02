/// <reference types="@rbxts/types" />

/**
 * @file        src/shared/asset-ids/image-assets.ts
 * @summary     Image asset constants for the game.
 * @module      ImageAssets
 * @layer       shared/asset-ids
 * @description List of image asset IDs used in the game.
 * @author       Trembus
 * @license      MIT
 * @since        0.1.0
 * @lastUpdated  2025-06-10 by Trembus
/* =============================================== Image Constants =============================================== */

export const MenuButtonImageMap: Record<string, string> = {
	Settings: "rbxassetid://122289639886993",
	Inventory: "rbxassetid://132702292243603",
	Character: "rbxassetid://100274464430589",
	Quests: "rbxassetid://129030346503415",
	Shop: "rbxassetid://101998590177560",
	Teleport: "rbxassetid://127118741571164",
	GemForge: "rbxassetid://116506062642047",
	Developer: "rbxassetid://95069877371395",
} as const;

export const ImageConstants = {
	IconButtonBackground: "rbxassetid://79163709624038",
	DefaultUnassigned: "rbxassetid://117838504772569",
	Ability: {
		Background: "rbxassetid://91419725020401",
		Unassigned: "rbxassetid://98384046526938",
		Flame_Sythe: "rbxassetid://108246514585300",
		HallowHold: "rbxassetid://79001631229851",
		Fireball: "rbxassetid://108246514585301",
		Ice_Rain: "rbxassetid://77085115837905",
		Lightning_Bolt: "rbxassetid://84562572112570",
		Earthquake: "rbxassetid://72703784685790",
		Melee: "rbxassetid://114327486101696",
		Blood_Siphon: "rbxassetid://135950973087916",
		Blood_Horror: "rbxassetid://82257212198629",
		Blood_Elemental: "rbxassetid://122556254156811",
		Soul_Drain: "rbxassetid://78703065651895",
	},
	Attributes: {
		Strength: "rbxassetid://127745571044516",
		Agility: "rbxassetid://73893872719367",
		Intellect: "rbxassetid://107600003376684",
		Vitality: "rbxassetid://121291227474039",
		Luck: "rbxassetid://114767496083209",
	},
	Beam: {
		Constrictor_1: "rbxassetid://75175588188120",
		Constrictor_2: "rbxassetid://117812481070645",
		SoulDrain_1: "rbxassetid://95584643329398",
		SoulDrain_2: "rbxassetid://98023166137532",
		IceChain_1: "rbxassetid://101823462513180",
		IceChain_2: "rbxassetid://136513380446132",
	},
	Borders: {
		GothicMetal: "rbxassetid://80375133768026",
		RedThick: "rbxassetid://134322739825066",
		CommonSet: "rbxassetid://85778039199330",
		RareSet: "rbxassetid://82228066842612",
		EpicSet: "rbxassetid://135166624307221",
		LegendarySet: "rbxassetid://85570068018789",
	},
	/* Buttons and UI controls */
	Control: {
		Increment: "rbxassetid://102421835119714",
		Decrement: "rbxassetid://78091115085992",
		Close: "rbxassetid://91437543746962",
		TripleArrow: "rbxassetid://136693752293641",
		Play: "rbxassetid://138751166365431",
	},
	Currency: {
		Coins: "rbxassetid://127745571044516",
		Shards: "rbxassetid://73893872719367",
		Tombs: "rbxassetid://121291227474039",
	},
	Gems: {
		Colorable: "rbxassetid://71842732472075",
		Common: "rbxassetid://71842732472075",
		Uncommon: "rbxassetid://71842732472075",
		Rare: "rbxassetid://71842732472075",
		Epic: "rbxassetid://119000054151103",
		Legendary: "rbxassetid://71842732472075",
	},
	SlotImage: {
		Unassigned: "rbxassetid://98384046526938",
		Helmet: "rbxassetid://98384046526938",
		Armor: "rbxassetid://98384046526938",
		Weapon: "rbxassetid://98384046526938",
		Accessory: "rbxassetid://98384046526938",
	},
	StatusIcon: {
		DarkEnergy: "rbxassetid://112790635225543",
		LightEnergy: "rbxassetid://128191185980101",
		Might: "rbxassetid://121141253261646",
		Chill: "rbxassetid://106953131478004",
		FlightChill: "rbxassetid://95573543624955",
		Shattered: "rbxassetid://135235376575135",
	},
	TextureImage: {
		BoneDoily: "rbxassetid://108018297611555",
		Mystical: "rbxassetid://108018297611556",
		WavyMetal: "rbxassetid://99123505462124",
	},
	Screens: {
		Loading: "rbxassetid://70565375536693",
		GameTitle: "rbxassetid://83079804672155",
	},
} as const;
