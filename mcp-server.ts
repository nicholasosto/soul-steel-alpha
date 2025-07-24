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
		const packageJson = JSON.parse(await fs.readFile(join(PROJECT_ROOT, "package.json"), "utf-8"));

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

// Register tools
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
	},
);

server.tool("list_files", "List all TypeScript files in the Roblox project", {}, async () => {
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
});

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
	},
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
	},
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
	},
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
