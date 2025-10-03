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
    };

    function fetchJSON(url: string): Promise<any>;
    function getEvents(): AsyncGenerator<any, void, unknown>;
    const urai: {
        sendResult: (result: any) => Promise<void>;
    };
}
