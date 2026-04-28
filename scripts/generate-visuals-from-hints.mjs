import fs from "node:fs";
import path from "node:path";

const questionRoot = path.join(process.cwd(), "content", "questions");
const visualPath = path.join(process.cwd(), "content", "visuals", "question-visuals.json");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return walk(fullPath);
    }

    return entry.isFile() && entry.name.endsWith(".md") ? [fullPath] : [];
  });
}

function frontmatterValue(raw, key) {
  const match = raw.match(new RegExp(`^${key}:\\s+"([^"]+)"`, "m"));
  return match?.[1] ?? "";
}

function section(raw, title) {
  const match = raw.match(new RegExp(`## ${title}\\s+([\\s\\S]*?)(?=\\n## |$)`));
  return match?.[1]?.trim() ?? "";
}

function inferType(hint) {
  if (hint.includes("时序图")) return "sequence";
  if (hint.includes("对比图")) return "compare";
  if (hint.includes("结构图")) return "structure";
  if (hint.includes("场景图")) return "scenario";
  return "flow";
}

function shortNode(text, index) {
  const clean = text
    .replace(/^适合画[^：]+：/, "")
    .replace(/[。；;]$/g, "")
    .trim();
  const splitAt = clean.length > 16 ? 16 : clean.length;
  const label = clean.slice(0, splitAt).trim();
  const detail = clean.length > 16 ? clean.slice(splitAt).trim() : undefined;
  const risky = /失败|风险|超限|拒绝|死信|误伤|回滚|异常|延迟|阻塞|泄露|拒/.test(clean);

  return {
    label,
    ...(detail ? { detail } : {}),
    tone: index === 0 ? "main" : risky ? "warn" : "safe"
  };
}

function buildNodes(hint, type) {
  const body = hint.replace(/^适合画[^：]+：/, "").trim();
  const parts = body
    .split(/->|→|，|,|。|；|;|、/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 2)
    .filter((part) => !part.includes("16:9"))
    .slice(0, type === "compare" ? 6 : 7);

  if (parts.length >= 2) {
    return parts.map(shortNode);
  }

  return [
    shortNode(body || "核心概念", 0),
    shortNode("关键关系", 1),
    shortNode("面试风险点", 2)
  ];
}

function visualTitle(title, type) {
  const suffix = {
    flow: "流程一眼看懂",
    structure: "结构一眼看懂",
    compare: "差异一眼看懂",
    sequence: "交互一眼看懂",
    scenario: "场景一眼看懂"
  }[type];

  return `${title.replace(/[？?]$/g, "")}：${suffix}`;
}

function buildVisual(file) {
  const raw = fs.readFileSync(file, "utf8");
  const hint = section(raw, "图解提示");

  if (!hint) {
    return undefined;
  }

  const slug = frontmatterValue(raw, "slug");
  const title = frontmatterValue(raw, "title");
  const summary = frontmatterValue(raw, "summary");
  const hook = section(raw, "记忆钩子").replace(/\*\*/g, "").trim();
  const type = inferType(hint);

  return [
    slug,
    {
      type,
      title: visualTitle(title, type),
      summary,
      nodes: buildNodes(hint, type),
      prompt: `${hint} 要求：中文短标签，每个节点不超过 12 个字，画面温暖清晰，保留 16:9 和 4:5 两套比例，不堆大段文字。`,
      takeaway: hook || summary
    }
  ];
}

const visuals = JSON.parse(fs.readFileSync(visualPath, "utf8"));
const before = Object.keys(visuals).length;
let added = 0;
let updated = 0;

for (const file of walk(questionRoot)) {
  const item = buildVisual(file);

  if (!item) {
    continue;
  }

  const [slug, visual] = item;

  if (!slug) {
    continue;
  }

  if (!visuals[slug]) {
    visuals[slug] = visual;
    added += 1;
    continue;
  }

  if (typeof visuals[slug].prompt === "string" && visuals[slug].prompt.startsWith("适合画")) {
    visuals[slug] = visual;
    updated += 1;
  }
}

fs.writeFileSync(visualPath, `${JSON.stringify(visuals, null, 2)}\n`, "utf8");

console.log(`visuals_before=${before}`);
console.log(`visuals_added=${added}`);
console.log(`visuals_updated=${updated}`);
console.log(`visuals_after=${Object.keys(visuals).length}`);
