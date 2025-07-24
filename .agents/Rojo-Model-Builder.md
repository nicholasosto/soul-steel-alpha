# Agent - Model Builder - Rojo v7 LLM Starter Kit

This file contains a quick‑reference, a strict instruction set for generator agents, and a reusable Codex request template.  
Hand it to any language‑model‑powered "builder‑bot" so it can emit Rojo‑compatible JSON that Roblox Studio will accept.

---

## A. Quick‑reference ("cheat‑sheet")

### 1. Project file skeleton

```jsonc
{
  "name": "<ProjectName>",               // REQ.
  "tree": { … },                         // REQ. – root instance (Instance‑Description)
  "servePort": 34872,                    // optional
  "servePlaceIds": [1234567890],         // optional
  "globIgnorePaths": ["**/*.spec.lua"],  // optional
  "emitLegacyScripts": true              // optional
}
```

Key points:  

* The **`tree`** field contains exactly one **Instance‑Description** object.  
* Unrecognised fields in the project root are ignored by Rojo, so you may add comments or helper metadata (they will not sync).

---

### 2. Instance‑Description mini‑grammar

| Field | Purpose | Required? | Notes |
|-------|---------|-----------|-------|
| `$className` | Roblox `ClassName` to instantiate | ✓ unless `$path` provided | Accepts service names (e.g. **`ReplicatedStorage`**) |
| `$path` | Filesystem path to import | ✓ unless `$className` provided | Relative to the project file folder. |
| `$properties` | Map of property → value | optional | Values follow implicit / explicit rules (see §3). |
| `$ignoreUnknownInstances` | Bool | optional (default = `false` when `$path` set, else `true`) | Tells Rojo to delete or keep stray children. |
| *any other key* | Child Instance‑Description | — | The key becomes the instance **Name**. |

Example (purely in‑memory tree):

```jsonc
"StarterPlayer": {
  "$className": "StarterPlayer",
  "StarterPlayerScripts": {
    "$className": "StarterPlayerScripts",
    "$path": "src/StarterPlayerScripts"
  }
}
```

---

### 3. Property value rules

* **Implicit** (preferred) – use a JSON value whose *shape* matches the Roblox type; Rojo validates against the API.  
  * `Vector3`, `Color3`, etc. → arrays of numbers: `[x, y, z]`.  
  * Enums → string variant: `"Front"`, `"Granite"`.  
* **Explicit** – required only when the property type is exotic or unknown to Rojo. Wrap the value in an object whose single key is the RBX‑DOM type name, e.g.  

```jsonc
"Anchored": { "Bool": true },
"CustomPhysicalProperties": {
  "PhysicalProperties": { "density": 0.5, "friction": 0.3, "elasticity": 0 }
}
```

Supported types (all can be implicit unless noted "explicit only"): Bool, String, Float32/64, Int32/64, Vector2/3, Color3, CFrame, Enum, Tags, UDim/UDim2, NumberSequence, ColorSequence, PhysicalProperties, Attributes.

---

### 4. Filesystem‑to‑instance mapping (sync details)

Rojo converts paths as follows:  

* `folder/` → `Folder` instance (`folder` as Name).  
* `*.server.lua` → `Script`; `*.client.lua` → `LocalScript`; any other `*.lua` → `ModuleScript`.  
* `init.server.lua | init.client.lua | init.lua` → turns the **parent folder** into the respective script class (folder disappears).  
* `*.rbxmx | *.rbxm` → XML/Binary model imported verbatim.  
* `*.model.json` → hand‑written JSON‑model (see §5).  
* `*.txt` → `StringValue`; `*.csv` → `LocalizationTable`; `*.json` (non‑model) or `*.toml` → `ModuleScript` returning the parsed data.  

---

### 5. Hand‑written `.model.json` (optional)

Simpler than a full project file when you need a self‑contained model:

```jsonc
{
  "ClassName": "Folder",
  "Children": [
    { "Name": "RootPart", "ClassName": "Part", "Properties": { "Size": [2,2,2] } },
    { "Name": "SendMoney", "ClassName": "RemoteEvent" }
  ]
}
```

#### Important Notes for `.model.json` Files

**Object References:**

