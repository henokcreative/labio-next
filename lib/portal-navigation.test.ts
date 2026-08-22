import assert from "node:assert/strict";
import test from "node:test";
import {
  conversationHref,
  conversationIdFromSearch,
  projectFileHref,
  projectFileIdFromSearch,
  projectFileTargetId,
} from "./portal-navigation";

test("project file links use one canonical query target", () => {
  const href = projectFileHref(3, 4);

  assert.equal(href, "/client/projects/3?file=4");
  assert.equal(href.includes("#"), false);
  assert.equal(projectFileIdFromSearch("?file=4"), 4);
  assert.equal(projectFileTargetId(4), "file-4");
});

test("invalid portal targets are ignored", () => {
  assert.equal(projectFileIdFromSearch("?file=file-4"), null);
  assert.equal(projectFileIdFromSearch("?file=-1"), null);
  assert.equal(conversationIdFromSearch("?conversation=not-an-id"), null);
});

test("conversation links select one existing inbox conversation", () => {
  assert.equal(conversationHref(12), "/client/messages?conversation=12");
  assert.equal(conversationIdFromSearch("?conversation=12"), 12);
});
