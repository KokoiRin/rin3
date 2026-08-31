import { access, readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const emotionRoot = path.join(repositoryRoot, "public/reading/emotions");

const canonicalEmotions = [
  "fear",
  "anger",
  "sadness",
  "anxiety",
  "disgust",
  "loneliness",
  "shame",
  "guilt",
  "relief",
  "love",
  "joy",
  "satisfaction",
];

const canonicalArtwork = [
  ...canonicalEmotions,
  "attention",
  "interest",
  "anticipation",
  "boredom",
  "comparison",
  "envy",
  "jealousy",
  "pride",
  "counterfactual",
  "disappointment",
  "regret",
  "wistfulness",
  "beyond-self",
  "gratitude",
  "moved",
  "awe",
];

const dailyEmotionNames = new Map([
  ["day-one", ["fear", "anger", "sadness"]],
  ["day-two", ["anxiety", "disgust", "loneliness"]],
  ["day-three", ["shame", "guilt", "relief"]],
  ["day-four", ["love", "joy", "satisfaction"]],
  ["day-five", canonicalEmotions],
]);

// 读取 JPEG 的 SOF 信息，确保共享三联画继续保持统一尺寸。
export function jpegDimensions(buffer) {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;

  let offset = 2;
  while (offset + 8 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;

    const segmentLength = buffer.readUInt16BE(offset);
    const isStartOfFrame = [
      0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
      0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
    ].includes(marker);
    if (isStartOfFrame) {
      return {
        height: buffer.readUInt16BE(offset + 3),
        width: buffer.readUInt16BE(offset + 5),
      };
    }
    offset += segmentLength;
  }
  return null;
}

// 递归收集情绪阅读目录中的页面和图片，供引用完整性检查使用。
async function walkFiles(root) {
  const files = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const filePath = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...await walkFiles(filePath));
    else files.push(filePath);
  }
  return files;
}

// 读取单个训练日页面，统一生成带相对路径的错误信息。
async function readDailyPage(day) {
  const filePath = path.join(emotionRoot, day, "index.html");
  return { filePath, html: await readFile(filePath, "utf8") };
}

// 校验五天页面共用同一组主线图片、共享样式，并拒绝失效或无引用素材。
export async function validateEmotionReaders() {
  const errors = [];

  const expectedArtwork = new Set();
  for (const artwork of canonicalArtwork) {
    const filePath = path.join(emotionRoot, "assets", `${artwork}-triptych.jpg`);
    expectedArtwork.add(filePath);
    try {
      const dimensions = jpegDimensions(await readFile(filePath));
      if (dimensions?.width !== 1536 || dimensions?.height !== 1024) {
        errors.push(`${path.relative(repositoryRoot, filePath)}: expected 1536x1024 JPEG`);
      }
    } catch {
      errors.push(`${path.relative(repositoryRoot, filePath)}: missing canonical emotion artwork`);
    }
  }

  for (const [day, emotions] of dailyEmotionNames) {
    const { filePath, html } = await readDailyPage(day);
    const relativePath = path.relative(repositoryRoot, filePath);
    if (!html.includes('href="../shared/reader.css?v=1"')) {
      errors.push(`${relativePath}: must use the shared emotion reader stylesheet`);
    }
    if (!html.includes('src="../shared/rating.js?v=1"')) {
      errors.push(`${relativePath}: must use the shared in-memory rating script`);
    }
    if (/<style\b/i.test(html)) {
      errors.push(`${relativePath}: page-specific inline styles are not allowed`);
    }
    for (const emotion of emotions) {
      if (!html.includes(`src="../assets/${emotion}-triptych.jpg"`)) {
        errors.push(`${relativePath}: must reference canonical ${emotion} artwork`);
      }
    }
  }

  const allFiles = await walkFiles(emotionRoot);
  const imageFiles = new Set(allFiles.filter((filePath) => /\.(?:jpe?g|png|webp|svg)$/i.test(filePath)));
  const referencedImages = new Set();
  const hashes = new Map();
  for (const resourcePath of allFiles.filter((filePath) => /\.(?:css|js)$/i.test(filePath))) {
    const relativePath = path.relative(emotionRoot, resourcePath);
    if (!["shared/reader.css", "shared/rating.js"].includes(relativePath)) {
      errors.push(`${path.relative(repositoryRoot, resourcePath)}: duplicate page-level style or script`);
    }
  }
  for (const htmlPath of allFiles.filter((filePath) => filePath.endsWith(".html"))) {
    const html = await readFile(htmlPath, "utf8");
    const relativePath = path.relative(repositoryRoot, htmlPath);
    if (!/href="(?:\.\.\/)+shared\/reader\.css\?v=1"/.test(html)) {
      errors.push(`${relativePath}: must use the shared emotion reader stylesheet`);
    }
    if (/<style\b/i.test(html)) {
      errors.push(`${relativePath}: page-specific inline styles are not allowed`);
    }
    for (const match of html.matchAll(/\bsrc="([^"?#]+)(?:[?#][^"]*)?"/g)) {
      const source = match[1];
      if (!/\.(?:jpe?g|png|webp|svg)$/i.test(source) || source.startsWith("/")) continue;
      const resolved = path.resolve(path.dirname(htmlPath), source);
      referencedImages.add(resolved);
      try {
        await access(resolved);
      } catch {
        errors.push(`${relativePath}: missing image ${source}`);
      }
    }
  }

  for (const imagePath of imageFiles) {
    if (!expectedArtwork.has(imagePath)) {
      errors.push(`${path.relative(repositoryRoot, imagePath)}: unexpected or misplaced emotion artwork`);
    }
    if (!referencedImages.has(imagePath)) {
      errors.push(`${path.relative(repositoryRoot, imagePath)}: unreferenced emotion artwork`);
    }
    const hash = createHash("sha256").update(await readFile(imagePath)).digest("hex");
    const duplicate = hashes.get(hash);
    if (duplicate) {
      errors.push(`${path.relative(repositoryRoot, imagePath)}: duplicates ${path.relative(repositoryRoot, duplicate)}`);
    } else {
      hashes.set(hash, imagePath);
    }
  }

  return errors;
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const errors = await validateEmotionReaders();
  if (errors.length > 0) {
    process.stderr.write(`${errors.join("\n")}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write("Emotion readers are consistent.\n");
  }
}
