export function cleanName(value) {
  return String(value ?? "")
    .replace(/[\r\n|]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function nameError(value, label) {
  const text = cleanName(value);
  if (!text) return `Falta tu ${label}.`;
  if (text.length > 40 || !/^[\p{L}][\p{L}\s'’.-]*$/u.test(text)) {
    return `Revisá tu ${label}: tiene que ser un nombre real.`;
  }
  const letters = text.match(/\p{L}/gu) || [];
  if (letters.length < 2) return `Revisá tu ${label}: tiene que ser un nombre real.`;
  return "";
}

export function guestKey(first, last) {
  const norm = (value) =>
    cleanName(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "");
  return `${norm(first)}|${norm(last)}`;
}
