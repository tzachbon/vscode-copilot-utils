import * as vscode from 'vscode';

// Type definition for variable handlers
export type VariableHandler = () => Promise<string>;

// Service for managing Copilot custom variables
export class CopilotVariableService {
    private variableHandlers: Map<string, VariableHandler> = new Map();
    private _onVariableRegistered = new vscode.EventEmitter<string>();
    
    // Event fired when a new variable is registered
    readonly onVariableRegistered = this._onVariableRegistered.event;
    
    // Register a new variable with its handler
    registerVariable(name: string, handler: VariableHandler): void {
        this.variableHandlers.set(name.toLowerCase(), handler);
        this._onVariableRegistered.fire(name);
        console.log(`Registered Copilot variable: #${name}`);
    }
    
    // Check if a variable exists
    hasVariable(name: string): boolean {
        return this.variableHandlers.has(name.toLowerCase());
    }
    
    // Get all registered variable names
    getVariableNames(): string[] {
        return Array.from(this.variableHandlers.keys());
    }
    
    // Fetch a variable's value
    async getVariableValue(name: string): Promise<string | undefined> {
        const handler = this.variableHandlers.get(name.toLowerCase());
        if (handler) {
            try {
                return await handler();
            } catch (error) {
                console.error(`Error executing variable handler for #${name}:`, error);
                return `Error retrieving #${name}: ${error instanceof Error ? error.message : String(error)}`;
            }
        }
        return undefined;
    }
    
    // Process a string and replace all variable references with their values
    async processText(text: string): Promise<string> {
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
        
        return result;
    }
}

// Singleton instance
export const copilotVariableService = new CopilotVariableService();