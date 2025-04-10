import * as vscode from 'vscode';
import type { VariableHandler, CopilotUtilsFeature } from '../interfaces';
import { configService } from '../config/configService';

/**
 * Service for managing custom variables for Copilot
 */
export class VariableService implements CopilotUtilsFeature {
  private static instance: VariableService;
  private variables: Map<string, VariableHandler> = new Map();
  private _onVariableRegistered = new vscode.EventEmitter<string>();
  private disposables: vscode.Disposable[] = [];

  public readonly id = 'variables';
  public readonly name = 'Custom Variables';

  // Event fired when a new variable is registered
  readonly onVariableRegistered = this._onVariableRegistered.event;

  private constructor() {}

  /**
   * Get the singleton instance of the variable service
   */
  public static getInstance(): VariableService {
    if (!VariableService.instance) {
      VariableService.instance = new VariableService();
    }
    return VariableService.instance;
  }

  /**
   * Initialize the variable feature
   * @param context The extension context
   */
  public initialize(context: vscode.ExtensionContext): void {
    // Only initialize if enabled in configuration
    if (!configService.isVariablesEnabled()) {
      return;
    }

    // Register commands
    const listCommand = vscode.commands.registerCommand(
      'vscode-copilot-utils.listVariables',
      this.listVariables.bind(this),
    );
    const fetchCommand = vscode.commands.registerCommand(
      'vscode-copilot-utils.fetchVariable',
      this.fetchVariable.bind(this),
    );
    const processTextCommand = vscode.commands.registerCommand(
      'vscode-copilot-utils.processText',
      this.processText.bind(this),
    );

    this.disposables.push(listCommand, fetchCommand, processTextCommand);
    context.subscriptions.push(...this.disposables);
  }

  /**
   * Register a new variable
   * @param variable The variable handler to register
   */
  public registerVariable(variable: VariableHandler): void {
    this.variables.set(variable.id.toLowerCase(), variable);
    this._onVariableRegistered.fire(variable.id);
    console.log(`Registered Copilot variable: #${variable.id}`);
  }

  /**
   * Check if a variable exists
   * @param id The variable ID to check
   * @returns True if the variable exists
   */
  public hasVariable(id: string): boolean {
    return this.variables.has(id.toLowerCase());
  }

  /**
   * Get all registered variables
   * @returns Array of variable handlers
   */
  public getVariables(): VariableHandler[] {
    return Array.from(this.variables.values());
  }

  /**
   * Get variable IDs
   * @returns Array of variable IDs
   */
  public getVariableIds(): string[] {
    return Array.from(this.variables.keys());
  }

  /**
   * Get a variable by ID
   * @param id The variable ID
   * @returns The variable handler, or undefined if not found
   */
  public getVariable(id: string): VariableHandler | undefined {
    return this.variables.get(id.toLowerCase());
  }

  /**
   * Get a variable's value
   * @param id The variable ID
   * @returns The variable value, or undefined if not found
   */
  public async getVariableValue(id: string): Promise<string | undefined> {
    const variable = this.getVariable(id);

    if (!variable) {
      return undefined;
    }

    try {
      return await variable.getValue();
    } catch (error) {
      console.error(`Error executing variable handler for #${id}:`, error);
      return `Error retrieving #${id}: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  /**
   * Process text and replace variable references with their values
   * @param initialText The text to process
   * @returns The processed text with variables replaced
   */
  public async processText(initialText?: string): Promise<string> {
    let text = initialText;
    if (!text) {
      text =
        (await vscode.window.showInputBox({
          placeHolder: 'Enter text with #variable references',
          prompt: 'Process text with Copilot variables',
        })) || '';

      if (!text) {
        return ''; // User cancelled
      }
    }

    // Regular expression to find #variable-name patterns
    const variablePattern = /#([a-zA-Z0-9\-_]+)/g;

    let result = text;
    const matches = text.match(variablePattern);

    if (!matches) {
      return result;
    }

    // Process each variable reference
    for (const match of matches) {
      const variableName = match.substring(1); // Remove the # prefix
      const value = await this.getVariableValue(variableName);

      if (value !== undefined) {
        // Replace the variable reference with its value
        result = result.replace(match, value);
      }
    }

    // Copy to clipboard
    await vscode.env.clipboard.writeText(result);

    vscode.window.showInformationMessage(
      'Processed text with variables replaced and copied to clipboard',
      { modal: false, detail: result },
    );

    return result;
  }

  /**
   * Handler for the listVariables command
   */
  private listVariables(): void {
    const variables = this.getVariables();

    if (variables.length === 0) {
      vscode.window.showInformationMessage('No Copilot custom variables are registered.');
      return;
    }

    const variablesMarkdown = variables.map((v) => `- #${v.id}: ${v.description}`).join('\n');
    const message = `Available Copilot custom variables:\n${variablesMarkdown}`;

    vscode.window.showInformationMessage(message);
  }

  /**
   * Handler for the fetchVariable command
   */
  private async fetchVariable(initialVariableName?: string): Promise<string | undefined> {
    let variableName = initialVariableName;
    if (!variableName) {
      // If no variable name provided, show a quick pick to select one
      const variables = this.getVariables();

      if (variables.length === 0) {
        vscode.window.showInformationMessage('No Copilot custom variables are registered.');
        return;
      }

      const selectedVariable = await vscode.window.showQuickPick(
        variables.map((v) => ({ label: `#${v.id}`, description: v.description, id: v.id })),
        {
          placeHolder: 'Select a variable to fetch',
          title: 'Copilot Custom Variables',
        },
      );

      if (!selectedVariable) {
        return; // User cancelled
      }

      variableName = selectedVariable.id;
    }

    try {
      const value = await this.getVariableValue(variableName);

      if (value) {
        // Show the full value in a dialog
        vscode.window.showInformationMessage(`Value of #${variableName}:`, {
          modal: false,
          detail: value,
        });

        // Copy to clipboard
        await vscode.env.clipboard.writeText(value);

        return value;
      } else {
        vscode.window.showWarningMessage(
          `Variable #${variableName} not found or returned no value.`,
        );
      }
    } catch (error) {
      vscode.window.showErrorMessage(
        `Error fetching variable #${variableName}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    return undefined;
  }

  /**
   * Dispose of resources
   */
  public dispose(): void {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
    this.disposables = [];
    this._onVariableRegistered.dispose();
  }
}

// Export a singleton instance
export const variableService = VariableService.getInstance();
