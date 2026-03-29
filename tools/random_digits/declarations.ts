import type {FunctionDeclaration} from "../../urai.d.ts";
const generateDigitsDeclaration: FunctionDeclaration = {
  "name": "generate_digits",
  "description": "Generate numeric digits randomly for dementia screening",
  "parameters": {
    "type": "object",
    "properties": {
      "length": {
        "type": "number",
        "description": "The number of digits to generate (either 3 or 4)"
      }
    },
    "required": [
      "length"
    ]
  }
};

const declarations = [generateDigitsDeclaration];
ToolRegistry.addDeclarations(declarations);
export default declarations;