* **AVOID** object references between instances in the same model (e.g., WeldConstraint.Part0/Part1, ObjectValue.Value)
* Rojo's JSON parser has strict requirements for reference formats that are error-prone
* **RECOMMENDED**: Create references programmatically via scripts after the model loads

**Common Reference Errors:**

```jsonc
// ❌ AVOID - These formats cause parsing errors:
"Part0": "Part1"                    // String references don't work
"Part0": {"$ref": "Part1"}          // Wrong reference syntax
"Part0": {"Ref": "Part1"}           // Also problematic

// ✅ RECOMMENDED - Use scripts instead:
// Create a ServerScript or LocalScript that finds and connects parts at runtime
```

**Safe Properties for JSON Models:**

* Primitive values: strings, numbers, booleans
* Arrays for Vector3, Color3, etc.: `[x, y, z]`
* Enum strings: `"SmoothPlastic"`, `"Neon"`
* Simple object properties without references

**Best Practice:**
Start with a basic model containing only parts/objects with simple properties, then add complex relationships via scripts.

---

## B. Instruction set for the generator agent

1. **Validate first**  
   * Fail fast if mandatory fields (`name`, root `tree`, `$className` *or* `$path`) are missing.  
2. **Prefer implicit properties**; switch to explicit only when the type is "explicit‑only" or unknown.  
3. **Vectors & colours**  
   * Represent `Vector2/3`, `CFrame`, `Color3` as number arrays; clamp Color3 values to 0‑1 floats.  
4. **Enums**  
   * Generate the *string* variant (`"SmoothPlastic"`) not the integer ID.  
5. **File links**  
   * For every `$path`, ensure the path exists or is declared elsewhere in the user request.  
6. **ignoreUnknownInstances**  
   * Default to `false` if `$path` is present (keep Studio‑created children), else `true` (strict mirroring).  
7. **No side effects**  
   * Never write to disk; just emit JSON text blocks.  
8. **Object References - CRITICAL**  
   * **NEVER** include object references in `.model.json` files (WeldConstraint.Part0/Part1, ObjectValue.Value, etc.)
   * Reference formats like `{"Ref": "PartName"}` or `{"$ref": "PartName"}` cause parsing errors
   * Instead, create basic models and handle connections via scripts at runtime
9. **Output format**  
   * Deliver either (a) one `.project.json` string, or (b) `.project.json` plus any `.model.json` files, clearly delimited by triple‑back‑tick code fences and labelled with filenames.  
10. **Comments**  
    * JSON does not permit comments; if examples need explanation, place it *outside* the code fence.  
11. **Follow Roblox naming rules** – instance names cannot contain ".", "/", or null characters.  

---

## C. Codex request template

Copy‑paste, replace bracketed sections, and send to the agent:

```markdown
### 🔧 Build a Rojo project

**Project name:** [SoulSteel‑WeaponKit]

**Root class:** [DataModel | Folder | Model]

**Filesystem layout (paths you already have):**
- src/ReplicatedStorage
- src/ServerScripts

**Instances to create**
```jsonc
{
  "ReplicatedStorage": {
    "$className": "ReplicatedStorage",
    "$path": "src/ReplicatedStorage"
  },
  "StarterPlayer": {
    "$className": "StarterPlayer",
    "StarterPlayerScripts": {
      "$className": "StarterPlayerScripts",
      "$path": "src/StarterScripts"
    }
  },
  "WeaponsFolder": {
    "$className": "Folder",
    "$properties": { "Name": "Weapons" },
    "Sword": {
      "$className": "Tool",
      "$properties": {
        "Grip": [0,0,0, 1,0,0, 0,1,0, 0,0,1],
        "RequiresHandle": false
      },
      "Handle": {
        "$className": "Part",
        "$properties": { "Size": [1,4,1], "Material": "Metal", "Anchored": false }
      }
    }
  }
}
```

#### Global options

```json
{
  "globIgnorePaths": ["**/*.spec.lua"],
  "emitLegacyScripts": false
}
```

#### Deliverables wanted

1. `weapon-kit.project.json` (full tree above)  
2. If useful: separate `.model.json` for the Sword tool  

---

### How to use the template

1. List or sketch **only** the instances you want; the agent will wrap them under the root `tree`.  
2. Provide any real file paths under "Filesystem layout" so `$path` entries won't break.  
3. Omit sections you don't need—the agent must supply sensible defaults as per the instruction set.  

---
