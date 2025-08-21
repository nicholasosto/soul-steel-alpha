import { Value } from "@rbxts/fusion";

export const PROGRESSION_KEYS = ["Level", "Experience", "NextLevelExperience"] as const;
export type ProgressionKey = (typeof PROGRESSION_KEYS)[number];

export type ProgressionDTO = {
	[key in ProgressionKey]: number;
};

export type ProgressionState = {
	[key in ProgressionKey]: Value<number>;
};

export function makeDefaultProgressionDTO(): ProgressionDTO {
	return {
		Level: 1,
		Experience: 0,
		NextLevelExperience: 100,
	};
}

export function makeProgressionStateFromDTO(dto: ProgressionDTO): ProgressionState {
	return {
		Level: Value(dto.Level),
		Experience: Value(dto.Experience),
		NextLevelExperience: Value(dto.NextLevelExperience),
	};
}

export function makeDefaultProgressionState(): ProgressionState {
	return makeProgressionStateFromDTO(makeDefaultProgressionDTO());
}
