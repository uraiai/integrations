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

const sendSmsWithBodyDeclaration: FunctionDeclaration = {
  "name": "send_sms_with_body",
  "description": "Send SMS using Twilio API with a body",
  "parameters": {
    "type": "object",
    "properties": {
      "to_number": {
        "type": "string",
        "description": "The recipient's phone number"
      },
      "body": {
        "type": "string",
        "description": "The message to send to the recepient"
      }
    },
    "required": [
      "to_number",
      "body"
    ]
  }
};

const declarations = [sendSmsDeclaration, sendSmsWithBodyDeclaration];
ToolRegistry.addDeclarations(declarations);
export default declarations;
