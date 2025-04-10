# VS Code Copilot Utils

A collection of utilities for enhancing GitHub Copilot in VS Code, including custom variables, context providers, and more.

## Features

Currently, this extension provides:

### Custom Variables for Copilot

- **#branch-changes**: Detects and lists changes between your current branch and the main/master branch

## Usage

### Accessing Custom Variables in Copilot

When chatting with GitHub Copilot, you can use the custom variables by including them in your prompt:

```
Can you explain what changes I've made in this branch? #branch-changes
```

### Integration Methods

There are two ways to use the custom variables with Copilot:

1. **Direct Variable Usage**: Include the variable in your prompt with a # prefix (e.g., `#branch-changes`). You can process text with variables by using the "Copilot Utils: Process Text with Variables" command.

2. **Clipboard Integration**: Use the "Copilot Utils: Fetch Variable Value" command to copy the variable value to your clipboard, then paste it into your Copilot chat.

### Available Commands

This extension contributes the following commands:

- **Copilot Utils: Refresh Git Branch Changes**: Manually refresh and display the branch changes detection
- **Copilot Utils: Fetch Variable Value**: Get and display the current value of a custom variable
- **Copilot Utils: List Available Variables**: Show all registered custom variables
- **Copilot Utils: Process Text with Variables**: Replace variable references in text with their values

## Extension Settings

This extension contributes the following settings:

- `copilotUtils.enabled`: Enable or disable the VS Code Copilot Utils extension
- `copilotUtils.variables.enabled`: Enable or disable the custom variables feature
- `copilotUtils.git.defaultBranch`: Override the default branch name (leave empty to auto-detect main/master)
- `copilotUtils.ui.showStatusBarItem`: Show the Copilot Utils item in the status bar
- `copilotUtils.git.maxLineCount`: Maximum number of lines to return when displaying branch changes

## How It Works

The extension provides utilities to enhance your GitHub Copilot experience:

### Custom Variables

Custom variables can be accessed by using a hashtag followed by a registered variable name (e.g., `#branch-changes`). The extension will:

1. Detect the current branch you're on
2. Find the main/master branch in your repository
3. Compare the differences between these branches
4. Return a formatted list of all changes (added, modified, deleted files)

## Extending the Extension

This extension is designed with a modular architecture that makes it easy to add new features and variables:

1. To add a new variable, create a class that implements the `VariableHandler` interface
2. To add a new feature, create a class that implements the `CopilotUtilsFeature` interface

## Requirements

- Git must be installed and accessible (for Git-related features)
- The workspace must be a Git repository (for Git-related features)

## Known Issues

- The extension currently only detects the first workspace folder if multiple are open
- Direct integration with Copilot Chat API is not yet available, so variable substitution must be done manually

## Future Plans

Future versions may include additional features and variables such as:

- Code coverage information
- Test status
- PR comments
- Dependency information
- Code quality insights

## Release Notes

### 0.0.1

Initial release with:

- Custom variables framework
- #branch-changes variable support
