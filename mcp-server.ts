#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { promises as fs } from "fs";
import { join, relative, extname } from "path";

const PROJECT_ROOT = process.cwd();

// Create server instance
const server = new McpServer({
  name: "soul-steel-alpha-mcp",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Helper function to recursively find TypeScript files
async function findTsFiles(dir: string, files: string[] = []): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
        await findTsFiles(fullPath, files);
      } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }
  
  return files;
}

// Helper function to read project structure
async function getProjectStructure(): Promise<string> {
  const files = await findTsFiles(PROJECT_ROOT);
  const structure = files.map((file) => relative(PROJECT_ROOT, file)).sort();
  
  return `Roblox TypeScript Project Structure:
${structure.map((file) => `- ${file}`).join("\n")}

This is a Roblox-TS project with:
- Client-side code in src/client/
- Server-side code in src/server/  
- Shared code in src/shared/
- Lua includes in include/`;
}

// Helper function to analyze package.json
async function getProjectInfo(): Promise<string> {
  try {
    const packageJson = JSON.parse(
      await fs.readFile(join(PROJECT_ROOT, "package.json"), "utf-8")
    );
    
    return `Project: ${packageJson.name}
Version: ${packageJson.version}
Description: ${packageJson.description || "Roblox TypeScript project"}

Build Scripts:
- npm run build: ${packageJson.scripts?.build || "N/A"}
- npm run watch: ${packageJson.scripts?.watch || "N/A"}
- npm run lint: ${packageJson.scripts?.lint || "N/A"}

Key Dependencies:
- roblox-ts: ${packageJson.devDependencies?.["roblox-ts"] || "N/A"}
- typescript: ${packageJson.devDependencies?.typescript || "N/A"}
- @rbxts/types: ${packageJson.devDependencies?.["@rbxts/types"] || "N/A"}

This is a Roblox TypeScript project that compiles TypeScript to Lua for Roblox development.`;
  } catch (error) {
    return `Error reading project info: ${error}`;
  }
}

