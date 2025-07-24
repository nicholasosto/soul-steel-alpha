#!/bin/bash

# Environment Setup Script for Soul Steel Alpha
# Roblox TypeScript Project with MCP Server Integration

set -e  # Exit on any error

echo "🚀 Setting up Soul Steel Alpha development environment..."

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "tsconfig.json" ]; then
    echo "❌ Error: This script must be run from the project root directory"
    echo "Please make sure you're in the directory containing package.json and tsconfig.json"
    exit 1
fi

echo "📍 Current directory: $(pwd)"
echo "✅ Project files detected"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for Node.js
echo "🔍 Checking Node.js installation..."
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js found: $NODE_VERSION"
    
    # Check if Node.js version is compatible (should be 18+ for MCP)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | cut -d'v' -f2)
    if [ "$MAJOR_VERSION" -lt 18 ]; then
        echo "⚠️  Warning: Node.js version $NODE_VERSION detected. Recommended: v18+ for MCP server"
    fi
else
    echo "❌ Node.js not found. Please install Node.js (v18 or higher) before running this script"
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check for npm
echo "🔍 Checking npm installation..."
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm found: v$NPM_VERSION"
else
    echo "❌ npm not found. Please install npm"
    exit 1
fi

# Check for pnpm (preferred package manager based on pnpm-lock.yaml)
echo "🔍 Checking pnpm installation..."
if command_exists pnpm; then
    PNPM_VERSION=$(pnpm --version)
    echo "✅ pnpm found: v$PNPM_VERSION"
    PACKAGE_MANAGER="pnpm"
else
    echo "⚠️  pnpm not found. Installing pnpm globally..."
    npm install -g pnpm
    PACKAGE_MANAGER="pnpm"
fi

# Install project dependencies
echo "📦 Installing project dependencies..."
if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
    pnpm install
else
    npm install
fi

echo "✅ Dependencies installed successfully"

# Check for Roblox TypeScript compiler
echo "🔍 Checking Roblox TypeScript installation..."
if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
    if pnpm list roblox-ts > /dev/null 2>&1; then
        echo "✅ Roblox TypeScript found in dependencies"
    else
        echo "❌ Roblox TypeScript not found in dependencies"
        exit 1
    fi
else
    if npm list roblox-ts > /dev/null 2>&1; then
        echo "✅ Roblox TypeScript found in dependencies"
    else
        echo "❌ Roblox TypeScript not found in dependencies"
        exit 1
    fi
fi

# Build the Roblox TypeScript project
echo "🔨 Building Roblox TypeScript project..."
if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
    pnpm run build
else
    npm run build
fi

echo "✅ Roblox TypeScript build completed"

# Build the MCP server
echo "🔨 Building MCP server..."
if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
    pnpm run build:mcp
else
    npm run build:mcp
fi

echo "✅ MCP server build completed"

# Check if Rojo is needed (based on aftman.toml and default.project.json)
if [ -f "aftman.toml" ]; then
    echo "🔍 Checking for Aftman (Rojo toolchain manager)..."
    if command_exists aftman; then
        echo "✅ Aftman found"
        echo "📦 Installing Rojo via Aftman..."
        aftman install
        echo "✅ Rojo installed via Aftman"
    else
        echo "⚠️  Aftman not found. Rojo tools may need manual installation"
        echo "Visit: https://github.com/LPGhatguy/aftman"
    fi
fi

# Check for Rokit
if [ -f "rokit.toml" ]; then
    echo "🔍 Checking for Rokit..."
    if command_exists rokit; then
        echo "✅ Rokit found"
        echo "📦 Installing tools via Rokit..."
        rokit install
        echo "✅ Rokit tools installed"
    else
        echo "⚠️  Rokit not found but rokit.toml exists"
        echo "Visit: https://github.com/rojo-rbx/rokit"
    fi
fi

# Run linting to ensure code quality
echo "🔍 Running code linting..."
if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
    pnpm run lint
else
    npm run lint
fi

echo "✅ Linting completed"

# Verify build outputs
echo "🔍 Verifying build outputs..."

if [ -d "out" ]; then
    echo "✅ Roblox TypeScript output directory found: out/"
else
    echo "⚠️  Roblox TypeScript output directory not found"
fi

if [ -f "mcp-build/mcp-server.js" ]; then
    echo "✅ MCP server build found: mcp-build/mcp-server.js"
else
    echo "⚠️  MCP server build not found"
fi

# Display available npm scripts
echo ""
echo "🎯 Available development commands:"
echo "  Build Roblox project:     $PACKAGE_MANAGER run build"
echo "  Watch for changes:        $PACKAGE_MANAGER run watch"
echo "  Run linting:              $PACKAGE_MANAGER run lint"
echo "  Fix linting issues:       $PACKAGE_MANAGER run lint:fix"
echo "  Build MCP server:         $PACKAGE_MANAGER run build:mcp"
echo "  Run MCP server:           $PACKAGE_MANAGER run mcp:server"

# Display project information
echo ""
echo "📋 Project Information:"
echo "  Name: Soul Steel Alpha"
echo "  Type: Roblox TypeScript Project with MCP Integration"
echo "  Client code: src/client/"
echo "  Server code: src/server/"
echo "  Shared code: src/shared/"
echo "  Build output: out/"
echo "  MCP server: mcp-build/mcp-server.js"

echo ""
echo "🎉 Environment setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Start development with: $PACKAGE_MANAGER run watch"
echo "2. Open Roblox Studio and connect to the project using Rojo"
echo "3. For AI assistance, run the MCP server: $PACKAGE_MANAGER run mcp:server"
echo ""
echo "Happy coding! 🚀"
