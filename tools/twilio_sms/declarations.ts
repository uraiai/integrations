import type {FunctionDeclaration} from "../../urai.d.ts";
const sendSmsDeclaration: FunctionDeclaration = {
  "name": "send_sms",
  "description": "Send SMS using Twilio API",
  "parameters": {
    "type": "object",
    "properties": {
      "to_number": {
        "type": "string",
        "description": "The recipient's phone number"
      }
    },
    "required": [
      "to_number"
    ]
  }
};

const declarations = [sendSmsDeclaration];
ToolRegistry.addDeclarations(declarations);
export default declarations;
