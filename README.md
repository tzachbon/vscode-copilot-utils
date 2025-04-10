# Copilot Custom Variables

This VS Code extension adds custom variables to GitHub Copilot agents, enabling more context-aware AI assistance.

## Features

### Custom Variables

- **#branch-changes**: Detects and lists changes between your current branch and the main/master branch

## Usage

### Accessing Custom Variables in Copilot

When chatting with GitHub Copilot, you can use the custom variables by including them in your prompt:

```
Can you explain what changes I've made in this branch? #branch-changes
```

### Integration Methods

There are two ways to use the custom variables with Copilot:

1. **Direct Variable Usage**: Include the variable in your prompt with a # prefix (e.g., `#branch-changes`). You can process text with variables by using the "Copilot Variables: Process Text with Variables" command.

2. **Clipboard Integration**: Use the "Copilot Variables: Fetch Variable Value" command to copy the variable value to your clipboard, then paste it into your Copilot chat.

### Available Commands

This extension contributes the following commands:

- **Copilot Variables: Refresh Git Branch Changes**: Manually refresh and display the branch changes detection
- **Copilot Variables: Fetch Variable Value**: Get and display the current value of a custom variable
- **Copilot Variables: List Available Variables**: Show all registered custom variables
- **Copilot Variables: Process Text with Variables**: Replace variable references in text with their values

## Extension Settings

This extension contributes the following settings:

* `copilotVariables.enabled`: Enable or disable the Copilot Custom Variables extension
* `copilotVariables.defaultBranch`: Override the default branch name (leave empty to auto-detect main/master)
* `copilotVariables.showStatusBarItem`: Show the Copilot Variables item in the status bar
* `copilotVariables.maxLineCount`: Maximum number of lines to return when displaying branch changes

## How It Works

The extension registers custom variable handlers that can be accessed by Copilot. When you use a hashtag followed by a registered variable name (e.g., `#branch-changes`), the extension will:

1. Detect the current branch you're on
2. Find the main/master branch in your repository
3. Compare the differences between these branches
4. Return a formatted list of all changes (added, modified, deleted files)

## Requirements

- Git must be installed and accessible
- The workspace must be a Git repository
- A main or master branch must exist in the repository

## Known Issues

- The extension currently only detects the first workspace folder if multiple are open
- Direct integration with Copilot Chat API is not yet available, so variable substitution must be done manually

## Future Plans

Future versions may include additional custom variables such as:
- #code-coverage
- #test-status
- #pr-comments
- #dependencies

## Release Notes

### 0.0.1

Initial release with #branch-changes variable support
