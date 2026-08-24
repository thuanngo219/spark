export type LinkifiedSegment =
  | { type: "text"; value: string }
  | { type: "link"; value: string; href: string };

const urlCandidatePattern = /\b(?:https?:\/\/|www\.)[^\s<>"']+/gi;
const trailingPunctuation = /[.,!?;:]/;
const closingPairs: Record<string, string> = {
  ")": "(",
  "]": "[",
  "}": "{",
};

function countCharacter(value: string, character: string): number {
  return [...value].filter((entry) => entry === character).length;
}

function getLinkLength(candidate: string): number {
  let length = candidate.length;

  while (length > 0) {
    const lastCharacter = candidate[length - 1];

    if (trailingPunctuation.test(lastCharacter)) {
      length -= 1;
      continue;
    }

    const openingCharacter = closingPairs[lastCharacter];
    if (
      openingCharacter &&
      countCharacter(candidate.slice(0, length), lastCharacter) >
        countCharacter(candidate.slice(0, length), openingCharacter)
    ) {
      length -= 1;
      continue;
    }

    break;
  }

  return length;
}

export function linkifyText(value: string): LinkifiedSegment[] {
  const segments: LinkifiedSegment[] = [];
  let cursor = 0;

  for (const match of value.matchAll(urlCandidatePattern)) {
    const matchIndex = match.index ?? 0;
    const candidate = match[0];
    const linkLength = getLinkLength(candidate);

    if (matchIndex > cursor) {
      segments.push({ type: "text", value: value.slice(cursor, matchIndex) });
    }

    if (linkLength > 0) {
      const linkText = candidate.slice(0, linkLength);
      segments.push({
        type: "link",
        value: linkText,
        href: linkText.toLowerCase().startsWith("www.")
          ? `https://${linkText}`
          : linkText,
      });
    }

    const trailingText = candidate.slice(linkLength);
    if (trailingText) {
      segments.push({ type: "text", value: trailingText });
    }

    cursor = matchIndex + candidate.length;
  }

  if (cursor < value.length) {
    segments.push({ type: "text", value: value.slice(cursor) });
  }

  return segments;
}
