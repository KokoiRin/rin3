import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the three learning gates", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>铃有三剑<\/title>/i);
  assert.match(html, /数学/);
  assert.match(html, /计算机/);
  assert.match(html, /软件工程/);
  assert.match(html, /\/mathematics/);
  assert.match(html, /\/computer-science/);
  assert.match(html, /\/software-engineering/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("each learning gate opens a real section", async () => {
  for (const [path, title] of [
    ["/mathematics", "数学"],
    ["/computer-science", "计算机"],
    ["/software-engineering", "软件工程"],
  ]) {
    const response = await render(path);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, new RegExp(`<title>${title} \\| 铃有三剑<\\/title>`, "i"));
    assert.match(html, /返回铃有三剑进入页/);
  }
});
