import type {FunctionDeclaration} from "../../urai.d.ts";
const createReservationDeclaration: FunctionDeclaration = {
  "name": "create_reservation",
  "description": "Create a new reservation in the Supabase database",
  "parameters": {
    "type": "object",
    "properties": {
      "guest_name": {
        "type": "string",
        "description": "Name of the guest making the reservation"
      },
      "number_people": {
        "type": "number",
        "description": "Number of people for the reservation"
      },
      "company_name": {
        "type": "string",
        "description": "Company name associated with the reservation"
      },
      "hall_type": {
        "type": "string",
        "description": "Type of hall requested for the reservation"
      },
      "special_requests": {
        "type": "string",
        "description": "Any special requests for the reservation"
      },
      "caller_number": {
        "type": "string",
        "description": "Phone number of the caller making the reservation"
      },
      "start_time": {
        "type": "string",
        "description": "Start time of the reservation in ISO 8601 format in UTC"
      }
    },
    "required": [
      "guest_name",
      "number_people",
      "company_name",
      "hall_type",
      "special_requests",
      "caller_number",
      "start_time"
    ]
  }
};

const declarations = [createReservationDeclaration];
ToolRegistry.addDeclarations(declarations);
export default declarations;
