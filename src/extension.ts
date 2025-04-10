// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';
import { copilotVariableService } from './copilotVariableService';
import { GitUtils } from './gitUtils';

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "vscode-copilot-utils" is now active!');

	// Register the branch-changes variable handler with proper binding
	copilotVariableService.registerVariable('branch-changes', () => GitUtils.formatBranchChanges());

	// Register a command to manually refresh branch changes
	const refreshCommand = vscode.commands.registerCommand('vscode-copilot-utils.refreshBranchChanges', async () => {
		try {
			const changes = await GitUtils.formatBranchChanges();
			const currentBranch = await GitUtils.getCurrentBranch();
			const mainBranch = await GitUtils.getMainBranch();
			
			// Show a more detailed message in the UI
			vscode.window.showInformationMessage(
				`Branch changes between '${currentBranch}' and '${mainBranch}'`,
				{ modal: false, detail: changes }
			);
		} catch (error) {
			vscode.window.showErrorMessage(`Error fetching branch changes: ${error instanceof Error ? error.message : String(error)}`);
		}
	});

	// Register a command to list all available variables
	const listVariablesCommand = vscode.commands.registerCommand('vscode-copilot-utils.listVariables', () => {
		const variables = copilotVariableService.getVariableNames();
		
		if (variables.length === 0) {
			vscode.window.showInformationMessage('No Copilot custom variables are registered.');
			return;
		}
		
		const variablesMarkdown = variables.map(v => `- #${v}`).join('\n');
		const message = `Available Copilot custom variables:\n${variablesMarkdown}`;
		
		vscode.window.showInformationMessage(message);
	});

	// Register a command to fetch a variable value
	const fetchVariableCommand = vscode.commands.registerCommand('vscode-copilot-utils.fetchVariable', async (variableName?: string) => {
		if (!variableName) {
			// If no variable name provided, show a quick pick to select one
			const variables = copilotVariableService.getVariableNames();
			
			if (variables.length === 0) {
				vscode.window.showInformationMessage('No Copilot custom variables are registered.');
				return;
			}
			
			variableName = await vscode.window.showQuickPick(variables, {
				placeHolder: 'Select a variable to fetch',
				title: 'Copilot Custom Variables'
			});
			
			if (!variableName) {
				return; // User cancelled
			}
		}
		
		try {
			const value = await copilotVariableService.getVariableValue(variableName);
			
			if (value) {
				// Show the full value in a modal dialog
				vscode.window.showInformationMessage(
					`Value of #${variableName}:`,
					{ modal: false, detail: value }
				);
			} else {
				vscode.window.showWarningMessage(`Variable #${variableName} not found or returned no value.`);
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Error fetching variable #${variableName}: ${error instanceof Error ? error.message : String(error)}`);
		}
	});

	// Register a command to process a string with variables
	const processTextCommand = vscode.commands.registerCommand('vscode-copilot-utils.processText', async (text?: string) => {
		if (!text) {
			text = await vscode.window.showInputBox({
				placeHolder: 'Enter text with #variable references',
				prompt: 'Process text with Copilot custom variables'
			}) || '';
			
			if (!text) {
				return; // User cancelled
			}
		}
		
		try {
			const processed = await copilotVariableService.processText(text);
			
			// Copy to clipboard
			await vscode.env.clipboard.writeText(processed);
			
			vscode.window.showInformationMessage(
				'Processed text with variables replaced:',
				{ modal: false, detail: processed }
			);
			
			return processed;
		} catch (error) {
			vscode.window.showErrorMessage(`Error processing text with variables: ${error instanceof Error ? error.message : String(error)}`);
		}
	});

	// Add all commands to subscriptions
	context.subscriptions.push(
		refreshCommand,
		listVariablesCommand,
		fetchVariableCommand,
		processTextCommand
	);

	// Create a status bar item for quick access (respect configuration setting)
	const config = vscode.workspace.getConfiguration('copilotVariables');
	
	if (config.get<boolean>('showStatusBarItem', true)) {
		const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
		statusBarItem.text = "$(copilot) Copilot Vars";
		statusBarItem.tooltip = "Manage Copilot custom variables";
		statusBarItem.command = "vscode-copilot-utils.listVariables";
		statusBarItem.show();
		
		context.subscriptions.push(statusBarItem);
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
