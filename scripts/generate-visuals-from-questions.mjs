import fs from "node:fs";
import path from "node:path";

const questionRoot = path.join(process.cwd(), "content", "questions");
const visualPath = path.join(process.cwd(), "content", "visuals", "question-visuals.json");

const typeLabel = {
  flow: "流程图",
  structure: "结构图",
  compare: "对比图",
  sequence: "时序图",
  scenario: "场景图"
};

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

function frontmatterArray(raw, key) {
  const match = raw.match(new RegExp(`^${key}:\\s+\\[([^\\]]*)\\]`, "m"));

  if (!match) {
    return [];
  }

  return match[1]
    .split(",")
    .map((item) => item.replace(/["']/g, "").trim())
    .filter(Boolean);
}

function section(raw, title) {
  const match = raw.match(new RegExp(`## ${title}\\s+([\\s\\S]*?)(?=\\n## |$)`));
  return match?.[1]?.trim() ?? "";
}

function cleanText(text) {
  return text
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function isAsciiWord(char) {
  return /[A-Za-z0-9_]/.test(char ?? "");
}

function safeLabelSplit(text, maxLength = 16, hardMaxLength = 24) {
  const source = text.trim();

  if (source.length <= maxLength) {
    return [source, ""];
  }

  const hasChinese = /[\u4e00-\u9fff]/.test(source);

  if (!hasChinese && source.length <= hardMaxLength) {
    return [source, ""];
  }

  const splitCandidates = [];

  for (let index = 1; index < source.length; index += 1) {
    const previous = source[index - 1];
    const current = source[index];

    if (/\s/.test(previous) || /[、/：:，,；;。()（）-]/.test(previous)) {
      splitCandidates.push(index);
      continue;
    }

    if (previous === "的" || previous === "和" || previous === "或") {
      splitCandidates.push(index);
      continue;
    }

    if (!isAsciiWord(previous) && isAsciiWord(current)) {
      splitCandidates.push(index);
    }
  }

  const usableCandidates = splitCandidates.filter((index) => index >= 6 && index <= hardMaxLength);
  const beforeMax = usableCandidates.filter((index) => index <= maxLength).at(-1);
  const afterMax = usableCandidates.find((index) => index > maxLength);
  const shouldKeepNextToken =
    beforeMax !== undefined &&
    afterMax !== undefined &&
    beforeMax <= maxLength * 0.75 &&
    afterMax <= hardMaxLength;
  let splitAt = shouldKeepNextToken ? afterMax : beforeMax ?? afterMax ?? maxLength;

  if (isAsciiWord(source[splitAt - 1]) && isAsciiWord(source[splitAt])) {
    let tokenStart = splitAt;
    let tokenEnd = splitAt;

    while (tokenStart > 0 && isAsciiWord(source[tokenStart - 1])) {
      tokenStart -= 1;
    }

    while (tokenEnd < source.length && isAsciiWord(source[tokenEnd])) {
      tokenEnd += 1;
    }

    if (tokenStart >= 6) {
      splitAt = tokenStart;
    } else if (tokenEnd <= hardMaxLength) {
      splitAt = tokenEnd;
    }
  }

  const label = source.slice(0, splitAt).trim().replace(/[、/：:，,；;。-]$/g, "");
  const detail = source.slice(splitAt).trim().replace(/^[、/：:，,；;。-]/g, "");

  return [label || source.slice(0, maxLength).trim(), detail];
}

function inferType({ title, category, tags, hint }) {
  const joined = `${title} ${category} ${tags.join(" ")} ${hint}`;

  if (/时序图/.test(joined)) return "sequence";
  if (/对比图/.test(joined)) return "compare";
  if (/结构图/.test(joined)) return "structure";
  if (/场景图/.test(joined)) return "scenario";
  if (/流程图/.test(joined)) return "flow";
  if (/区别|对比| vs |VS|分别|有什么不同/.test(joined)) return "compare";
  if (/登录|握手|事务消息|消息表|分布式锁|RPC|调用|同步|复制|发送|消费/.test(joined)) return "sequence";
  if (/项目设计|系统|权限|上传|搜索|订单|库存|秒杀|优惠券|评论|通知/.test(joined)) return "scenario";
  if (/流程|过程|怎么做|怎么排查|怎么设计|为什么需要|如何|生命周期|执行顺序|加载/.test(joined)) return "flow";
  return "structure";
}

function extractCandidates(raw) {
  const hint = section(raw, "图解提示");
  const hintNodes = hint
    .match(/核心节点[：:]\s*([^。]+)/)?.[1]
    ?.split(/->|→|，|,|、/)
    .map((item) => cleanText(item))
    .filter((item) => item.length >= 2 && item.length <= 32)
    .slice(0, 7);

  if (hintNodes?.length >= 3) {
    return hintNodes;
  }

  const answer = section(raw, "面试回答");
  const bullets = answer
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line))
    .map((line) => cleanText(line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "")))
    .filter((line) => line.length >= 2);

  if (bullets.length >= 3) {
    return bullets.slice(0, 7);
  }

  const conclusion = section(raw, "一句话结论");
  const explain = section(raw, "通俗解释");
  const pieces = cleanText(`${conclusion} ${explain}`)
    .split(/[。；;，,：:]/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 3)
    .slice(0, 7);

  return pieces.length >= 2 ? pieces : ["核心概念", "关键过程", "面试风险点"];
}

function toNode(text, index) {
  const compact = cleanText(text)
    .replace(/^常见|^主要|^可以|^通常/, "")
    .replace(/[。；;]$/g, "");
  const clauses = compact
    .split(/[，,。；;：:]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const firstClause = clauses[0] ?? compact;
  const shouldPromoteSecondClause = firstClause === "头" && clauses[1];
  const labelSource = shouldPromoteSecondClause ? clauses[1].split(/[、/]/)[0].trim() : firstClause;
  const [safeLabel, overflowDetail] = safeLabelSplit(labelSource);
  const label = safeLabel || `节点 ${index + 1}`;
  const detailParts = [
    overflowDetail,
    ...(shouldPromoteSecondClause ? clauses.slice(2) : clauses.slice(1))
  ].filter(Boolean);
  const detail = detailParts.length ? detailParts.join("，") : undefined;
  const risky = /失败|风险|超时|拒绝|死锁|雪崩|击穿|穿透|OOM|慢|异常|延迟|泄漏|回滚|重复|丢/.test(compact);

  return {
    label,
    ...(detail ? { detail } : {}),
    tone: index === 0 ? "main" : risky ? "warn" : "safe"
  };
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
  const slug = frontmatterValue(raw, "slug");
  const title = frontmatterValue(raw, "title");
  const category = frontmatterValue(raw, "category");
  const summary = frontmatterValue(raw, "summary");
  const tags = frontmatterArray(raw, "tags");
  const hint = section(raw, "图解提示");
  const type = inferType({ title, category, tags, hint });
  const hook = cleanText(section(raw, "记忆钩子"));
  const analogy = cleanText(section(raw, "通俗解释")).split(/[。；;]/)[0] ?? "";
  const nodes = extractCandidates(raw).map(toNode).slice(0, 7);
  const nodeLabels = nodes.map((node) => node.label).join("、");

  return [
    slug,
    {
      type,
      title: visualTitle(title, type),
      summary,
      nodes,
      prompt: `${hint || `画一张${typeLabel[type]}：${title}。核心节点：${nodeLabels}。视觉类比：${analogy || summary}。`} 要求中文短标签、温暖清晰、手机端可读、不要堆段落文字。`,
      takeaway: hook || summary
    }
  ];
}

const visuals = JSON.parse(fs.readFileSync(visualPath, "utf8"));
const before = Object.keys(visuals).length;
let added = 0;
let updated = 0;

for (const file of walk(questionRoot)) {
  const [slug, visual] = buildVisual(file);

  if (!slug) {
    continue;
  }

  const previous = visuals[slug];

  if (!previous) {
    visuals[slug] = visual;
    added += 1;
    continue;
  }

  if (JSON.stringify(previous) !== JSON.stringify(visual)) {
    visuals[slug] = visual;
    updated += 1;
  }
}

fs.writeFileSync(visualPath, `${JSON.stringify(visuals, null, 2)}\n`, "utf8");

console.log(`visuals_before=${before}`);
console.log(`visuals_added=${added}`);
console.log(`visuals_updated=${updated}`);
console.log(`visuals_after=${Object.keys(visuals).length}`);
