<!-- Use this file to provide workspace-specific custom instructions to Copilot. -->

# Copilot Extension Development Instructions

This is a VS Code extension project that adds custom variables to GitHub Copilot.

## Extension Details

The main purpose of this extension is to provide custom variables to GitHub Copilot agents to enhance their context-awareness. Currently, it supports:

- `#branch-changes`: Retrieves changes between the current branch and main/master branch

## Architecture

- We use `simple-git` to interact with Git repositories
- Custom variables are registered using a Map that stores handler functions
- Commands are provided to manually refresh data and fetch variable values
- The extension activates on startup to ensure the variables are always available

## Guidelines

When suggesting code modifications:

1. Remember that functions returning branch changes should be asynchronous
2. Always handle potential errors in Git operations
3. Format change output in a human-readable way
4. Consider the case where there is no main/master branch
5. Use vscode APIs for any UI interactions

## Future Development

We plan to extend this with more custom variables:

- Code coverage information
- Test status
- PR comments
- Dependency information
