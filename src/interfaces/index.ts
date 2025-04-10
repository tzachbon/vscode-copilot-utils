import * as vscode from 'vscode';

/**
 * Base interface for all features in the extension
 */
export interface CopilotUtilsFeature {
  /**
   * The unique identifier for this feature
   */
  id: string;

  /**
   * Display name for this feature
   */
  name: string;

  /**
   * Initialize the feature
   * @param context The extension context
   */
  initialize(context: vscode.ExtensionContext): void;

  /**
   * Dispose of any resources used by this feature
   */
  dispose(): void;
}

/**
 * Interface for variable handlers that can be registered with the variable service
 */
export interface VariableHandler {
  /**
   * Unique identifier for this variable
   */
  id: string;

  /**
   * Display name for this variable
   */
  name: string;

  /**
   * Description of what the variable does
   */
  description: string;

  /**
   * Function that returns the variable value
   * @returns A promise that resolves to the variable value as a string
   */
  getValue(): Promise<string>;
}

/**
 * Interface for Git changes between branches
 */
export interface GitChange {
  /**
   * Git status code (A, M, D, etc.)
   */
  status: string;

  /**
   * File path
   */
  file: string;

  /**
   * Human-readable status text
   */
  statusText: string;
}

/**
 * Interface for the configuration service
 */
export interface ConfigurationService {
  /**
   * Get a configuration value
   * @param section The configuration section
   * @param defaultValue The default value to return if the configuration doesn't exist
   * @returns The configuration value, or the default value if it doesn't exist
   */
  get<T>(section: string, defaultValue?: T): T;

  /**
   * Update a configuration value
   * @param section The configuration section
   * @param value The value to set
   * @param configurationTarget Where to store the configuration
   * @returns A promise that resolves when the configuration has been updated
   */
  update<T>(
    section: string,
    value: T,
    configurationTarget?: vscode.ConfigurationTarget,
  ): Thenable<void>;
}
