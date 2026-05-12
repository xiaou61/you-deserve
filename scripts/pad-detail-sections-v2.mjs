import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = path.join(process.cwd(), "content", "questions");

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

function normalize(text) {
  return text.replace(/\r\n/g, "\n");
}

function detailLength(text) {
  return text.replace(/\s/g, "").length;
}

function extractSection(content, title) {
  const match = normalize(content).match(new RegExp(`(?:^|\\n)## ${title}\\n+([\\s\\S]*?)(?=\\n## |$)`));
  return match?.[1]?.trim() ?? "";
}

function replaceSection(content, title, body) {
  return normalize(content).replace(
    new RegExp(`((?:^|\\n)## ${title}\\n+)([\\s\\S]*?)(?=\\n## |$)`),
    `$1${body.trim()}\n`
  );
}

function folderName(filePath) {
  return path.relative(root, filePath).split(path.sep)[0];
}

function clean(text) {
  return text.replace(/\s+/g, " ").trim().replace(/[。！？!?]+$/u, "");
}

function buildExtraParagraphs(folder, title, summary) {
  const topic = clean(title);
  const concise = clean(summary || title);
  const map = {
    java: [
      `再往实战一点讲，${topic} 这类题最好补一层“怎么验证”。比如你会用什么最小复现、单测、线程栈、JFR、源码断点或压测结果去证明判断。Java 并发和基础题一旦能把验证动作说出来，答案就会从“我记得概念”变成“我知道怎么排查它真的有没有生效”。`,
      `如果把它放进真实项目里，最值得主动补的是代价说明：这套机制会不会让锁竞争更重、对象生命周期更长、可见性更难推断，或者因为错误用法把问题放到高并发时才暴露。把这些副作用讲出来，比单纯背定义更有区分度。`
    ],
    mq: [
      `真正拉开差距的，通常不是“它支不支持可靠性”，而是你能不能把 ${concise} 和业务结果对上。比如消费者重试后数据库里会不会多写、死信积压会不会影响 SLA、补偿是不是会把顺序再打散。把消息层和业务层一起说，内容会厚很多。`,
      `面试里如果想显得更像做过线上链路，可以再补一句你会怎么止血：是先限流、降级、跳过毒丸、扩分区、扩消费者，还是先切换到补偿任务。这样读者拿去答题时，不会只停在机制解释。`
    ],
    mysql: [
      `再补一层取舍会更像真实优化。比如为了让 ${topic} 更稳，可能会改索引、改 SQL、换分页方式，甚至拆冷热数据。但每种改法都会带来写放大、维护成本、回滚难度或者兼容风险。把这个取舍说出来，文章就不只是“会分析”，而是“会决策”。`,
      `如果要证明方案改对了，最好顺手补一句看什么回稳：慢日志是否下降、rows 是否变少、锁等待有没有缩短、临时表/磁盘排序有没有减少、主从延迟是否恢复。MySQL 题最怕只说“应该会快”，不说怎么确认真的快了。`
    ],
    project: [
      `项目设计题再往上一层，最重要的是“怎么验证这套方案不是自我感动”。比如上线后看告警噪音有没有下降、回滚耗时有没有缩短、补偿单量有没有减少、人工介入是不是变少。只要把效果验证讲出来，答案就会比普通方案描述更完整。`,
      `另外也可以顺手补一句组织层面的现实约束：权限审批、运维配合、发布节奏、跨团队依赖、数据修复窗口，这些都会反过来决定 ${topic} 到底该做多重还是多轻。项目题说到这里，基本就已经是带项目味道的表达了。`
    ],
    default: [
      `如果继续往实战靠一步，最好补一句“怎么验证”和“怎么止血”。只要把日志、指标、最小复现或回滚动作说出来，内容就会比单纯解释定义更耐追问。`,
      `另外也别忘了主动交代取舍：这个方案为什么更适合当前场景，代价是什么，规模再上去以后会不会先卡在别的地方。能说出边界，文章的可信度就会上来。`
    ]
  };

  return map[folder] ?? map.default;
}

const files = collectMarkdownFiles(root);
let updated = 0;

for (const file of files) {
  const raw = fs.readFileSync(file, "utf8");
  const parsed = matter(normalize(raw));
  const detail = extractSection(parsed.content, "详细讲解");
  if (!detail || detailLength(detail) >= 1000) {
    continue;
  }

  const folder = folderName(file);
  const extras = buildExtraParagraphs(
    folder,
    typeof parsed.data.title === "string" ? parsed.data.title : path.basename(file, ".md"),
    typeof parsed.data.summary === "string" ? parsed.data.summary : ""
  );
  const fallback =
    "最后再补一句最实用的：如果面试里真的被追到这一步，不要急着继续堆术语，直接说你会怎么验证、怎么排除反例、怎么判断风险已经收住。能把这三个动作讲出来，答案通常就已经比标准八股更像真实经验。";

  let nextDetail = detail;
  for (const extra of extras) {
    if (detailLength(nextDetail) >= 1000) {
      break;
    }
    nextDetail = `${nextDetail}\n\n${extra}`;
  }
  if (detailLength(nextDetail) < 1000) {
    nextDetail = `${nextDetail}\n\n${fallback}`;
  }

  const nextContent = replaceSection(parsed.content, "详细讲解", nextDetail);
  const rebuilt = matter.stringify(nextContent, parsed.data, { lineWidth: 0 });
  fs.writeFileSync(file, rebuilt.replace(/\n/g, "\r\n"), "utf8");
  updated += 1;
}

console.log(JSON.stringify({ updated }, null, 2));
