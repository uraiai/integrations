// Helper functions for TidyCal integrations

// Formats a Date object to ISO 8601 string without milliseconds
export const formatDateTime = (date: Date): string => {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
};

// Simple email regex for basic validation
export const emailRegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/i;
export function isValidEmail(email: string): boolean {
  return emailRegExp.test(email);
}

// Builds a payload object excluding undefined values
export function buildPayload(data: Record<string, any>): Record<string, any> {
  const payload: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) payload[key] = value;
  }
  return payload;
}