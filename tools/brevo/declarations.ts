import type {FunctionDeclaration} from "../../urai.d.ts";
const saveContactDeclaration: FunctionDeclaration = {
  "name": "save_contact",
  "description": "Save contact to Brevo list and creates a deal",
  "parameters": {
    "type": "object",
    "properties": {
      "email": {
        "type": "string",
        "description": "The contact's email address"
      }
    },
    "required": [
      "email"
    ]
  }
};

const declarations = [saveContactDeclaration];
ToolRegistry.addDeclarations(declarations);
export default declarations;
