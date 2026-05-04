import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const questionsRoot = path.join(root, "content", "questions");
const visualsPath = path.join(root, "content", "visuals", "question-visuals.json");

const batchNumber = Number.parseInt(process.argv[2] ?? "", 10);

if (!Number.isInteger(batchNumber) || batchNumber < 1) {
  console.error("Usage: node scripts/validate-repair-batch.mjs <batchNumber>");
  process.exit(1);
}

function collectMarkdownFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

function countHeading(content, title) {
  return (content.match(new RegExp(`^## ${title}$`, "gm")) ?? []).length;
}

function extractSection(content, title) {
  const match = content.match(new RegExp(`(?:^|\\r?\\n)## ${title}\\r?\\n([\\s\\S]*?)(?=\\r?\\n## |$)`));
  return match?.[1]?.trim() ?? "";
}

const files = collectMarkdownFiles(questionsRoot)
  .map((file) => path.relative(root, file).replaceAll("\\", "/"))
  .sort((a, b) => a.localeCompare(b));

const start = (batchNumber - 1) * 10;
const batchFiles = files.slice(start, start + 10);

if (batchFiles.length !== 10) {
  console.error(`Batch ${batchNumber} resolved to ${batchFiles.length} files.`);
  process.exit(1);
}

const visuals = JSON.parse(fs.readFileSync(visualsPath, "utf8"));
let failures = 0;

for (const file of batchFiles) {
  const raw = fs.readFileSync(path.join(root, file), "utf8");
  const parsed = matter(raw);
  const slug = parsed.data.slug ?? path.basename(file, ".md");
  const detail = extractSection(parsed.content, "详细讲解");
  const followups = extractSection(parsed.content, "常见追问");
  const detailLength = detail.replace(/\s/g, "").length;
  const visual = visuals[slug] ?? visuals[path.basename(file, ".md")];
  const nodes = visual?.nodes ?? [];
  const truncated = nodes.filter((node) => node.label.includes("...") || node.label.includes("…") || /[.…]$/.test(node.label));
  const springRedisContamination = file.includes("/spring/")
    ? /Redis 方案通常|知道 Redis 命令|能维护 Redis 系统/.test(parsed.content)
    : false;
  const issues = [];

  if (detailLength < 1000 || detailLength > 2000) issues.push(`detail=${detailLength}`);
  if (countHeading(parsed.content, "详细讲解") !== 1) issues.push("详细讲解 heading count");
  if (countHeading(parsed.content, "常见追问") !== 1) issues.push("常见追问 heading count");
  if (countHeading(parsed.content, "图解提示") !== 1) issues.push("图解提示 heading count");
  if ((parsed.content.match(/相关问题通常都不是孤立出现/g) ?? []).length > 0) issues.push("generic template phrase");
  if ((followups.match(/^### /gm) ?? []).length < 4) issues.push("followups < 4");
  if (nodes.length !== 6) issues.push(`visual nodes=${nodes.length}`);
  if (truncated.length > 0) issues.push(`truncated=${truncated.map((node) => node.label).join("/")}`);
  if (springRedisContamination) issues.push("spring has Redis suffix");

  if (issues.length > 0) {
    failures += 1;
    console.log(`FAIL ${slug}: ${issues.join(", ")}`);
  } else {
    console.log(`OK ${slug}: detail=${detailLength}, followups=4, visualNodes=6`);
  }
}

if (failures > 0) {
  console.error(`Batch ${batchNumber} validation failed: ${failures} file(s).`);
  process.exit(1);
}

console.log(`Batch ${batchNumber} validation passed.`);
