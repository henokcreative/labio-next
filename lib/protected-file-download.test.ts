import assert from "node:assert/strict";
import test from "node:test";
import { downloadProtectedFile } from "./protected-file-download";

test("protected downloads resolve the authenticated endpoint before navigating", async () => {
  const endpoints: string[] = [];
  const navigations: string[] = [];

  await downloadProtectedFile(
    "/api/projects/7/files/12/download/",
    async (endpoint) => {
      endpoints.push(endpoint);
      return { url: "https://protected.example/signed-download" };
    },
    (url) => navigations.push(url),
  );

  assert.deepEqual(endpoints, ["/api/projects/7/files/12/download/"]);
  assert.deepEqual(navigations, ["https://protected.example/signed-download"]);
});
