const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

function random(n: number): string {
  let out = "";
  for (let i = 0; i < n; i++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return out;
}

export function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${random(4).toLowerCase()}`;
}

/** Human-friendly booking reference, e.g. "EXJ-7KQ4MD". */
export function bookingRef(): string {
  return `EXJ-${random(6)}`;
}
