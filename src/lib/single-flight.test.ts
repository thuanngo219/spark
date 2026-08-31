import { describe, expect, it, vi } from "vitest";
import { SingleFlight } from "@/lib/single-flight";

describe("SingleFlight", () => {
  it("shares one promise for concurrent work with the same key", async () => {
    let release: () => void = () => undefined;
    const blocked = new Promise<void>((resolve) => { release = resolve; });
    const operation = vi.fn(() => blocked);
    const singleFlight = new SingleFlight();

    const first = singleFlight.run("user-a", operation);
    const second = singleFlight.run("user-a", operation);

    expect(first).toBe(second);
    expect(singleFlight.isRunning("user-a")).toBe(true);
    release();
    await first;
    expect(operation).toHaveBeenCalledTimes(1);
    expect(singleFlight.isRunning()).toBe(false);
  });

  it("allows a new run after success or failure", async () => {
    const singleFlight = new SingleFlight();
    await singleFlight.run("user-a", async () => undefined);
    await expect(singleFlight.run("user-a", async () => { throw new Error("failed"); })).rejects.toThrow("failed");
    await singleFlight.run("user-a", async () => undefined);
    expect(singleFlight.isRunning()).toBe(false);
  });
});
