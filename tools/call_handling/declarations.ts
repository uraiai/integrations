import type {FunctionDeclaration} from "../../urai.d.ts";
const transferDeclaration: FunctionDeclaration = {
  "name": "transfer",
  "description": "Transfer a call to a specified destination",
  "parameters": {
    "type": "object",
    "properties": {
      "destination": {
        "type": "string",
        "description": "The destination to transfer the call to Number or the extension to transfer the call to For external transfers, usethe full dialable phone number"
      }
    },
    "required": [
      "destination"
    ]
  }
};

const hangupDeclaration: FunctionDeclaration = {
  "name": "hangup",
  "description": "Hangup a call with an optional reason",
  "parameters": {
    "type": "object",
    "properties": {
      "reason": {
        "type": "string",
        "description": "Optional reason for hanging up the call"
      }
    },
    "required": [
      "reason"
    ]
  }
};

const declarations = [transferDeclaration, hangupDeclaration];
ToolRegistry.addDeclarations(declarations);
export default declarations;
