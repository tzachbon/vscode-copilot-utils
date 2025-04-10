#!/usr/bin/env node

/**
 * Dynamic Local Installation Script for VS Code Copilot Utils
 *
 * This script:
 * 1. Builds the extension
 * 2. Dynamically determines the version from package.json
 * 3. Installs the extension to the local VS Code installation
 * 4. Provides status feedback during the process
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Terminal colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

// Helper function to execute commands with feedback
function executeStep(command, message) {
  console.log(`${colors.blue}► ${message}...${colors.reset}`);
  try {
    const output = execSync(command, { encoding: 'utf8' });
    console.log(`${colors.green}✓ Done!${colors.reset}\n`);
    return output.trim();
  } catch (error) {
    console.error(`${colors.red}✗ Error: ${error.message}${colors.reset}\n`);
    throw error;
  }
}

try {
  // Get the project root directory
  const projectRoot = path.resolve(__dirname, '..');

  // Read package.json to get the extension name and version dynamically
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  const extensionName = packageJson.name;
  const extensionVersion = packageJson.version;
  const vsixFileName = `${extensionName}-${extensionVersion}.vsix`;
  const vsixPath = path.join(projectRoot, vsixFileName);

  console.log(`${colors.blue}================================================${colors.reset}`);
  console.log(`${colors.yellow}Installing ${extensionName} v${extensionVersion}${colors.reset}`);
  console.log(`${colors.blue}================================================${colors.reset}\n`);

  // Build the extension
  executeStep('npm run build-vsix', 'Building extension');

  // Verify the VSIX file exists
  if (!fs.existsSync(vsixPath)) {
    throw new Error(`VSIX file not found at ${vsixPath}`);
  }

  // Install the extension
  executeStep(`code --install-extension ${vsixPath}`, 'Installing extension');

  console.log(
    `${colors.green}✅ Successfully installed ${extensionName} v${extensionVersion}!${colors.reset}`,
  );
  console.log(`${colors.yellow}ℹ️ Please reload VS Code to activate the extension.${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}❌ Installation failed: ${error.message}${colors.reset}`);
  process.exit(1);
}
