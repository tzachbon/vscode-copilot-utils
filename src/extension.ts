import * as vscode from 'vscode';
import { configService } from './config/configService';
import { variableService } from './variables/variableService';
import { createBranchChangesVariable } from './variables/branchChangesVariable';
import { gitService } from './git/gitService';
import { statusBarManager } from './utils/statusBarManager';
import { BranchChangesToolProvider } from './lmTools';
import type { CopilotUtilsFeature } from './interfaces';

// Collection of all features
const features: CopilotUtilsFeature[] = [variableService];

/**
 * This method is called when the extension is activated
 * @param context The extension context
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "vscode-copilot-utils" is now active!');

  // Check if extension is enabled
  if (!configService.isExtensionEnabled()) {
    console.log('Extension "vscode-copilot-utils" is disabled in settings');
    return;
  }

  // Register commands that are always available
  registerGlobalCommands(context);

  // Initialize features
  for (const feature of features) {
    try {
      feature.initialize(context);
    } catch (error) {
      console.error(`Error initializing feature "${feature.name}":`, error);
    }
  }

  // Register variables
  registerVariables();

  // Register Copilot tools
  registerCopilotTools(context);

  // Initialize UI components
  statusBarManager.initialize(context);
}

/**
 * Register global commands that are always available
 * @param context The extension context
 */
function registerGlobalCommands(context: vscode.ExtensionContext): void {
  // Register a command to manually refresh branch changes
  const refreshCommand = vscode.commands.registerCommand(
    'vscode-copilot-utils.refreshBranchChanges',
    async () => {
      try {
        const changes = await gitService.formatBranchChanges();
        const currentBranch = await gitService.getCurrentBranch();
        const mainBranch = await gitService.getMainBranch();

        // Show a more detailed message in the UI
        vscode.window.showInformationMessage(
          `Branch changes between '${currentBranch}' and '${mainBranch}'`,
          { modal: false, detail: changes },
        );
      } catch (error) {
        vscode.window.showErrorMessage(
          `Error fetching branch changes: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    },
  );

  context.subscriptions.push(refreshCommand);
}

/**
 * Register Copilot tools with VS Code's Language Model API
 * @param context The extension context
 */
function registerCopilotTools(context: vscode.ExtensionContext): void {
  try {
    // Register branch changes tool
    const branchChangesToolProvider = new BranchChangesToolProvider();
    branchChangesToolProvider.register(context);
    console.log('Successfully registered branch-changes tool for Copilot');
  } catch (error) {
    console.error('Error registering Copilot tools:', error);
  }
}

/**
 * Register all custom variables
 */
function registerVariables(): void {
  // Only register variables if the feature is enabled
  if (!configService.isVariablesEnabled()) {
    return;
  }

  // Register the branch-changes variable
  variableService.registerVariable(createBranchChangesVariable());

  // Additional variables can be registered here
}

/**
 * This method is called when the extension is deactivated
 */
export function deactivate() {
  // Dispose of all features
  for (const feature of features) {
    try {
      feature.dispose();
    } catch (error) {
      console.error(`Error disposing feature "${feature.name}":`, error);
    }
  }

  // Dispose of UI components
  statusBarManager.dispose();
}
