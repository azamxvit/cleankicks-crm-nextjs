/** Max digits in the phone field (7 + 10-digit KZ mobile). */
export const KZ_PHONE_INPUT_MAX_DIGITS = 11;

export function normalizePhone(phone: string): string {
  let d = phone.replace(/\D/g, "");
  if (!d) {
    return "";
  }
  if (d.startsWith("8") && d.length >= 10) {
    d = `7${d.slice(1)}`;
  }
  if (d.length > KZ_PHONE_INPUT_MAX_DIGITS) {
    d = d.slice(0, KZ_PHONE_INPUT_MAX_DIGITS);
  }
  return d;
}

/** Digits allowed while typing (KZ mobile, starts with 7). */
export function digitsFromPhoneInput(value: string): string {
  let d = value.replace(/\D/g, "");
  if (!d) {
    return "";
  }
  if (d === "8") {
    return "7";
  }
  if (d.startsWith("8") && d.length < 10) {
    d = `7${d.slice(1)}`;
  } else {
    d = normalizePhone(value);
    if (d[0] !== "7") {
      d = `7${d}`.slice(0, KZ_PHONE_INPUT_MAX_DIGITS);
    }
  }
  return d.slice(0, KZ_PHONE_INPUT_MAX_DIGITS);
}

export function formatKzPhoneInput(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(0, KZ_PHONE_INPUT_MAX_DIGITS);
  if (!d) {
    return "";
  }
  if (d.length <= 3) {
    return d;
  }
  if (d.length <= 6) {
    return `${d.slice(0, 3)}-${d.slice(3)}`;
  }
  if (d.length <= 8) {
    return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  }
  if (d.length <= 10) {
    return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8, 10)}`;
  }
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6, 9)}-${d.slice(9, 11)}`;
}

export function applyPhoneInputChange(raw: string): string {
  return formatKzPhoneInput(digitsFromPhoneInput(raw));
}

export function isValidKzPhone(phone: string): boolean {
  const d = normalizePhone(phone);
  if (d.length === 10) {
    return /^7\d{9}$/.test(d);
  }
  if (d.length === 11) {
    return /^7\d{10}$/.test(d);
  }
  return false;
}

export function formatPhoneDisplay(digits: string): string {
  const d = normalizePhone(digits);
  if (!d) {
    return "";
  }
  return formatKzPhoneInput(d.length === 11 ? d : d.slice(0, 10));
}
