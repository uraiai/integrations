// my-tools.ts
import type { FunctionDeclaration } from '../../urai.d.ts';

// This part is typically automated by the URAI runtime, which
// would parse your tool declarations from a manifest or similar.
const myToolDeclarations: FunctionDeclaration[] = [
    {
        name: "my_tool",
        description: "A description of my tool.",
        parameters: {
            schema_type: "Object",
            properties: {
                arg1: { schema_type: "string", description: "An argument" }
            },
            required: ["arg1"]
        }
    }
];
ToolRegistry.addDeclarations(myToolDeclarations);


class MyTools {
    @tool
    static my_tool({ arg1 }: { arg1: string }) {
        // Access secrets and vars with type support
        const apiKey = meta.secrets.MY_API_KEY;
        console.log(`Called my_tool with: ${arg1} and API key: ${apiKey}`);
        return `Result for ${arg1}`;
    }
}
