export const emailRegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/i;

export function isValidEmail(email: string): boolean {
  return emailRegExp.test(email);
}