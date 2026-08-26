import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { runCloudMutation } from "@/lib/cloud-data";

describe("project deletion request", () => {
  function mockClient(error: unknown = null) {
    const eqUser = vi.fn().mockResolvedValue({ error });
    const eqId = vi.fn().mockReturnValue({ eq: eqUser });
    const remove = vi.fn().mockReturnValue({ eq: eqId });
    const from = vi.fn().mockReturnValue({ delete: remove });
    return { client: { from } as unknown as SupabaseClient, from, eqId, eqUser };
  }

  it("deletes exactly one owned project, never the items table", async () => {
    const { client, from, eqId, eqUser } = mockClient();
    await runCloudMutation(client, { id: "m1", kind: "delete-project", projectId: "project-1" }, "user-1");
    expect(from).toHaveBeenCalledExactlyOnceWith("projects");
    expect(eqId).toHaveBeenCalledExactlyOnceWith("id", "project-1");
    expect(eqUser).toHaveBeenCalledExactlyOnceWith("user_id", "user-1");
  });

  it("propagates server errors so the durable queue can retry", async () => {
    const error = { message: "Network unavailable" };
    const { client } = mockClient(error);
    await expect(runCloudMutation(client, { id: "m1", kind: "delete-project", projectId: "project-1" }, "user-1")).rejects.toEqual(error);
  });
});
