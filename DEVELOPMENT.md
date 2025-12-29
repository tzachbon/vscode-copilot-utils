# Development Guide

This guide will help you set up the development environment and contribute to the VS Code Copilot Utils extension.

## Prerequisites

- Node.js 20.x or higher
- npm 9.x or higher
- VS Code 1.95.0 or higher
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/tzachbon/vscode-copilot-utils.git
cd vscode-copilot-utils
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Extension

```bash
npm run compile
```

This will:
- Run TypeScript type checking
- Run ESLint
- Build the extension with esbuild

## Development Workflow

### Running the Extension Locally

1. Open the project in VS Code
2. Press `F5` or select "Run > Start Debugging"
3. This will open a new VS Code window (Extension Development Host) with the extension loaded
4. Test your changes in this window

### Watch Mode

For continuous development:

```bash
npm run watch
```

This runs two watch processes in parallel:
- `watch:esbuild` - Rebuilds on file changes
- `watch:tsc` - Type checks on file changes

### Type Checking

Run TypeScript type checking without emitting files:

```bash
npm run check-types
```

### Linting

Check code style with ESLint:

```bash
npm run lint
```

### Testing

Run the test suite:

```bash
npm test
```

This will:
1. Compile tests
2. Compile extension
3. Run linter
4. Execute tests using VS Code test runner

To watch tests during development:

```bash
npm run watch-tests
```

## Project Structure

```
vscode-copilot-utils/
├── src/
│   ├── config/              # Configuration service
│   │   └── configService.ts
│   ├── git/                 # Git-related functionality
│   │   └── gitService.ts
│   ├── interfaces/          # TypeScript interfaces
│   │   └── index.ts
│   ├── lmTools/             # Language Model tools
│   │   ├── branchChangesTool.ts
│   │   └── index.ts
│   ├── test/                # Test files
│   │   └── extension.test.ts
│   ├── utils/               # Utility functions
│   │   └── statusBarManager.ts
│   ├── variables/           # Variable implementations
│   │   ├── branchChangesVariable.ts
│   │   └── variableService.ts
│   └── extension.ts         # Main entry point
├── scripts/                 # Build and release scripts
├── package.json
├── tsconfig.json
├── eslint.config.mjs
└── esbuild.js
```

## Architecture

### Core Concepts

#### Features
The extension is organized around "features" that implement the `CopilotUtilsFeature` interface:

```typescript
interface CopilotUtilsFeature {
  id: string;
  name: string;
  initialize(context: vscode.ExtensionContext): void;
  dispose(): void;
}
```

#### Variables
Custom variables implement the `VariableHandler` interface:

```typescript
interface VariableHandler {
  id: string;
  name: string;
  description: string;
  getValue(): Promise<string>;
}
```

#### Services
Services use the singleton pattern and provide centralized functionality:
- `configService` - Configuration management
- `gitService` - Git operations
- `variableService` - Variable registration and resolution
- `statusBarManager` - UI status bar management

### Adding a New Variable

1. Create a new file in `src/variables/` (e.g., `myVariable.ts`):

```typescript
import type { VariableHandler } from '../interfaces';

export class MyVariable implements VariableHandler {
  public readonly id = 'my-variable';
  public readonly name = 'My Variable';
  public readonly description = 'Description of what this variable does';

  public async getValue(): Promise<string> {
    // Your implementation here
    return 'variable value';
  }
}

export function createMyVariable(): VariableHandler {
  return new MyVariable();
}
```

2. Register it in `src/extension.ts`:

```typescript
import { createMyVariable } from './variables/myVariable';

function registerVariables(): void {
  if (!configService.isVariablesEnabled()) {
    return;
  }

  variableService.registerVariable(createBranchChangesVariable());
  variableService.registerVariable(createMyVariable()); // Add this line
}
```

3. Optionally, add it to `package.json` as a Language Model Tool:

```json
{
  "contributes": {
    "languageModelTools": [
      {
        "name": "vscode-copilot-utils.my-variable",
        "displayName": "My Variable",
        "description": "Description for Copilot",
        "canBeReferencedInPrompt": true,
        "toolReferenceName": "my-variable"
      }
    ]
  }
}
```

### Adding a New Feature

1. Create a new class that implements `CopilotUtilsFeature`:

