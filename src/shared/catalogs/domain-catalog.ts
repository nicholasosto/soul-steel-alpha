import { Value } from "@rbxts/fusion";
export const DomainKeys = ["fateless", "order", "chaos"] as const;

export type DomainKey = (typeof DomainKeys)[number];

export interface DomainMeta {
	displayName: string;
	description: string;
	color: Color3;
	icon: string; // rbxassetid
	tagline: string;
	strengths: DomainKey[];
	weaknesses: DomainKey[];
}
export interface DomainDTO {
	key: DomainKey;
	power: number; // Persistent faction strength
	influence: number; // Dynamic server/zone contribution
}

export interface DomainState {
	power: Value<number>;
	influence: Value<number>;
}

export const DomainCatalog: Record<DomainKey, DomainMeta> = {
	fateless: {
		displayName: "Fateless",
		description: "The void of forgotten memory. Souls unbound by choice.",
		color: Color3.fromRGB(100, 100, 120),
		icon: "rbxassetid://fateless_icon",
		tagline: "All beginnings are formless.",
		strengths: [],
		weaknesses: [], // Neutral — starting faction
	},
	order: {
		displayName: "Order",
		description: "Structure, creation, and the eternal shaping of reality.",
		color: Color3.fromRGB(80, 140, 220),
		icon: "rbxassetid://order_icon",
		tagline: "We build the world and bind it to law.",
		strengths: ["chaos"],
		weaknesses: ["fateless"],
	},
	chaos: {
		displayName: "Chaos",
		description: "Entropy, corruption, and the unmaking of all things.",
		color: Color3.fromRGB(180, 60, 60),
		icon: "rbxassetid://chaos_icon",
		tagline: "All things must fall to ruin.",
		strengths: ["fateless"],
		weaknesses: ["order"],
	},
};
