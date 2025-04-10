import * as vscode from 'vscode';
import { gitService } from '../git/gitService';

type BranchChangesTool = {
  getChanges: () => Promise<string>;
};

/**
 * Language model tool provider for branch changes
 * This exposes the #branch-changes functionality to GitHub Copilot
 */
export class BranchChangesToolProvider implements vscode.LanguageModelTool<BranchChangesTool> {
  private readonly id = 'vscode-copilot-utils.branch-changes';

  /**
   * Register this tool with the language model registry
   * @param context Extension context for registration
   */
  public register(context: vscode.ExtensionContext): void {
    const disposable = vscode.lm.registerTool(this.id, this);
    context.subscriptions.push(disposable);
    console.log(`Registered LM tool provider: ${this.id}`);
  }

  /**
   * Handle a tool request from the language model
   * @param request The tool request
   * @param token A cancellation token
   * @returns The response to the request
   */
  async handleRequest(): Promise<vscode.LanguageModelToolResult> {
    console.log(`Handling LM tool request for: ${this.id}`);

    // Get branch changes from Git service
    const branchChanges = await gitService.formatBranchChanges();

    // Return success response with the branch changes
    return new vscode.LanguageModelToolResult([
      {
        value: branchChanges,
      },
    ]);
  }

  public invoke(
    _options: vscode.LanguageModelToolInvocationOptions<BranchChangesTool>,
    _token: vscode.CancellationToken,
  ): vscode.ProviderResult<vscode.LanguageModelToolResult> {
    return this.handleRequest();
  }
}