```typescript
import * as vscode from 'vscode';
import type { CopilotUtilsFeature } from './interfaces';

export class MyFeature implements CopilotUtilsFeature {
  public readonly id = 'my-feature';
  public readonly name = 'My Feature';

  public initialize(context: vscode.ExtensionContext): void {
    // Initialize your feature
    // Register commands, etc.
  }

  public dispose(): void {
    // Clean up resources
  }
}
```

2. Register it in `src/extension.ts`:

```typescript
import { MyFeature } from './myFeature';

const features: CopilotUtilsFeature[] = [
  variableService,
  new MyFeature(), // Add this line
];
```

## Building for Production

Create a production build:

```bash
npm run package
```

This creates an optimized build in the `dist/` directory.

## Creating a VSIX Package

To create a `.vsix` file for distribution:

```bash
npm run build-vsix
```

This creates a `vscode-copilot-utils-<version>.vsix` file in the project root.

## Installing Locally

To install the extension locally for testing:

```bash
npm run install-local
```

This builds a VSIX and installs it in VS Code.

## Release Process

The project includes automated release scripts:

### Patch Release (0.0.x)
```bash
npm run release:patch        # Creates tag locally
npm run release:patch:push   # Creates tag and pushes
```

### Minor Release (0.x.0)
```bash
npm run release:minor
npm run release:minor:push
```

### Major Release (x.0.0)
```bash
npm run release:major
npm run release:major:push
```

## Configuration

The extension supports several configuration options (see `package.json`):

- `copilotUtils.enabled` - Enable/disable the extension
- `copilotUtils.variables.enabled` - Enable/disable variables
- `copilotUtils.git.defaultBranch` - Override default branch detection
- `copilotUtils.ui.showStatusBarItem` - Show/hide status bar item
- `copilotUtils.git.maxLineCount` - Max lines to show in branch changes

Access configuration in code:

```typescript
import { configService } from './config/configService';

const isEnabled = configService.isExtensionEnabled();
const maxLines = configService.getMaxLineCount();
```

## Testing

### Unit Tests

Tests are located in `src/test/extension.test.ts` and use:
- Mocha test framework
- Sinon for mocking
- VS Code test APIs

Example test:

```typescript
test('My feature should work', async () => {
  const result = await myFeature.doSomething();
  assert.strictEqual(result, expectedValue);
});
```

### Running Tests in VS Code

1. Open the project in VS Code
2. Open the Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
3. Run "Tasks: Run Test Task"

### Debugging Tests

1. Set breakpoints in your test file
2. Press `F5` or select "Run > Start Debugging"
3. Choose "Extension Tests" from the dropdown

## Troubleshooting

### Extension Not Activating

Check the "Developer: Show Logs" output in VS Code:
- Look for activation errors
- Verify the extension is enabled in settings
- Check that you're in a workspace (not a single file)

### Git Features Not Working

Ensure:
- You're in a Git repository
- Git is installed and in your PATH
- The workspace folder contains a `.git` directory

### Build Errors

1. Clear cache and rebuild:
```bash
rm -rf node_modules dist out
npm install
npm run compile
```

2. Check TypeScript version compatibility
3. Verify all dependencies are installed

## Code Style

### TypeScript

- Use strict mode
- Prefer `const` over `let`
- Use async/await over promises
- Add JSDoc comments for public APIs
- Use descriptive variable names

### Naming Conventions

- Files: camelCase (e.g., `gitService.ts`)
- Classes: PascalCase (e.g., `GitService`)
- Interfaces: PascalCase (e.g., `VariableHandler`)
- Functions: camelCase (e.g., `getCurrentBranch`)
- Constants: camelCase or UPPER_SNAKE_CASE

### ESLint Rules

The project follows these rules:
- Use semicolons
- Prefer `===` over `==`
- Always use curly braces for blocks
- No throw literal (throw Error objects)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run tests and linting (`npm test`)
5. Commit your changes (`git commit -am 'Add my feature'`)
6. Push to the branch (`git push origin feature/my-feature`)
7. Create a Pull Request

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [GitHub Copilot Extension Guide](https://code.visualstudio.com/api/extension-guides/chat)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [simple-git Documentation](https://github.com/steveukx/git-js)

## Getting Help

- Open an issue on GitHub
- Check existing issues and discussions
- Review the VS Code Extension samples

## License

MIT License - See LICENSE file for details
