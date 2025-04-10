import * as vscode from 'vscode';
import * as simpleGit from 'simple-git';
import { SimpleGit } from 'simple-git';

export interface GitChange {
  status: string;
  file: string;
  statusText: string;
}

export class GitUtils {
  private static async getGit(): Promise<{ git: SimpleGit; workspaceRoot: string } | undefined> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      throw new Error('No workspace folder found');
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    const git = simpleGit.simpleGit(workspaceRoot);

    // Check if this is a Git repository
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      throw new Error('Not a Git repository');
    }

    return { git, workspaceRoot };
  }

  // Get current branch name
  public static async getCurrentBranch(): Promise<string> {
    const gitResult = await this.getGit();
    if (!gitResult) {
      throw new Error('Failed to initialize Git');
    }

    const { git } = gitResult;
    const branchInfo = await git.branch();
    return branchInfo.current;
  }

  // Get main/default branch (main or master)
  public static async getMainBranch(): Promise<string> {
    // Check for user-configured default branch
    const config = vscode.workspace.getConfiguration('copilotVariables');
    const configuredBranch = config.get<string>('defaultBranch', '');

    if (configuredBranch) {
      return configuredBranch;
    }

    const gitResult = await this.getGit();
    if (!gitResult) {
      throw new Error('Failed to initialize Git');
    }

    const { git } = gitResult;
    const branches = await git.branch();

    // Check if main exists
    if (branches.all.includes('main')) {
      return 'main';
    }

    // Check if master exists
    if (branches.all.includes('master')) {
      return 'master';
    }

    // Fall back to remote origin HEAD
    try {
      const remotesOutput = await git.remote(['show', 'origin']);

      if (typeof remotesOutput === 'string' && remotesOutput.includes('HEAD branch:')) {
        const match = remotesOutput.match(/HEAD branch: ([^\n]+)/);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
    } catch (error) {
      console.error('Failed to determine remote HEAD branch', error);
    }

    throw new Error('Could not determine main branch');
  }

  // Format Git status code to human readable text
  public static formatGitStatus(status: string): string {
    switch (status[0]) {
      case 'A':
        return 'Added';
      case 'M':
        return 'Modified';
      case 'D':
        return 'Deleted';
      case 'R':
        return 'Renamed';
      case 'C':
        return 'Copied';
      case 'U':
        return 'Updated but unmerged';
      case '?':
        return 'Untracked';
      case '!':
        return 'Ignored';
      default:
        return status;
    }
  }

  // Get changes between two branches
  public static async getBranchChanges(
    sourceBranch?: string,
    targetBranch?: string,
  ): Promise<GitChange[]> {
    const gitResult = await this.getGit();
    if (!gitResult) {
      throw new Error('Failed to initialize Git');
    }

    const { git } = gitResult;

    // If no source branch is specified, use current branch
    if (!sourceBranch) {
      sourceBranch = await this.getCurrentBranch();
    }

    // If no target branch is specified, use main/master
    if (!targetBranch) {
      targetBranch = await this.getMainBranch();
    }

    // If source and target are the same, return empty array
    if (sourceBranch === targetBranch) {
      return [];
    }

    // Get changes between branches
    const diff = await git.diff([`${targetBranch}...${sourceBranch}`, '--name-status']);

    if (!diff || diff.trim() === '') {
      return [];
    }

    // Process changes into structured format
    return diff
      .split('\n')
      .filter((line) => line.trim() !== '')
      .map((line) => {
        const [status, ...fileParts] = line.split('\t');
        const file = fileParts.join('\t'); // Handle filenames with tabs
        const statusText = this.formatGitStatus(status);

        return {
          status,
          file,
          statusText,
        };
      });
  }

  // Format branch changes into human-readable text
  public static async formatBranchChanges(): Promise<string> {
    try {
      const currentBranch = await GitUtils.getCurrentBranch();
      const mainBranch = await GitUtils.getMainBranch();

      // If on main branch, nothing to compare
      if (currentBranch === mainBranch) {
        return `Currently on ${mainBranch} branch. No changes to compare.`;
      }

      const changes = await GitUtils.getBranchChanges(currentBranch, mainBranch);

      if (changes.length === 0) {
        return `No file changes detected between ${currentBranch} and ${mainBranch}`;
      }

      // Group changes by type
      const groupedChanges = changes.reduce((acc, change) => {
        if (!acc[change.statusText]) {
          acc[change.statusText] = [];
        }
        acc[change.statusText].push(change.file);
        return acc;
      }, {} as Record<string, string[]>);

      // Format output
      let result = `Changes between ${currentBranch} and ${mainBranch}:\n\n`;

      // Get max line count from config
      const config = vscode.workspace.getConfiguration('copilotVariables');
      const maxLineCount = config.get<number>('maxLineCount', 100);

      let totalLines = 0;
      let reachedLimit = false;

      for (const [status, files] of Object.entries(groupedChanges)) {
        result += `${status} (${files.length}):\n`;

        for (const file of files) {
          if (totalLines >= maxLineCount) {
            reachedLimit = true;
            break;
          }

          result += `  - ${file}\n`;
          totalLines++;
        }

        if (reachedLimit) {
          break;
        }

        result += '\n';
      }

      if (reachedLimit) {
        const totalChanges = changes.length;
        result += `\n... and ${
          totalChanges - totalLines
        } more changes not shown (limit: ${maxLineCount} lines)`;
      }

      return result.trim();
    } catch (error) {
      console.error('Error formatting branch changes:', error);
      return `Error getting branch changes: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  }
}
