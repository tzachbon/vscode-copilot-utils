import { VariableHandler } from '../interfaces';
import { gitService } from '../git/gitService';

/**
 * Variable handler for detecting changes between branches
 */
export class BranchChangesVariable implements VariableHandler {
  public readonly id = 'branch-changes';
  public readonly name = 'Branch Changes';
  public readonly description =
    'Detects changes between your current branch and the main/master branch';

  /**
   * Get the variable value
   * @returns Branch changes as formatted text
   */
  public async getValue(): Promise<string> {
    return await gitService.formatBranchChanges();
  }
}

/**
 * Create a new instance of the branch-changes variable
 */
export function createBranchChangesVariable(): VariableHandler {
  return new BranchChangesVariable();
}
