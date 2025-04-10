#!/usr/bin/env node

/**
 * Create Release Script for VS Code Copilot Utils
 * 
 * This script:
 * 1. Bumps the version in package.json
 * 2. Creates a new git tag
 * 3. Optionally pushes the tag to trigger the GitHub Actions release workflow
 * 
 * Usage:
 *   node scripts/create-release.js [patch|minor|major] [--push]
 * 
 * Examples:
 *   node scripts/create-release.js patch --push  # Bump patch version and push
 *   node scripts/create-release.js minor         # Bump minor version but don't push
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Terminal colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Parse command line arguments
const versionType = process.argv[2] || 'patch';
const shouldPush = process.argv.includes('--push');

// Validate version type
if (!['patch', 'minor', 'major'].includes(versionType)) {
  console.error(`${colors.red}Error: Version type must be one of 'patch', 'minor', or 'major'${colors.reset}`);
  process.exit(1);
}

// Project paths
const projectRoot = path.resolve(__dirname, '..');
const packageJsonPath = path.join(projectRoot, 'package.json');

// Helper function to execute commands with feedback
function executeStep(command, message) {
  console.log(`${colors.blue}► ${message}...${colors.reset}`);
  try {
    const output = execSync(command, { encoding: 'utf8', cwd: projectRoot });
    console.log(`${colors.green}✓ Done!${colors.reset}\n`);
    return output.trim();
  } catch (error) {
    console.error(`${colors.red}✗ Error: ${error.message}${colors.reset}\n`);
    throw error;
  }
}

// Check for uncommitted changes
try {
  const status = execSync('git status --porcelain', { encoding: 'utf8', cwd: projectRoot });
  if (status.trim()) {
    console.error(`${colors.red}Error: There are uncommitted changes in the repository.${colors.reset}`);
    console.error(`${colors.yellow}Please commit or stash your changes before creating a release.${colors.reset}`);
    process.exit(1);
  }
} catch (error) {
  console.error(`${colors.red}Error checking git status: ${error.message}${colors.reset}`);
  process.exit(1);
}

try {
  // Read the current package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const currentVersion = packageJson.version;
  
  // Calculate the new version
  const versionParts = currentVersion.split('.').map(Number);
  let [major, minor, patch] = versionParts;
  
  switch (versionType) {
    case 'major':
      major++;
      minor = 0;
      patch = 0;
      break;
    case 'minor':
      minor++;
      patch = 0;
      break;
    default: // patch
      patch++;
      break;
  }
  
  const newVersion = `${major}.${minor}.${patch}`;
  
  console.log(`${colors.blue}================================================${colors.reset}`);
  console.log(`${colors.yellow}Creating release for ${packageJson.displayName || packageJson.name}${colors.reset}`);
  console.log(`${colors.blue}================================================${colors.reset}\n`);
  console.log(`${colors.cyan}Current version: ${colors.reset}${currentVersion}`);
  console.log(`${colors.cyan}New version:     ${colors.reset}${newVersion}`);
  console.log(`${colors.cyan}Push to GitHub:  ${colors.reset}${shouldPush ? 'Yes' : 'No'}\n`);
  
  // Update the version in package.json
  packageJson.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
  
  // Commit the version bump
  executeStep(`git add package.json`, 'Staging package.json');
  executeStep(`git commit -m "Bump version to ${newVersion}"`, `Committing version bump to ${newVersion}`);
  
  // Create a new tag
  const tagName = `v${newVersion}`;
  executeStep(`git tag -a ${tagName} -m "Release ${tagName}"`, `Creating tag ${tagName}`);
  
  // Push changes and tag if --push flag is set
  if (shouldPush) {
    executeStep('git push', 'Pushing changes to remote');
    executeStep(`git push origin ${tagName}`, `Pushing tag ${tagName} to remote`);
    console.log(`${colors.green}✅ Successfully created and pushed release ${tagName}!${colors.reset}`);
    console.log(`${colors.yellow}The GitHub Actions workflow should now be triggered to create a release.${colors.reset}`);
  } else {
    console.log(`${colors.green}✅ Successfully created release ${tagName} locally!${colors.reset}`);
    console.log(`${colors.yellow}To trigger the GitHub release workflow, push the tag with:${colors.reset}`);
    console.log(`${colors.blue}  git push origin ${tagName}${colors.reset}`);
  }
  
} catch (error) {
  console.error(`${colors.red}❌ Release creation failed: ${error.message}${colors.reset}`);
  process.exit(1);
}