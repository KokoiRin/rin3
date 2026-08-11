import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const harnessRoot = path.resolve(import.meta.dirname, "..");
const repositoryRoot = path.resolve(harnessRoot, "..");
const codeExtension = /\.(?:js|mjs|ts|tsx)$/;
const behaviorIdPattern = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*-\d{3}$/;
const chinesePattern = /[\u3400-\u9fff]/;
const outputRoot = path.join(harnessRoot, "output");

export async function loadRegistry(root = repositoryRoot) {
  const source = await readFile(path.join(root, "harness/behaviors/registry.json"), "utf8");
  return JSON.parse(source);
}

function collectSymbols(source, fileName) {
  const scriptKind = fileName.endsWith(".tsx")
    ? ts.ScriptKind.TSX
    : fileName.endsWith(".jsx")
      ? ts.ScriptKind.JSX
      : fileName.endsWith(".js") || fileName.endsWith(".mjs")
        ? ts.ScriptKind.JS
        : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, scriptKind);
  const symbols = new Set();

  function visit(node) {
    if ((ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) && node.name) {
      symbols.add(node.name.text);
    }
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      symbols.add(node.name.text);
    }
    if (ts.isMethodDeclaration(node) && node.name && ts.isIdentifier(node.name)) {
      symbols.add(node.name.text);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return symbols;
}

function assertCondition(condition, message, errors) {
  if (!condition) errors.push(message);
}

