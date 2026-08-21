import { describe, expect, it } from "vitest";
import { createUuid } from "./ids";

describe("createUuid", () => {
  it("uses the native implementation when available", () => {
    const expected = "123e4567-e89b-42d3-a456-426614174000";
    expect(createUuid({ randomUUID: () => expected })).toBe(expected);
  });

  it("creates an RFC 4122 v4 id when randomUUID is unavailable", () => {
    const id = createUuid({
      getRandomValues: (array: Uint8Array) => {
        array.fill(0xab);
        return array;
      },
    });
    expect(id).toBe("abababab-abab-4bab-abab-abababababab");
  });
});
