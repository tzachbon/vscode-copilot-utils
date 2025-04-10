import * as vscode from 'vscode';
import { configService } from '../config/configService';

/**
 * Manages the extension's status bar items
 */
export class StatusBarManager {
  private static instance: StatusBarManager;
  private statusBarItem?: vscode.StatusBarItem;

  private constructor() {}

  /**
   * Get the singleton instance of the status bar manager
   */
  public static getInstance(): StatusBarManager {
    if (!StatusBarManager.instance) {
      StatusBarManager.instance = new StatusBarManager();
    }
    return StatusBarManager.instance;
  }

  /**
   * Initialize the status bar
   * @param context VS Code extension context
   */
  public initialize(context: vscode.ExtensionContext): void {
    if (this.statusBarItem) {
      this.dispose();
    }

    // Check if the status bar item should be shown
    if (!configService.shouldShowStatusBarItem()) {
      return;
    }

    // Create the status bar item
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);

    this.statusBarItem.text = '$(copilot) Copilot Utils';
    this.statusBarItem.tooltip = 'VS Code Copilot Utils';
    this.statusBarItem.command = 'vscode-copilot-utils.listVariables';
    this.statusBarItem.show();

    context.subscriptions.push(this.statusBarItem);
  }

  /**
   * Dispose of the status bar item
   */
  public dispose(): void {
    if (this.statusBarItem) {
      this.statusBarItem.dispose();
      this.statusBarItem = undefined;
    }
  }
}

// Export a singleton instance
export const statusBarManager = StatusBarManager.getInstance();
