import test from "node:test";
import assert from "node:assert/strict";
import { EMPTY, addLink, editLink, validateState, searchUrl, safeUrl } from "../core.js";
test("new dashboard validates", () =>
  assert.deepEqual(validateState(structuredClone(EMPTY)), EMPTY));
test("links are added immutably", () => {
  const state = addLink(
    EMPTY,
    { title: " GitHub ", url: "https://github.com" },
    "a",
  );
  assert.equal(state.links[0].title, "GitHub");
  assert.equal(state.links[0].url, "https://github.com/");
  assert.equal(EMPTY.links.length, 0);
});
test("executable URLs and embedded credentials are rejected", () => {
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,a",
    "file:///tmp/a",
    "https://user:password@example.com",
  ])
    assert.throws(() => safeUrl(url));
});
test("duplicate IDs and missing titles rejected", () => {
  const state = addLink(EMPTY, { title: "A", url: "https://example.com" }, "a");
  assert.throws(() =>
    addLink(state, { title: "B", url: "https://example.org" }, "a"),
  );
  assert.throws(() =>
    addLink(EMPTY, { title: " ", url: "https://example.com" }, "a"),
  );
});
test("backup round-trips", () => {
  const state = addLink(
    { ...EMPTY, notes: "Eine Idee", theme: "night" },
    { title: "A", url: "https://example.com" },
    "a",
  );
  assert.deepEqual(validateState(JSON.parse(JSON.stringify(state))), state);
});
test("unsupported backups and oversized notes rejected", () => {
  assert.throws(() => validateState({ ...EMPTY, version: 2 }));
  assert.throws(() => validateState({ ...EMPTY, notes: "x".repeat(20001) }));
});
test("search query encoded safely", () => {
  assert.equal(
    searchUrl("a & b", "bing"),
    "https://www.bing.com/search?q=a%20%26%20b",
  );
  assert.throws(() => searchUrl(" ", "google"));
  assert.throws(() => searchUrl("a", "unknown"));
});

test('bare domains use HTTPS while explicit HTTP remains unchanged',()=>{assert.equal(safeUrl(' youtube.com '),'https://youtube.com/');assert.equal(safeUrl('http://example.com/page'),'http://example.com/page');assert.equal(safeUrl('example.com:8443/page'),'https://example.com:8443/page');assert.equal(addLink(EMPTY,{title:'Video',url:'youtube.com'},'bare').links[0].url,'https://youtube.com/');});

test("partial link edits check duplicates in the preserved group", () => {
  let state = addLink(EMPTY, { title: "A", url: "a.example", group: "creative" }, "a");
  state = addLink(state, { title: "B", url: "b.example", group: "creative" }, "b");
  assert.throws(() => editLink(state, { title: "B", url: "a.example" }, "b"));
  state = addLink(state, { title: "C", url: "c.example", group: "everyday" }, "c");
  const next = editLink(state, { title: "Updated", url: "c.example" }, "b");
  assert.equal(next.links[1].group, "creative");
  assert.equal(next.links[1].url, "https://c.example/");
  assert.equal(state.links[1].url, "https://b.example/");
});
