export const FORCE_KEYS = ["JumpForce", "PropulsionForce", "RocketForce"] as const;
export type ForceKey = (typeof FORCE_KEYS)[number];
