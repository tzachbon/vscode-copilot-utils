import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { configService } from '../config/configService';
import { variableService } from '../variables/variableService';
import { gitService } from '../git/gitService';

// Helper to ensure the extension is activated
async function ensureExtensionActivated(): Promise<vscode.Extension<any>> {
  const extension = vscode.extensions.getExtension('user.vscode-copilot-utils');
  if (!extension) {
    throw new Error('Extension not found');
  }

  if (!extension.isActive) {
    await extension.activate();
  }

  return extension;
}

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Starting extension tests');

  let sandbox: sinon.SinonSandbox;

  setup(() => {
    sandbox = sinon.createSandbox();
  });

  teardown(() => {
    sandbox.restore();
  });

  test('Extension should be present', async () => {
    const extension = vscode.extensions.getExtension('user.vscode-copilot-utils');
    assert.ok(extension);
  });

  test('Extension should activate', async () => {
    const extension = await ensureExtensionActivated();
    assert.ok(extension.isActive);
  });

  test('Commands should be registered', async () => {
    await ensureExtensionActivated();

    // Check that commands are registered
    const commands = await vscode.commands.getCommands();

    assert.ok(commands.includes('vscode-copilot-utils.refreshBranchChanges'));
    assert.ok(commands.includes('vscode-copilot-utils.listVariables'));
    assert.ok(commands.includes('vscode-copilot-utils.fetchVariable'));
    assert.ok(commands.includes('vscode-copilot-utils.processText'));
  });

  test('Config service should return default values', () => {
    const isEnabled = configService.isExtensionEnabled();
    assert.strictEqual(typeof isEnabled, 'boolean');

    const maxLineCount = configService.getMaxLineCount();
    assert.strictEqual(typeof maxLineCount, 'number');
    assert.strictEqual(maxLineCount, 100);

    const defaultBranch = configService.getDefaultBranch();
    assert.strictEqual(typeof defaultBranch, 'string');
  });

  test('Variable service should register and retrieve variables', async () => {
    const testVariable = {
      id: 'test-variable',
      name: 'Test Variable',
      description: 'A test variable',
      getValue: async () => 'test-value',
    };

    variableService.registerVariable(testVariable);

    assert.ok(variableService.hasVariable('test-variable'));
    assert.strictEqual(await variableService.getVariableValue('test-variable'), 'test-value');

    const variables = variableService.getVariables();
    assert.ok(variables.some((v) => v.id === 'test-variable'));
  });

  test('Git service should handle errors gracefully', async () => {
    // Mock git service to simulate error
    sandbox.stub(gitService, 'getGit' as any).rejects(new Error('Test error'));

    try {
      await gitService.getCurrentBranch();
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.ok(error instanceof Error);
    }
  });
});

// This activates the test runner
export function run(): void {
  // Nothing to do here - tests are defined above
}
