import { ForceKey } from "shared/keys/force-keys";
import Maid from "@rbxts/maid";
import { Workspace } from "@rbxts/services";
const Gravity = Workspace.Gravity;
const forceMaid = new Maid();

export interface ForceMeta {
	duration: number;
	force: Vector3;
	RunForce: (part: BasePart) => VectorForce | undefined;
}

function createVectorForce(force: Vector3, duration: number): VectorForce {
	const vectorForce = new Instance("VectorForce");
	vectorForce.Force = force;
	forceMaid.GiveTask(vectorForce);
	return vectorForce;
}

export const ForceCatalog: Record<ForceKey, ForceMeta> = {
	JumpForce: {
		duration: 1,
		force: new Vector3(0, 9, 0),
		RunForce: (part: BasePart) => {
			const assemblyMass = part.AssemblyMass;
			warn(
				`JumpForce applied to ${part.Name} with assembly mass: ${assemblyMass} : Gravity: ${Gravity}`,
				Gravity * assemblyMass,
			);
			const vectorForce = createVectorForce(new Vector3(0, Gravity * assemblyMass, 0), 1);
			if (part.FindFirstChild("JumpForce")) {
				return;
			}
			vectorForce.Parent = part;
			const attachment0 = part.FindFirstChildOfClass("Attachment") || new Instance("Attachment");
			attachment0.Parent = part;
			vectorForce.Attachment0 = attachment0;
			vectorForce.Enabled = true;
			vectorForce.Name = "JumpForce";
			return vectorForce;
		},
	},
	PropulsionForce: {
		duration: 1,
		force: new Vector3(0, 0, 0),
		RunForce: (part: BasePart) => {
			const vectorForce = createVectorForce(new Vector3(0, 0, 0), 1);
			vectorForce.Parent = part;
			return vectorForce;
		},
	},
	RocketForce: {
		duration: 1,
		force: new Vector3(0, 4000, 0), // Example force vector
		RunForce: (part: BasePart) => {
			const vectorForce = createVectorForce(new Vector3(0, 4000, 0), 1);
			vectorForce.Attachment0 = part.FindFirstChildOfClass("Attachment") || new Instance("Attachment");
			vectorForce.RelativeTo = Enum.ActuatorRelativeTo.World;
			vectorForce.Parent = part;
			return vectorForce;
		},
	},
};
