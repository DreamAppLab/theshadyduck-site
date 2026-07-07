export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatUsPhoneInput(digits: string): string {
  const normalized = digits.startsWith("1") ? digits.slice(1) : digits;
  const d = normalized.slice(0, 10);

  if (!d.length) return "";
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export function formatUsPhoneDisplay(e164: string): string {
  const digits = digitsOnly(e164);
  const national =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits.slice(-10);

  if (national.length !== 10) return e164;
  return formatUsPhoneInput(national);
}

export function toUsE164(value: string): string | null {
  const digits = digitsOnly(value);

  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}
