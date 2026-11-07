import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const releaseMode = process.env.PUBLIC_RELEASE === "true";

async function listFiles(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(entryPath));
    else files.push(entryPath);
  }
  return files;
}

function jpegHasLocationMetadata(bytes) {
  assert.ok(bytes.length >= 4, "JPEG is incomplete");
  assert.equal(bytes.readUInt16BE(0), 0xffd8, "JPEG must begin with its start marker");

  for (let offset = 2; offset < bytes.length;) {
    assert.equal(bytes[offset], 0xff, "JPEG segment marker is missing");
    while (bytes[offset] === 0xff) offset += 1;
    const marker = bytes[offset++];
    if (marker === 0xda || marker === 0xd9) return false;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) continue;

    assert.ok(offset + 2 <= bytes.length, "JPEG segment length is missing");
    const length = bytes.readUInt16BE(offset);
    assert.ok(length >= 2 && offset + length <= bytes.length, "JPEG segment exceeds the file");
    const segment = bytes.subarray(offset + 2, offset + length);
    offset += length;
    if (marker !== 0xe1) continue;

    if (segment.subarray(0, 6).equals(Buffer.from("Exif\0\0"))) {
      const tiff = segment.subarray(6);
      assert.ok(tiff.length >= 8, "EXIF TIFF header is incomplete");
      const byteOrder = tiff.toString("ascii", 0, 2);
      assert.ok(byteOrder === "II" || byteOrder === "MM", "EXIF byte order is invalid");
      const read16 = byteOrder === "II" ? tiff.readUInt16LE.bind(tiff) : tiff.readUInt16BE.bind(tiff);
      const read32 = byteOrder === "II" ? tiff.readUInt32LE.bind(tiff) : tiff.readUInt32BE.bind(tiff);
      assert.equal(read16(2), 42, "EXIF TIFF header is invalid");
      const directory = read32(4);
      assert.ok(directory >= 8 && directory + 2 <= tiff.length, "EXIF directory is outside the segment");
      const count = read16(directory);
      assert.ok(directory + 2 + count * 12 <= tiff.length, "EXIF entries exceed the segment");
      for (let entry = 0; entry < count; entry += 1) {
        if (read16(directory + 2 + entry * 12) === 0x8825) return true;
      }
    } else if (segment.subarray(0, 28).toString("ascii").startsWith("http://ns.adobe.com/")) {
      if (/\bGPS(?:Latitude|Longitude|Altitude|DestLatitude|DestLongitude)\b/i.test(segment.toString("utf8"))) {
        return true;
      }
    }
  }

  assert.fail("JPEG has no image scan or end marker");
}

test("公开 JPEG 图片不携带 GPS 定位元数据", async () => {
  const locatedImages = [];
  for (const file of await listFiles(path.join(repositoryRoot, "public"))) {
    if (!/\.jpe?g$/i.test(file)) continue;
    if (jpegHasLocationMetadata(await readFile(file))) {
      locatedImages.push(path.relative(repositoryRoot, file));
    }
  }

  assert.deepEqual(locatedImages, [], `public JPEG images contain location metadata:\n${locatedImages.join("\n")}`);
});

test("公开发布的最新提交署名不包含 QQ 邮箱", { skip: !releaseMode }, () => {
  const [commit, authorEmail, committerEmail] = execFileSync(
    "git",
    ["log", "-1", "--format=%H%x00%ae%x00%ce"],
    { cwd: repositoryRoot, encoding: "utf8" },
  ).trim().split("\0");
  assert.ok(
    ![authorEmail, committerEmail].some((email) => /@qq\.com$/i.test(email)),
    `${commit.slice(0, 12)}: public commit signatures must use a non-QQ email`,
  );
});

// 私人批注必须同时具备机器标记和样式标记，后续打包或发布门禁才能可靠识别。
test("[PUBLISH-SAFETY-001] 每条私人阅读批注都具备可机械识别的双重标记", async () => {
  const readingRoot = path.join(repositoryRoot, "public/reading");
  const htmlFiles = (await listFiles(readingRoot)).filter((file) => file.endsWith(".html"));

  for (const filePath of htmlFiles) {
    const html = await readFile(filePath, "utf8");
    for (const tag of html.match(/<[^>]*data-private-note[^>]*>/g) ?? []) {
      assert.match(
        tag,
        /class="[^"]*\bprivate-note\b[^"]*"/,
        `${filePath}: data-private-note must also carry the private-note class`,
      );
    }
  }
});

// 私人分支允许本地阅读，但公开发布必须来自 main 且不能携带任何私人标记。
test("[PUBLISH-SAFETY-001] 公开发布拒绝私人分支和私人内容标记", { skip: !releaseMode }, async () => {
  const branch = process.env.GITHUB_REF_NAME || execFileSync(
    "git",
    ["branch", "--show-current"],
    { cwd: repositoryRoot, encoding: "utf8" },
  ).trim();
  assert.equal(branch, "main", `public release must run from main, received "${branch || "detached HEAD"}"`);

  const roots = [path.join(repositoryRoot, "content"), path.join(repositoryRoot, "public")];
  const privateFiles = [];
  for (const root of roots) {
    for (const filePath of await listFiles(root)) {
      if (!/\.(?:css|html|md)$/.test(filePath)) continue;
      const source = await readFile(filePath, "utf8");
      if (/data-private-note|^visibility:\s*private\s*$/m.test(source)) {
        privateFiles.push(path.relative(repositoryRoot, filePath));
      }
    }
  }

  assert.deepEqual(
    privateFiles,
    [],
    `public release contains private content markers:\n${privateFiles.join("\n")}`,
  );
});
