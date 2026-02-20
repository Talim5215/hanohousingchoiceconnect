/**
 * Maps raw database/auth error messages to safe, user-friendly messages
 * to avoid leaking internal schema details to potential attackers.
 */
export function getFriendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid credentials")) {
    return "The email or password you entered is incorrect.";
  }
  if (m.includes("email not confirmed")) {
    return "Please verify your email address before signing in.";
  }
  if (m.includes("user already registered") || m.includes("already been registered")) {
    return "An account with this email already exists. Please sign in instead.";
  }
  if (m.includes("password") && m.includes("short")) {
    return "Your password is too short. Please choose a longer password.";
  }
  if (m.includes("rate limit") || m.includes("too many requests")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  return "Something went wrong. Please try again or contact support.";
}

export function getFriendlyDbError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("unique constraint") || m.includes("duplicate key")) {
    return "This record already exists. Please check your information and try again.";
  }
  if (m.includes("row-level security") || m.includes("rls") || m.includes("permission denied")) {
    return "You don't have permission to perform this action.";
  }
  if (m.includes("foreign key") || m.includes("violates")) {
    return "This operation couldn't be completed due to a data conflict.";
  }
  if (m.includes("not null") || m.includes("null value")) {
    return "Some required information is missing. Please fill in all required fields.";
  }
  return "Something went wrong. Please try again or contact support.";
}