// Register existing tools
server.tool(
  "read_file",
  "Read the contents of a file in the Roblox TypeScript project",
  {
    path: z.string().describe("Relative path to the file from project root"),
  },
  async ({ path }) => {
    try {
      const fullPath = join(PROJECT_ROOT, path);
      
      // Security check - ensure path is within project
      if (!fullPath.startsWith(PROJECT_ROOT)) {
        return {
          content: [
            {
              type: "text",
              text: "Error: Path is outside project directory",
            },
          ],
        };
      }
      
      const content = await fs.readFile(fullPath, "utf-8");
      const fileType = extname(path);
      
      return {
        content: [
          {
            type: "text",
            text: `File: ${path}
Type: ${fileType}
Size: ${content.length} characters

Content:
\`\`\`${fileType === ".ts" || fileType === ".tsx" ? "typescript" : fileType.slice(1)}
${content}
\`\`\``,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error reading file ${path}: ${error}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "list_files",
  "List all TypeScript files in the Roblox project",
  {},
  async () => {
    try {
      const structure = await getProjectStructure();
      
      return {
        content: [
          {
            type: "text",
            text: structure,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error listing files: ${error}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get_project_info",
  "Get information about the Roblox TypeScript project including dependencies and scripts",
  {},
  async () => {
    try {
      const info = await getProjectInfo();
      
      return {
        content: [
          {
            type: "text",
            text: info,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting project info: ${error}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "search_code",
  "Search for specific text or patterns in the TypeScript codebase",
  {
    query: z.string().describe("Text or pattern to search for"),
    file_pattern: z
      .string()
      .optional()
      .describe("Optional file pattern to limit search (e.g., '*.ts', 'client/**')"),
  },
  async ({ query, file_pattern }) => {
    try {
      const files = await findTsFiles(PROJECT_ROOT);
      const results: string[] = [];
      
      for (const file of files) {
        // Apply file pattern filter if specified
        if (file_pattern && !file.includes(file_pattern.replace("*", ""))) {
          continue;
        }
        
        try {
          const content = await fs.readFile(file, "utf-8");
          const lines = content.split("\n");
          
          lines.forEach((line, index) => {
            if (line.toLowerCase().includes(query.toLowerCase())) {
              const relativePath = relative(PROJECT_ROOT, file);
              results.push(`${relativePath}:${index + 1}: ${line.trim()}`);
            }
          });
        } catch (error) {
          // Skip files that can't be read
        }
      }
      
      return {
        content: [
          {
            type: "text",
            text:
              results.length > 0
                ? `Found ${results.length} matches for "${query}":\n\n${results.join("\n")}`
                : `No matches found for "${query}"`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error searching code: ${error}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "explain_roblox_structure",
  "Get an explanation of the Roblox-TS project structure and development patterns",
  {},
  async () => {
    return {
      content: [
        {
          type: "text",
          text: `Roblox-TS Project Structure Explanation:

🎮 **Project Type**: Roblox TypeScript (roblox-ts)
This project compiles TypeScript code to Lua for Roblox game development.

📁 **Directory Structure**:
- \`src/client/\`: Code that runs on the player's device (client-side)
  - Handles UI, input, local effects, client-server communication
  - Gets compiled and runs in LocalScripts in Roblox

- \`src/server/\`: Code that runs on Roblox servers (server-side) 
  - Handles game logic, player data, security, server events
  - Gets compiled and runs in ServerScripts in Roblox

- \`src/shared/\`: Code accessible by both client and server
  - Common utilities, types, constants, shared game logic
  - Gets compiled to ModuleScripts in Roblox

- \`include/\`: Lua files that are directly included in the build
  - Usually contains runtime libraries or external Lua dependencies

🔧 **Build Process**:
- \`rbxtsc\`: The Roblox TypeScript compiler
- Transpiles TypeScript → Lua
- Generates .rbxl/.rbxlx files for Roblox Studio

🛠️ **Development Workflow**:
1. Write TypeScript code in src/
2. Run \`npm run build\` or \`npm run watch\`
3. Import generated files into Roblox Studio
4. Test in Roblox Studio or publish to Roblox

📦 **Key Dependencies**:
- \`roblox-ts\`: The main compiler
- \`@rbxts/types\`: TypeScript definitions for Roblox APIs
- \`@rbxts/compiler-types\`: Compiler-specific types`,
        },
      ],
    };
  }
);

// ===== NEW CUSTOM TOOLS - ADD YOUR OWN HERE! =====

// Example: Analyze ability system
server.tool(
  "analyze_abilities",
  "Analyze the game's ability system and list all available abilities with their metadata",
  {},
  async () => {
    try {
      // Read ability catalog
      const abilityKeysPath = join(PROJECT_ROOT, "src/shared/keys/ability-keys.ts");
      const abilityCatalogPath = join(PROJECT_ROOT, "src/shared/catalogs/ability-catalog.ts");
      
      const [keysContent, catalogContent] = await Promise.all([
        fs.readFile(abilityKeysPath, "utf-8").catch(() => "Not found"),
        fs.readFile(abilityCatalogPath, "utf-8").catch(() => "Not found")
      ]);
      
      return {
        content: [
          {
            type: "text",
            text: `🎯 **Ability System Analysis**

📋 **Ability Keys** (${abilityKeysPath}):
\`\`\`typescript
${keysContent}
\`\`\`

⚡ **Ability Catalog** (${abilityCatalogPath}):
\`\`\`typescript
${catalogContent.length > 1000 ? catalogContent.substring(0, 1000) + "...[truncated]" : catalogContent}
\`\`\`

This shows all available abilities in your game and their configurations.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error analyzing abilities: ${error}`,
          },
        ],
      };
    }
  }
);

// Example: Get event system overview
server.tool(
  "analyze_events",
  "Analyze the event system including signal keys, event keys, and remote definitions",
  {},
  async () => {
    try {
      const eventKeysPath = join(PROJECT_ROOT, "src/shared/keys/event-keys.ts");
      const abilityRemotesPath = join(PROJECT_ROOT, "src/shared/network/ability-remotes.ts");
      const gameCycleRemotesPath = join(PROJECT_ROOT, "src/shared/network/game-cycle-remotes.ts");
      
      const [eventKeys, abilityRemotes, gameCycleRemotes] = await Promise.all([
        fs.readFile(eventKeysPath, "utf-8").catch(() => "Not found"),
        fs.readFile(abilityRemotesPath, "utf-8").catch(() => "Not found"),
        fs.readFile(gameCycleRemotesPath, "utf-8").catch(() => "Not found")
      ]);
      
      return {
        content: [
          {
            type: "text",
            text: `🔄 **Event System Analysis**

🔑 **Event & Signal Keys**:
\`\`\`typescript
${eventKeys}
\`\`\`

⚡ **Ability Remotes**:
\`\`\`typescript
${abilityRemotes}
\`\`\`

🎮 **Game Cycle Remotes**:
\`\`\`typescript
${gameCycleRemotes}
\`\`\`

This shows your complete client-server communication setup.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error analyzing events: ${error}`,
          },
        ],
      };
    }
  }
);

// Example: Find TODO comments
server.tool(
  "find_todos",
  "Find all TODO, FIXME, and NOTE comments in the codebase",
  {},
  async () => {
    try {
      const files = await findTsFiles(PROJECT_ROOT);
      const todoItems: string[] = [];
      const patterns = ["TODO", "FIXME", "NOTE", "HACK", "BUG"];
      
      for (const file of files) {
        try {
          const content = await fs.readFile(file, "utf-8");
          const lines = content.split("\n");
          
          lines.forEach((line, index) => {
            const upperLine = line.toUpperCase();
            for (const pattern of patterns) {
              if (upperLine.includes(pattern)) {
                const relativePath = relative(PROJECT_ROOT, file);
                todoItems.push(`${relativePath}:${index + 1}: ${line.trim()}`);
                break; // Only report each line once
              }
            }
          });
        } catch (error) {
          // Skip files that can't be read
        }
      }
      
      return {
        content: [
          {
            type: "text",
            text: todoItems.length > 0
              ? `📝 **Found ${todoItems.length} TODO/FIXME items:**\n\n${todoItems.join("\n")}`
              : "✅ No TODO/FIXME items found in the codebase!",
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error finding TODOs: ${error}`,
          },
        ],
      };
    }
  }
);

// Example: Generate component documentation
server.tool(
  "document_ui_components",
  "Generate documentation for all UI components in the client-ui folder",
  {},
  async () => {
    try {
      const uiDir = join(PROJECT_ROOT, "src/client/client-ui");
      const uiFiles = await findTsFiles(uiDir);
      
      const componentDocs: string[] = [];
      
      for (const file of uiFiles) {
        const content = await fs.readFile(file, "utf-8");
        const relativePath = relative(PROJECT_ROOT, file);
        
        // Extract component exports and interfaces
        const exportMatches = content.match(/export\s+(function|interface|const)\s+(\w+)/g) || [];
        const interfaceMatches = content.match(/interface\s+(\w+Props)/g) || [];
        
        if (exportMatches.length > 0 || interfaceMatches.length > 0) {
          componentDocs.push(`### ${relativePath}
**Exports:** ${exportMatches.join(", ") || "None"}
**Interfaces:** ${interfaceMatches.join(", ") || "None"}
`);
        }
      }
      
      return {
        content: [
          {
            type: "text",
            text: `📦 **UI Components Documentation**

${componentDocs.join("\n")}

Total UI files analyzed: ${uiFiles.length}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error documenting UI components: ${error}`,
          },
        ],
      };
    }
  }
);

// Advanced: Semantic duplicate function detection
server.tool(
  "find_duplicate_functions",
  "Find potentially duplicate functions that perform similar operations despite different names or implementations",
  {
    similarity_threshold: z.number().optional().describe("Similarity threshold (0-1, default 0.7)"),
    focus_area: z.string().optional().describe("Focus on specific operations (e.g., 'scaling', 'player', 'animation')")
  },
  async ({ similarity_threshold = 0.7, focus_area }) => {
    try {
      const files = await findTsFiles(PROJECT_ROOT);
      const functions: Array<{
        name: string;
        file: string;
        line: number;
        signature: string;
        body: string;
        keywords: string[];
        operations: string[];
        parameters: string[];
      }> = [];
      
      // Extract all functions with their metadata
      for (const file of files) {
        try {
          const content = await fs.readFile(file, "utf-8");
          const lines = content.split("\n");
          const relativePath = relative(PROJECT_ROOT, file);
          
          // Enhanced regex to capture various function patterns
          const functionPatterns = [
            // Regular functions: function name(params) { ... }
            /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)\s*(?::\s*[^{]+)?\s*\{([\s\S]*?)\n\s*\}/g,
            // Arrow functions: const name = (params) => { ... }
            /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*(?::\s*[^=]+)?\s*=>\s*\{([\s\S]*?)\n\s*\}/g,
            // Method definitions: methodName(params) { ... }
            /(\w+)\s*\(([^)]*)\)\s*(?::\s*[^{]+)?\s*\{([\s\S]*?)\n\s*\}/g,
          ];
          
          for (const pattern of functionPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
              const [fullMatch, name, params, body] = match;
              
              // Skip very short functions or getters/setters
              if (body.trim().length < 10 || name.length < 3) continue;
              
              // Find line number
              const beforeMatch = content.substring(0, match.index);
              const lineNumber = beforeMatch.split('\n').length;
              
              // Extract semantic information
              const keywords = extractKeywords(body, name);
              const operations = extractOperations(body);
              const parameters = params.split(',').map(p => p.trim().split(':')[0].trim()).filter(p => p);
              
              // Apply focus filter if specified
              if (focus_area && !keywords.some(k => k.toLowerCase().includes(focus_area.toLowerCase()))) {
                continue;
              }
              
              functions.push({
                name,
                file: relativePath,
                line: lineNumber,
                signature: `${name}(${params})`,
                body: body.trim(),
                keywords,
                operations,
                parameters
              });
            }
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
      
      // Find potential duplicates using semantic similarity
      const duplicateGroups: Array<Array<typeof functions[0]>> = [];
      const processed = new Set<number>();
      
      for (let i = 0; i < functions.length; i++) {
        if (processed.has(i)) continue;
        
        const group = [functions[i]];
        processed.add(i);
        
        for (let j = i + 1; j < functions.length; j++) {
          if (processed.has(j)) continue;
          
          const similarity = calculateFunctionSimilarity(functions[i], functions[j]);
          if (similarity >= similarity_threshold) {
            group.push(functions[j]);
            processed.add(j);
          }
        }
        
        // Only report groups with potential duplicates
        if (group.length > 1) {
          duplicateGroups.push(group);
        }
      }
      
      // Format results
      if (duplicateGroups.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `✅ No duplicate functions found with similarity threshold ${similarity_threshold}${focus_area ? ` (focused on: ${focus_area})` : ""}.`
            }
          ]
        };
      }
      
      let report = `🔍 **Potential Duplicate Functions Found**\n\n`;
      report += `Similarity threshold: ${similarity_threshold}${focus_area ? ` | Focus: ${focus_area}` : ""}\n\n`;
      
      duplicateGroups.forEach((group, index) => {
        report += `### Group ${index + 1}: ${group.length} Similar Functions\n\n`;
        
        group.forEach((func, funcIndex) => {
          report += `**${funcIndex + 1}. \`${func.name}\`** (${func.file}:${func.line})\n`;
          report += `- Signature: \`${func.signature}\`\n`;
          report += `- Keywords: ${func.keywords.join(", ")}\n`;
          report += `- Operations: ${func.operations.join(", ")}\n`;
          if (func.parameters.length > 0) {
            report += `- Parameters: ${func.parameters.join(", ")}\n`;
          }
          report += `\n`;
        });
        
        // Show potential refactoring suggestion
        const commonKeywords = findCommonElements(group.map(f => f.keywords));
        const commonOperations = findCommonElements(group.map(f => f.operations));
        
        if (commonKeywords.length > 0 || commonOperations.length > 0) {
          report += `**💡 Refactoring Opportunity:**\n`;
          if (commonKeywords.length > 0) {
            report += `- Common concepts: ${commonKeywords.join(", ")}\n`;
          }
          if (commonOperations.length > 0) {
            report += `- Similar operations: ${commonOperations.join(", ")}\n`;
          }
          report += `- Consider creating a unified function that handles these similar operations\n`;
        }
        
        report += `\n---\n\n`;
      });
      
      return {
        content: [
          {
            type: "text",
            text: report
          }
        ]
      };
      
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error finding duplicate functions: ${error}`
          }
        ]
      };
    }
  }
);

// Helper function to extract semantic keywords from function body and name
function extractKeywords(body: string, functionName: string): string[] {
  const keywords = new Set<string>();
  
  // Add function name components
  functionName.split(/(?=[A-Z])/).forEach(part => {
    if (part.length > 2) keywords.add(part.toLowerCase());
  });
  
  // Common domain-specific terms
  const domainTerms = [
    'scale', 'size', 'grow', 'shrink', 'resize', 'transform',
    'player', 'character', 'entity', 'model', 'humanoid',
    'position', 'move', 'teleport', 'location', 'place',
    'animation', 'animate', 'play', 'stop', 'tween',
    'effect', 'vfx', 'particle', 'sound', 'audio',
    'health', 'damage', 'heal', 'restore', 'modify',
    'data', 'save', 'load', 'get', 'set', 'update',
    'ability', 'skill', 'cast', 'activate', 'trigger'
  ];
  
  domainTerms.forEach(term => {
    if (body.toLowerCase().includes(term) || functionName.toLowerCase().includes(term)) {
      keywords.add(term);
    }
  });
  
  return Array.from(keywords);
}

// Helper function to extract operations from function body
function extractOperations(body: string): string[] {
  const operations = new Set<string>();
  
  // Look for common patterns
  const patterns = [
    { regex: /\.Scale\s*=/, op: 'scaling' },
    { regex: /\.Size\s*=/, op: 'sizing' },
    { regex: /\.Position\s*=/, op: 'positioning' },
    { regex: /\.CFrame\s*=/, op: 'positioning' },
    { regex: /\.Parent\s*=/, op: 'parenting' },
    { regex: /\.Health\s*=/, op: 'health_modification' },
    { regex: /\.Play\(/, op: 'playing' },
    { regex: /\.Stop\(/, op: 'stopping' },
    { regex: /\.Destroy\(/, op: 'destroying' },
    { regex: /\.Clone\(/, op: 'cloning' },
    { regex: /TweenInfo/, op: 'tweening' },
    { regex: /TweenService/, op: 'tweening' },
    { regex: /RunService/, op: 'frame_based' },
    { regex: /task\.wait/, op: 'waiting' },
    { regex: /Connect\(/, op: 'event_handling' },
    { regex: /FireServer|FireClient/, op: 'remote_communication' },
    { regex: /GetChildren|FindFirstChild/, op: 'hierarchy_traversal' }
  ];
  
  patterns.forEach(({ regex, op }) => {
    if (regex.test(body)) {
      operations.add(op);
    }
  });
  
  return Array.from(operations);
}

// Helper function to calculate similarity between two functions
function calculateFunctionSimilarity(func1: any, func2: any): number {
  let score = 0;
  let maxScore = 0;
  
  // Parameter count similarity (weight: 0.2)
  maxScore += 0.2;
  const paramDiff = Math.abs(func1.parameters.length - func2.parameters.length);
  const maxParams = Math.max(func1.parameters.length, func2.parameters.length, 1);
  score += 0.2 * (1 - paramDiff / maxParams);
  
  // Keyword overlap (weight: 0.4)
  maxScore += 0.4;
  const keywordOverlap = findCommonElements([func1.keywords, func2.keywords]).length;
  const totalKeywords = new Set([...func1.keywords, ...func2.keywords]).size;
  if (totalKeywords > 0) {
    score += 0.4 * (keywordOverlap / totalKeywords);
  }
  
  // Operation overlap (weight: 0.4)
  maxScore += 0.4;
  const operationOverlap = findCommonElements([func1.operations, func2.operations]).length;
  const totalOperations = new Set([...func1.operations, ...func2.operations]).size;
  if (totalOperations > 0) {
    score += 0.4 * (operationOverlap / totalOperations);
  }
  
  return maxScore > 0 ? score / maxScore : 0;
}

// Helper function to find common elements across arrays
function findCommonElements(arrays: string[][]): string[] {
  if (arrays.length === 0) return [];
  
  return arrays[0].filter(item => 
    arrays.every(arr => arr.includes(item))
  );
}

// Naming convention checker
server.tool(
  "check_naming_conventions",
  "Find files and elements that don't follow the project's naming conventions",
  {
    strict_mode: z.boolean().optional().describe("Enable strict mode for more detailed checks (default: false)"),
    focus_area: z.string().optional().describe("Focus on specific area: 'files', 'types', 'functions', 'variables', or 'all' (default: 'all')")
  },
  async ({ strict_mode = false, focus_area = "all" }) => {
    try {
      const files = await findTsFiles(PROJECT_ROOT);
      const violations: Array<{
        type: string;
        severity: 'error' | 'warning' | 'suggestion';
        file: string;
        line?: number;
        issue: string;
        expected: string;
        actual: string;
      }> = [];
      
      // File naming convention rules
      const fileNamingRules = {
        // General rule: kebab-case for most files
        general: /^[a-z0-9]+(-[a-z0-9]+)*\.(ts|tsx)$/,
        
        // Exceptions for specific patterns
        exceptions: {
          // UI components: PascalCase (client-ui folder)
          uiComponents: /^[A-Z][a-zA-Z0-9]*\.(ts|tsx)$/,
          // Type files: PascalCase ending with specific patterns
          typeFiles: /^[A-Z][a-zA-Z0-9]*(Type|DTO|Entity)s?\.(ts|tsx)$/,
          // Network files: [category]-remotes.ts
          networkFiles: /^[a-z0-9]+(-[a-z0-9]+)*-remotes\.(ts|tsx)$/,
          // Service files: [name]-service.ts
          serviceFiles: /^[a-z0-9]+(-[a-z0-9]+)*-service\.(ts|tsx)$/,
          // Key files: [name]-keys.ts
          keyFiles: /^[a-z0-9]+(-[a-z0-9]+)*-keys\.(ts|tsx)$/,
          // Catalog files: [name]-catalog.ts
          catalogFiles: /^[a-z0-9]+(-[a-z0-9]+)*-catalog\.(ts|tsx)$/,
        }
      };
      
      // Check file naming conventions
      if (focus_area === "files" || focus_area === "all") {
        for (const file of files) {
          const relativePath = relative(PROJECT_ROOT, file);
          const fileName = relativePath.split(/[/\\]/).pop() || "";
          const dirPath = relativePath.split(/[/\\]/).slice(0, -1).join("/");
          
          let expectedPattern = fileNamingRules.general;
          let expectedDescription = "kebab-case";
          let isException = false;
          
          // Check for specific patterns
          if (dirPath.includes("client-ui")) {
            expectedPattern = fileNamingRules.exceptions.uiComponents;
            expectedDescription = "PascalCase (UI components)";
            isException = true;
          } else if (dirPath.includes("types") || fileName.includes("DTO") || fileName.includes("Entity")) {
            expectedPattern = fileNamingRules.exceptions.typeFiles;
            expectedDescription = "PascalCase ending with Type/DTO/Entity";
            isException = true;
          } else if (fileName.includes("-remotes.")) {
            expectedPattern = fileNamingRules.exceptions.networkFiles;
            expectedDescription = "[category]-remotes.ts";
            isException = true;
          } else if (fileName.includes("-service.")) {
            expectedPattern = fileNamingRules.exceptions.serviceFiles;
            expectedDescription = "[name]-service.ts";
            isException = true;
          } else if (fileName.includes("-keys.")) {
            expectedPattern = fileNamingRules.exceptions.keyFiles;
            expectedDescription = "[name]-keys.ts";
            isException = true;
          } else if (fileName.includes("-catalog.")) {
            expectedPattern = fileNamingRules.exceptions.catalogFiles;
            expectedDescription = "[name]-catalog.ts";
            isException = true;
          }
          
          if (!expectedPattern.test(fileName)) {
            violations.push({
              type: "File Naming",
              severity: "error",
              file: relativePath,
              issue: `File name doesn't follow naming convention`,
              expected: expectedDescription,
              actual: fileName
            });
          }
          
          // Additional checks for specific file types
          if (dirPath.includes("services") && !fileName.includes("-service.")) {
            violations.push({
              type: "Service File Pattern",
              severity: "warning",
              file: relativePath,
              issue: "Service files should follow [name]-service.ts pattern",
              expected: fileName.replace(/\.ts$/, "-service.ts"),
              actual: fileName
            });
          }
          
          if (dirPath.includes("network") && !fileName.includes("-remotes.") && fileName !== "index.ts") {
            violations.push({
              type: "Network File Pattern",
              severity: "warning",
              file: relativePath,
              issue: "Network files should follow [category]-remotes.ts pattern",
              expected: fileName.replace(/\.ts$/, "-remotes.ts"),
              actual: fileName
            });
          }
        }
      }
      
      // Check code-level naming conventions
      if (focus_area === "types" || focus_area === "functions" || focus_area === "variables" || focus_area === "all") {
        for (const file of files) {
          try {
            const content = await fs.readFile(file, "utf-8");
            const lines = content.split("\n");
            const relativePath = relative(PROJECT_ROOT, file);
            
            lines.forEach((line, index) => {
              const lineNumber = index + 1;
              
              // Check interface/type naming (should be PascalCase)
              if (focus_area === "types" || focus_area === "all") {
                const interfaceMatch = line.match(/(?:export\s+)?interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
                const typeMatch = line.match(/(?:export\s+)?type\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
                
                [interfaceMatch, typeMatch].forEach((match, isType) => {
                  if (match) {
                    const name = match[1];
                    const kind = isType ? "type" : "interface";
                    
                    if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
                      violations.push({
                        type: `${kind.charAt(0).toUpperCase() + kind.slice(1)} Naming`,
                        severity: "error",
                        file: relativePath,
                        line: lineNumber,
                        issue: `${kind} name should be PascalCase`,
                        expected: "PascalCase (e.g., PlayerResourceDTO, AbilityType)",
                        actual: name
                      });
                    }
                    
                    // Check for common suffixes
                    if (strict_mode) {
                      const hasMeaningfulSuffix = /^[A-Z][a-zA-Z0-9]*(Type|DTO|Entity|Props|Config|Meta|Catalog|Key|Service|Manager|State|Slice)s?$/.test(name);
                      if (!hasMeaningfulSuffix && name.length > 3) {
                        violations.push({
                          type: `${kind.charAt(0).toUpperCase() + kind.slice(1)} Suffix`,
                          severity: "suggestion",
                          file: relativePath,
                          line: lineNumber,
                          issue: `${kind} could have a more descriptive suffix`,
                          expected: "Consider adding suffix like Type, DTO, Entity, Props, etc.",
                          actual: name
                        });
                      }
                    }
                  }
                });
              }
              
              // Check function naming (should be camelCase)
              if (focus_area === "functions" || focus_area === "all") {
                const functionMatches = [
                  line.match(/(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/),
                  line.match(/(?:export\s+)?const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/),
                  line.match(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{/)
                ];
                
                functionMatches.forEach(match => {
                  if (match) {
                    const name = match[1];
                    
                    // Skip constructors and React components
                    if (name === "constructor" || /^[A-Z]/.test(name)) return;
                    
                    if (!/^[a-z][a-zA-Z0-9]*$/.test(name)) {
                      violations.push({
                        type: "Function Naming",
                        severity: "error",
                        file: relativePath,
                        line: lineNumber,
                        issue: "Function name should be camelCase",
                        expected: "camelCase (e.g., createPlayer, handleAbilityActivation)",
                        actual: name
                      });
                    }
                  }
                });
              }
              
              // Check variable naming (should be camelCase)
              if (focus_area === "variables" || focus_area === "all") {
                const constantMatch = line.match(/(?:export\s+)?const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[=:]/);
                const letMatch = line.match(/(?:export\s+)?let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[=:]/);
                
                [constantMatch, letMatch].forEach((match, isLet) => {
                  if (match) {
                    const name = match[1];
                    
                    // Constants in keys files can be SCREAMING_SNAKE_CASE
                    if (relativePath.includes("-keys.ts") && /^[A-Z][A-Z0-9_]*$/.test(name)) {
                      return; // This is acceptable
                    }
                    
                    // Component names can be PascalCase
                    if (relativePath.includes("client-ui") && /^[A-Z][a-zA-Z0-9]*$/.test(name)) {
                      return; // This is acceptable
                    }
                    
                    if (!/^[a-z][a-zA-Z0-9]*$/.test(name)) {
                      const expectedStyle = relativePath.includes("-keys.ts") ? 
                        "SCREAMING_SNAKE_CASE for constants or camelCase" : 
                        "camelCase";
                      
                      violations.push({
                        type: `${isLet ? 'Variable' : 'Constant'} Naming`,
                        severity: "warning",
                        file: relativePath,
                        line: lineNumber,
                        issue: `${isLet ? 'Variable' : 'Constant'} name should follow naming convention`,
                        expected: expectedStyle,
                        actual: name
                      });
                    }
                  }
                });
              }
              
              // Check for magic strings that should be constants
              if (strict_mode && (focus_area === "variables" || focus_area === "all")) {
                const magicStringPattern = /["'`]([a-zA-Z][a-zA-Z0-9_-]{3,})["'`]/g;
                let magicMatch;
                while ((magicMatch = magicStringPattern.exec(line)) !== null) {
                  const str = magicMatch[1];
                  
                  // Skip common patterns that are not magic strings
                  if (!/^(http|www|src|dest|temp|test|spec|mock|debug|info|warn|error)/.test(str) && 
                      !/\.(ts|tsx|js|jsx|json|md)$/.test(str) &&
                      str.length > 5) {
                    violations.push({
                      type: "Magic String",
                      severity: "suggestion",
                      file: relativePath,
                      line: lineNumber,
                      issue: "Consider extracting magic string to a constant",
                      expected: `const ${str.toUpperCase().replace(/[^A-Z0-9]/g, '_')} = "${str}"`,
                      actual: `"${str}"`
                    });
                  }
                }
              }
            });
          } catch (error) {
            // Skip files that can't be read
          }
        }
      }
      
      // Generate report
      if (violations.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `✅ **Naming Convention Check Complete**\n\nNo naming convention violations found!${focus_area !== "all" ? ` (Checked: ${focus_area})` : ""}\n\nThe codebase follows the project's naming conventions correctly.`
            }
          ]
        };
      }
      
      // Group violations by type and severity
      const errorViolations = violations.filter(v => v.severity === "error");
      const warningViolations = violations.filter(v => v.severity === "warning");
      const suggestionViolations = violations.filter(v => v.severity === "suggestion");
      
      let report = `🔍 **Naming Convention Violations Found**\n\n`;
      report += `Total violations: ${violations.length}${focus_area !== "all" ? ` (Focus: ${focus_area})` : ""}\n`;
      report += `- ❌ Errors: ${errorViolations.length}\n`;
      report += `- ⚠️ Warnings: ${warningViolations.length}\n`;
      report += `- 💡 Suggestions: ${suggestionViolations.length}\n\n`;
      
      if (errorViolations.length > 0) {
        report += `## ❌ Errors (Must Fix)\n\n`;
        errorViolations.forEach(violation => {
          report += `**${violation.type}** - \`${violation.file}\`${violation.line ? `:${violation.line}` : ""}\n`;
          report += `- Issue: ${violation.issue}\n`;
          report += `- Expected: ${violation.expected}\n`;
          report += `- Actual: \`${violation.actual}\`\n\n`;
        });
      }
      
      if (warningViolations.length > 0) {
        report += `## ⚠️ Warnings (Should Fix)\n\n`;
        warningViolations.forEach(violation => {
          report += `**${violation.type}** - \`${violation.file}\`${violation.line ? `:${violation.line}` : ""}\n`;
          report += `- Issue: ${violation.issue}\n`;
          report += `- Expected: ${violation.expected}\n`;
          report += `- Actual: \`${violation.actual}\`\n\n`;
        });
      }
      
      if (suggestionViolations.length > 0 && (strict_mode || suggestionViolations.length <= 10)) {
        report += `## 💡 Suggestions (Optional Improvements)\n\n`;
        const displaySuggestions = strict_mode ? suggestionViolations : suggestionViolations.slice(0, 10);
        displaySuggestions.forEach(violation => {
          report += `**${violation.type}** - \`${violation.file}\`${violation.line ? `:${violation.line}` : ""}\n`;
          report += `- Issue: ${violation.issue}\n`;
          report += `- Expected: ${violation.expected}\n`;
          report += `- Actual: \`${violation.actual}\`\n\n`;
        });
        
        if (!strict_mode && suggestionViolations.length > 10) {
          report += `*... and ${suggestionViolations.length - 10} more suggestions (use strict_mode to see all)*\n\n`;
        }
      }
      
      report += `## 📖 Project Naming Conventions\n\n`;
      report += `**File Names:**\n`;
      report += `- General: kebab-case (\`enhanced-combat-service.ts\`)\n`;
      report += `- UI Components: PascalCase (\`PlayerHealthBar.tsx\`)\n`;
      report += `- Type Files: PascalCase with suffix (\`SSEntity.ts\`, \`ResourceDTO.ts\`)\n`;
      report += `- Network Files: \`[category]-remotes.ts\`\n`;
      report += `- Service Files: \`[name]-service.ts\`\n\n`;
      report += `**Code Naming:**\n`;
      report += `- Interfaces/Types: PascalCase (\`PlayerResourceDTO\`)\n`;
      report += `- Functions: camelCase (\`createPlayer\`)\n`;
      report += `- Variables: camelCase (\`playerData\`)\n`;
      report += `- Constants in keys files: SCREAMING_SNAKE_CASE (\`ABILITY_KEYS\`)\n`;
      
      return {
        content: [
          {
            type: "text",
            text: report
          }
        ]
      };
      
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error checking naming conventions: ${error}`
          }
        ]
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Soul Steel Alpha MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
