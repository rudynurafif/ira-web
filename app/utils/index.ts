export function getInitials(name: string | undefined): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function getFirstTwoWords(name: string): string {
  if (!name) return "";

  const words = name.trim().split(/\s+/);

  return words.slice(0, 2).join(" ");
}
