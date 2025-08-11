export const TARGET_TAGS = {
	TARGETABLE: "Targetable",
} as const;

export type TargetTagKey = (typeof TARGET_TAGS)[keyof typeof TARGET_TAGS];