export async function validateRegistry(registry, root = repositoryRoot) {
  const errors = [];
  assertCondition(registry.schemaVersion === 1, "registry schemaVersion must be 1", errors);
  assertCondition(Array.isArray(registry.codeRoots) && registry.codeRoots.length > 0, "registry codeRoots must be a non-empty array", errors);
  assertCondition(Array.isArray(registry.testRoots) && registry.testRoots.length > 0, "registry testRoots must be a non-empty array", errors);
  assertCondition(Array.isArray(registry.behaviors) && registry.behaviors.length > 0, "registry behaviors must be a non-empty array", errors);

  const ids = new Set();
  const registeredTests = new Set();
  const sourceCache = new Map();
  const symbolCache = new Map();

  for (const behavior of registry.behaviors ?? []) {
    const context = behavior.id || "<missing-id>";
    assertCondition(behaviorIdPattern.test(context), `${context}: invalid behavior id`, errors);
    assertCondition(!ids.has(context), `${context}: duplicate behavior id`, errors);
    ids.add(context);
    assertCondition(Number.isInteger(behavior.version) && behavior.version > 0, `${context}: version must be a positive integer`, errors);
    assertCondition(["active", "retired"].includes(behavior.status), `${context}: status must be active or retired`, errors);
    assertCondition(chinesePattern.test(behavior.nameZh ?? ""), `${context}: nameZh must contain Chinese`, errors);
    assertCondition(chinesePattern.test(behavior.behaviorZh ?? ""), `${context}: behaviorZh must be a Chinese business sentence`, errors);
    assertCondition(behavior.behaviorZh?.endsWith("。"), `${context}: behaviorZh must be a complete Chinese sentence ending with 。`, errors);
    assertCondition(/^\d{4}-\d{2}-\d{2}$/.test(behavior.lastReviewedOn ?? ""), `${context}: lastReviewedOn must use YYYY-MM-DD`, errors);
    assertCondition(Array.isArray(behavior.code) && behavior.code.length > 0, `${context}: code mappings must not be empty`, errors);
    assertCondition(Array.isArray(behavior.tests) && behavior.tests.length > 0, `${context}: test mappings must not be empty`, errors);

    for (const code of behavior.code ?? []) {
      const absolutePath = path.join(root, code.file ?? "");
      assertCondition(codeExtension.test(code.file ?? ""), `${context}: code file must be JavaScript or TypeScript: ${code.file}`, errors);
      try {
        await access(absolutePath);
        if (!sourceCache.has(code.file)) sourceCache.set(code.file, await readFile(absolutePath, "utf8"));
        if (!symbolCache.has(code.file)) symbolCache.set(code.file, collectSymbols(sourceCache.get(code.file), code.file));
        assertCondition(symbolCache.get(code.file).has(code.symbol), `${context}: symbol ${code.file}#${code.symbol} does not exist`, errors);
      } catch {
        errors.push(`${context}: code file does not exist: ${code.file}`);
      }
      assertCondition(chinesePattern.test(code.roleZh ?? ""), `${context}: ${code.file}#${code.symbol} needs a Chinese roleZh`, errors);
    }

    for (const testCase of behavior.tests ?? []) {
      const key = `${testCase.file}::${testCase.name}`;
      assertCondition(!registeredTests.has(key), `${context}: duplicate test mapping ${key}`, errors);
      registeredTests.add(key);
      assertCondition(testCase.name?.startsWith(`[${context}] `), `${context}: test name must start with [${context}]`, errors);
      assertCondition(chinesePattern.test(testCase.name ?? ""), `${context}: test name must contain Chinese`, errors);
      assertCondition(chinesePattern.test(testCase.behaviorZh ?? ""), `${context}: test ${testCase.name} needs a Chinese behaviorZh`, errors);
      assertCondition(testCase.behaviorZh?.endsWith("。"), `${context}: test ${testCase.name} behaviorZh must end with 。`, errors);
      const absolutePath = path.join(root, testCase.file ?? "");
      try {
        await access(absolutePath);
        if (!sourceCache.has(testCase.file)) sourceCache.set(testCase.file, await readFile(absolutePath, "utf8"));
        assertCondition(sourceCache.get(testCase.file).includes(testCase.name), `${context}: test name not found in ${testCase.file}: ${testCase.name}`, errors);
      } catch {
        errors.push(`${context}: test file does not exist: ${testCase.file}`);
      }
    }
  }

  for (const [file, source] of sourceCache) {
    if (!file.includes("test")) continue;
    for (const match of source.matchAll(/test\(\s*["'`]([^"'`]*\[([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*-\d{3})\][^"'`]*)["'`]/g)) {
      const [, testName, behaviorId] = match;
      assertCondition(ids.has(behaviorId), `${file}: references unknown behavior id ${behaviorId}`, errors);
      assertCondition(registeredTests.has(`${file}::${testName}`), `${file}: tagged test is missing from registry: ${testName}`, errors);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Behavior registry is invalid:\n- ${errors.join("\n- ")}`);
  }
  return registry;
}

function gitLines(args) {
  try {
    return execFileSync("git", args, { cwd: repositoryRoot, encoding: "utf8" })
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function isUnderCodeRoot(file, codeRoots) {
  return codeExtension.test(file) && codeRoots.some((root) => file === root || file.startsWith(`${root}/`));
}

export function changedCodeFiles(registry) {
  const tracked = gitLines(["diff", "--name-only", "HEAD", "--", ...registry.codeRoots]);
  const untracked = gitLines(["ls-files", "--others", "--exclude-standard", "--", ...registry.codeRoots]);
  return [...new Set([...tracked, ...untracked])].filter((file) => isUnderCodeRoot(file, registry.codeRoots));
}

function changedTestFiles(registry) {
  const tracked = gitLines(["diff", "--name-only", "HEAD", "--", ...registry.testRoots]);
  const untracked = gitLines(["ls-files", "--others", "--exclude-standard", "--", ...registry.testRoots]);
  return [...new Set([...tracked, ...untracked])].filter((file) =>
    /\.test\.mjs$/.test(file) && existsSync(path.join(repositoryRoot, file)));
}

function testNames(source) {
  return [...source.matchAll(/test\(\s*["'`]([^"'`]*)["'`]/g)].map((match) => match[1]);
}

function headFile(file) {
  const candidates = [
    file,
    file.startsWith("harness/tests/") ? file.slice("harness/".length) : null,
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      return execFileSync("git", ["show", `HEAD:${candidate}`], {
        cwd: repositoryRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
    } catch {
      // 继续检查迁移前的测试路径。
    }
  }
  return "";
}

function headRegistry() {
  try {
    return JSON.parse(execFileSync(
      "git",
      ["show", "HEAD:harness/behaviors/registry.json"],
      { cwd: repositoryRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ));
  } catch {
    return null;
  }
}

export function validateChangedCode(registry) {
  const changedFiles = changedCodeFiles(registry);
  const changedTests = changedTestFiles(registry);
  if (changedFiles.length === 0 && changedTests.length === 0) return [];

  const errors = [];
  const previous = headRegistry();
  const previousById = new Map((previous?.behaviors ?? []).map((behavior) => [behavior.id, behavior]));

  for (const file of changedFiles) {
    const mapped = registry.behaviors.filter((behavior) =>
      behavior.status === "active" && behavior.code.some((code) => code.file === file));
    if (mapped.length === 0) {
      errors.push(`${file}: changed code file is not mapped to any active business behavior`);
      continue;
    }
    if (!previous) continue;
    for (const behavior of mapped) {
      const oldBehavior = previousById.get(behavior.id);
      if (oldBehavior && behavior.version <= oldBehavior.version) {
        errors.push(`${file}: bump ${behavior.id} version and review its behavior, code and tests`);
      }
    }
  }

  for (const file of changedTests) {
    const mapped = registry.behaviors.filter((behavior) =>
      behavior.status === "active" && behavior.tests.some((testCase) => testCase.file === file));
    if (mapped.length === 0) {
      errors.push(`${file}: changed test file is not mapped to any active business behavior`);
      continue;
    }

    const oldNames = new Set(testNames(headFile(file)));
    const currentNames = testNames(readFileSync(path.join(repositoryRoot, file), "utf8"));
    for (const name of currentNames.filter((testName) => !oldNames.has(testName))) {
      if (!/^\[[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*-\d{3}\] [\u3400-\u9fff]/.test(name)) {
        errors.push(`${file}: new or renamed business test needs [行为ID] 中文名称: ${name}`);
      }
    }

    if (!previous) continue;
    for (const behavior of mapped) {
      const oldBehavior = previousById.get(behavior.id);
      if (oldBehavior && behavior.version <= oldBehavior.version) {
        errors.push(`${file}: bump ${behavior.id} version and review its Chinese test descriptions`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Changed code is not synchronized with the behavior registry:\n- ${errors.join("\n- ")}`);
  }
  return [...changedFiles, ...changedTests];
}

export function findBehaviors(registry, query) {
  const normalized = query.toLowerCase();
  return registry.behaviors.filter((behavior) =>
    behavior.id.toLowerCase() === normalized
    || behavior.nameZh.includes(query)
    || behavior.code.some((code) =>
      code.symbol.toLowerCase().includes(normalized)
      || code.file.toLowerCase().includes(normalized)));
}

function printBehavior(behavior) {
  process.stdout.write(`\n${behavior.id} v${behavior.version} · ${behavior.nameZh}\n`);
  process.stdout.write(`${behavior.behaviorZh}\n`);
  process.stdout.write("代码：\n");
  for (const code of behavior.code) process.stdout.write(`  - ${code.file}#${code.symbol}：${code.roleZh}\n`);
  process.stdout.write("测试：\n");
  for (const testCase of behavior.tests) process.stdout.write(`  - ${testCase.name}\n    ${testCase.behaviorZh}\n`);
}

export function parseTestSummary(output) {
  const value = (name) => {
    const matches = [...output.matchAll(new RegExp(`ℹ ${name} (\\d+)`, "g"))];
    return matches.reduce((total, match) => total + Number(match[1]), 0);
  };
  return {
    total: value("tests"),
    passed: value("pass"),
    failed: value("fail"),
    skipped: value("skipped"),
  };
}

function collectArtifacts(behaviorId) {
  const directory = path.join(outputRoot, "artifacts", behaviorId);
  try {
    return readdirSync(directory)
      .filter((file) => /\.(?:png|zip)$/.test(file))
      .sort()
      .map((file) => ({
        kind: file.endsWith(".png") ? "image" : "trace",
        name: file,
        path: `artifacts/${behaviorId}/${file}`,
      }));
  } catch {
    return [];
  }
}

export function writeRunResult({ behaviorId, startedAt, status, output, phase = "test" }) {
  const resultRoot = path.join(outputRoot, "results");
  mkdirSync(resultRoot, { recursive: true });
  const result = {
    schemaVersion: 1,
    behaviorId,
    command: `npm --prefix harness run behavior -- run ${behaviorId}`,
    status,
    phase,
    startedAt,
    finishedAt: new Date().toISOString(),
    tests: parseTestSummary(output),
    artifacts: collectArtifacts(behaviorId),
    outputTail: output.slice(-4000),
  };
  writeFileSync(
    path.join(resultRoot, `${behaviorId}.json`),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  return result;
}

export function runBehaviors(registry, ids) {
  const startedAt = new Date().toISOString();
  const selected = ids.includes("all")
    ? registry.behaviors.filter((behavior) => behavior.status === "active")
    : ids.map((id) => registry.behaviors.find((behavior) => behavior.id === id));
  if (selected.some((behavior) => !behavior)) {
    throw new Error(`Unknown behavior id: ${ids.filter((id) => !registry.behaviors.some((behavior) => behavior.id === id)).join(", ")}`);
  }

  const needsBuild = selected.some((behavior) =>
    behavior.tests.some((testCase) => testCase.level === "static" || testCase.level === "browser"));
  if (needsBuild) {
    const build = spawnSync("npm", ["run", "build"], { cwd: repositoryRoot, stdio: "inherit" });
    if (build.status !== 0) {
      if (selected.length === 1) {
        writeRunResult({
          behaviorId: selected[0].id,
          startedAt,
          status: "failed",
          output: "生产构建失败，尚未执行行为测试。",
          phase: "build",
        });
      }
      return build.status ?? 1;
    }
  }

  const files = [...new Set(selected.flatMap((behavior) => behavior.tests.map((testCase) => testCase.file)))];
  const pattern = selected.map((behavior) => `\\[${behavior.id}\\]`).join("|");
  const result = spawnSync(
    process.execPath,
    ["--test", `--test-name-pattern=${pattern}`, ...files],
    { cwd: repositoryRoot, encoding: "utf8" },
  );
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  process.stdout.write(result.stdout ?? "");
  process.stderr.write(result.stderr ?? "");
  if (selected.length === 1) {
    const written = writeRunResult({
      behaviorId: selected[0].id,
      startedAt,
      status: result.status === 0 ? "passed" : "failed",
      output,
    });
    process.stdout.write(`\n验收结果已写入：harness/output/results/${written.behaviorId}.json\n`);
  }
  return result.status ?? 1;
}

function help() {
  process.stdout.write(`业务行为工具\n\n`);
  process.stdout.write(`  npm --prefix harness run behavior -- list\n`);
  process.stdout.write(`  npm --prefix harness run behavior -- show <行为ID>\n`);
  process.stdout.write(`  npm --prefix harness run behavior -- impact <函数名或文件>\n`);
  process.stdout.write(`  npm --prefix harness run behavior -- run <行为ID|all>\n`);
  process.stdout.write(`  npm --prefix harness run check\n`);
}

async function main() {
  const registry = await validateRegistry(await loadRegistry());
  const [command = "help", ...args] = process.argv.slice(2);

  if (command === "list") {
    for (const behavior of registry.behaviors) {
      process.stdout.write(`${behavior.id}\t${behavior.nameZh}\t${behavior.behaviorZh}\n`);
    }
    return;
  }
  if (command === "show" || command === "impact") {
    if (args.length === 0) throw new Error(`${command} requires a behavior id, function name or file path`);
    const matches = findBehaviors(registry, args.join(" "));
    if (matches.length === 0) throw new Error(`No behavior found for: ${args.join(" ")}`);
    matches.forEach(printBehavior);
    return;
  }
  if (command === "run") {
    if (args.length === 0) throw new Error("run requires at least one behavior id or all");
    process.exitCode = runBehaviors(registry, args);
    return;
  }
  if (command === "check") {
    const changedFiles = validateChangedCode(registry);
    process.stdout.write(`行为数据库有效：${registry.behaviors.length} 个行为，${registry.behaviors.flatMap((behavior) => behavior.tests).length} 个测试映射。\n`);
    process.stdout.write(changedFiles.length > 0
      ? `本轮代码/测试映射已同步：${changedFiles.join(", ")}\n`
      : "本轮没有需要同步的代码文件。\n");
    return;
  }
  help();
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
