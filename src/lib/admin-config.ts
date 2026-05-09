export const ADMIN_EMAILS = [
  "afnan.messaging@gmail.com"
];

export const isAdmin = (email: string | null | undefined) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};
