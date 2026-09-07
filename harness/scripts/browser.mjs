import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright-chromium";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");

function cachedChromiumCandidates() {
  const cacheRoot = path.join(homedir(), "Library/Caches/ms-playwright");
  let directories = [];
  try {
    directories = readdirSync(cacheRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && /^chromium(?:_headless_shell)?-\d+$/.test(entry.name))
      .map((entry) => entry.name)
      .sort((left, right) => Number(right.split("-").at(-1)) - Number(left.split("-").at(-1)));
  } catch {
    return [];
  }

  return directories.flatMap((directory) => [
    path.join(cacheRoot, directory, "chrome-headless-shell-mac-arm64/chrome-headless-shell"),
    path.join(cacheRoot, directory, "chrome-headless-shell-mac-x64/chrome-headless-shell"),
    path.join(cacheRoot, directory, "chrome-headless-shell-linux64/chrome-headless-shell"),
    path.join(cacheRoot, directory, "chrome-headless-shell-win64/chrome-headless-shell.exe"),
    path.join(cacheRoot, directory, "chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"),
    path.join(cacheRoot, directory, "chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"),
    path.join(cacheRoot, directory, "chrome-linux64/chrome"),
    path.join(cacheRoot, directory, "chrome-win64/chrome.exe"),
  ]);
}

export function resolveBrowserExecutable(
  preferredPath = chromium.executablePath(),
  fallbackPaths = cachedChromiumCandidates(),
) {
  return [preferredPath, ...fallbackPaths].find((candidate) => candidate && existsSync(candidate)) ?? "";
}

export function runBrowserTests({
  includeStatic = false,
  executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || resolveBrowserExecutable(),
  run = spawnSync,
} = {}) {
  if (!executablePath || !existsSync(executablePath)) {
    process.stderr.write("Harness Chromium 不存在。请先运行：npm --prefix harness run install:browser\n浏览器安装完成前不会执行生产构建。\n");
    return 1;
  }

  const build = run("npm", ["run", "build"], { cwd: repositoryRoot, stdio: "inherit" });
  if (build.status !== 0) return build.status ?? 1;

  const files = [
    ...(includeStatic ? ["tests/rendered-html.test.mjs"] : []),
    "harness/tests/browser-runtime.test.mjs",
  ];
  const result = run(process.execPath, ["--test", ...files], {
    cwd: repositoryRoot,
    stdio: "inherit",
    env: { ...process.env, PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH: executablePath },
  });
  return result.status ?? 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--with-static")) {
    process.stderr.write("用法：node scripts/browser.mjs [--with-static]\n");
    process.exitCode = 1;
  } else {
    process.exitCode = runBrowserTests({ includeStatic: args.includes("--with-static") });
  }
}
