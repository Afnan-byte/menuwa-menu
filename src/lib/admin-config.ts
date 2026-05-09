export const ADMIN_EMAILS = [
  "afnanbyte@gmail.com", // Main admin
  "info@menuwo.in"       // Support/Admin
];

export const isAdmin = (email: string | null | undefined) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};
