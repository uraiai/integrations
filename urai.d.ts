export {};

/**
 * Schema for tool parameters, following a subset of JSON Schema.
 */
export interface Schema {
    schema_type: string;
    description?: string;
    properties?: Record<string, Schema>;
    required?: string[];
    items?: Schema;
}

/**
 * Declaration of a tool that can be called by the model.
 */
export interface FunctionDeclaration {
    name: string;
    description: string;
    parameters: Schema;
}

/**
 * Handler function for a tool.
 */
export type ToolHandler = (args: any) => any;

/**
 * The ToolRegistry is used to manage tool declarations and their handlers.
 */
export interface ToolRegistry {
    addDeclarations(declarations: FunctionDeclaration[]): void;
    register(name: string, handler: ToolHandler): void;
    getDeclarations(): FunctionDeclaration[];
    lookup(name:string): { handler: ToolHandler, declaration: FunctionDeclaration } | null;
}

declare global {
    /**
     * The ToolRegistry is used to manage tool declarations and their handlers.
     */
    const ToolRegistry: ToolRegistry;

    /**
     * Decorator to register a class method as a tool.
     */
    const tool: (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;

    /**
     * Access runtime-provided context.
     */
    const meta: {
        /**
         * Access secrets provided to the runtime.
         * e.g. `meta.secrets.MY_API_KEY`
         */
        secrets: Record<string, string | undefined>;
        /**
         * Access variables provided to the runtime.
         * e.g. `meta.vars.MY_CONFIG`
         */
        vars: Record<string, any | undefined>;
        /**
         * Urai-specific functions for interacting with the runtime.
         */
        urai: {
            /**
             * Send a command to the voice call frontend (e.g., hangup, transfer).
             * This works across execution boundaries, including from setTimeout callbacks.
             *
             * @param callId - The call ID (call_sid) to send the command to
             * @param command - The command object to send (e.g., {command: "hangup"})
             * @returns Promise<{success: boolean}>
             *
             * @example
             * // Immediate command
             * const callId = meta.vars.metadata.call_sid;
             * await meta.urai.sendCommand(callId, { command: "hangup" });
             *
             * @example
             * // Delayed command with setTimeout
             * const callId = meta.vars.metadata.call_sid;
             * setTimeout(async () => {
             *   await meta.urai.sendCommand(callId, {
             *     command: "transfer",
             *     destination: "12345"
             *   });
             * }, 2000);
             */
            sendCommand: (callId: string, command: any) => Promise<{success: boolean}>;
        };
    };

    function fetchJSON(url: string): Promise<any>;
    function getEvents(): AsyncGenerator<any, void, unknown>;
    const urai: {
        sendResult: (result: any) => Promise<void>;
    };
}
