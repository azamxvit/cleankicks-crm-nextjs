/** Digits-only phone for search and storage comparison. */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function formatPhoneDisplay(digits: string): string {
  if (digits.length === 11 && digits.startsWith("7")) {
    const rest = digits.slice(1);
    return `+7 (${rest.slice(0, 3)}) ${rest.slice(3, 6)}-${rest.slice(6, 8)}-${rest.slice(8, 10)}`;
  }
  if (digits.length === 10) {
    return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
  }
  return digits;
}
