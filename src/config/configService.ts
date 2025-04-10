import * as vscode from 'vscode';
import { ConfigurationService } from '../interfaces';

/**
 * Handles configuration for the VS Code Copilot Utils extension
 */
export class CopilotUtilsConfigService implements ConfigurationService {
  private static instance: CopilotUtilsConfigService;
  private readonly configSection = 'copilotUtils';

  private constructor() {}

  /**
   * Get the singleton instance of the config service
   */
  public static getInstance(): CopilotUtilsConfigService {
    if (!CopilotUtilsConfigService.instance) {
      CopilotUtilsConfigService.instance = new CopilotUtilsConfigService();
    }
    return CopilotUtilsConfigService.instance;
  }

  /**
   * Get a configuration value
   * @param section The configuration section (without the copilotUtils prefix)
   * @param defaultValue The default value to return if the configuration doesn't exist
   * @returns The configuration value, or the default value if it doesn't exist
   */
  public get<T>(section: string, defaultValue?: T): T {
    const config = vscode.workspace.getConfiguration(this.configSection);
    return config.get<T>(section, defaultValue as T);
  }

  /**
   * Update a configuration value
   * @param section The configuration section (without the copilotUtils prefix)
   * @param value The value to set
   * @param configurationTarget Where to store the configuration
   * @returns A promise that resolves when the configuration has been updated
   */
  public update<T>(
    section: string,
    value: T,
    configurationTarget?: vscode.ConfigurationTarget,
  ): Thenable<void> {
    const config = vscode.workspace.getConfiguration(this.configSection);
    return config.update(section, value, configurationTarget);
  }

  /**
   * Check if the extension is enabled
   * @returns True if the extension is enabled
   */
  public isExtensionEnabled(): boolean {
    return this.get<boolean>('enabled', true);
  }

  /**
   * Check if the variables feature is enabled
   * @returns True if the variables feature is enabled
   */
  public isVariablesEnabled(): boolean {
    return this.get<boolean>('variables.enabled', true);
  }

  /**
   * Check if the status bar item should be shown
   * @returns True if the status bar item should be shown
   */
  public shouldShowStatusBarItem(): boolean {
    return this.get<boolean>('ui.showStatusBarItem', true);
  }

  /**
   * Get the configured default branch name
   * @returns The default branch name, or an empty string if not configured
   */
  public getDefaultBranch(): string {
    return this.get<string>('git.defaultBranch', '');
  }

  /**
   * Get the maximum number of lines to display for Git changes
   * @returns The maximum number of lines
   */
  public getMaxLineCount(): number {
    return this.get<number>('git.maxLineCount', 100);
  }
}

// Export a singleton instance
export const configService = CopilotUtilsConfigService.getInstance();
