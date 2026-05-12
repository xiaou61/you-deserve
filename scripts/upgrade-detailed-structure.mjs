import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = path.join(process.cwd(), "content", "questions");
const targetFolders = new Set(["project", "mysql", "mq", "java"]);

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

function firstSentence(text) {
  const compact = text.replace(/\s+/g, " ").trim();
  const match = compact.match(/^(.+?[。！？!?])/);
  return (match ? match[1] : compact).replace(/[。！？!?]+$/u, "").trim();
}

function firstBullet(section) {
  const bullet = section
    .split("\n")
    .map((line) => line.trim())
    .find((line) => /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line));
  return bullet ? bullet.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "").replace(/[。！？!?]+$/u, "").trim() : "";
}

function topFollowupTitles(section) {
  return Array.from(section.matchAll(/^###\s+(.+)$/gm))
    .map((m) => m[1].trim())
    .slice(0, 3);
}

function bulletList(section) {
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "").replace(/[。！？!?]+$/u, "").trim());
}

function dedupe(items) {
  return [...new Set(items.filter(Boolean))];
}

function buildParagraphs(folder, title, summary, interview, followups, pitfalls) {
  const topic = title.replace(/[？?]+$/u, "").trim();
  const summaryLine = firstSentence(summary || title);
  const focus = firstBullet(interview) || summaryLine;
  const interviewPoints = bulletList(interview);
  const pitfallPoints = bulletList(pitfalls);
  const followupLine = topFollowupTitles(followups).join("、");

  if (folder === "project") {
    return [
      `${topic} 这类题如果只讲“功能上怎么做”，基本只够一面。真正拉开差距的是把它放回真实业务里：为什么现在要做、系统里最脆弱的是哪一段、出了问题会先伤到谁。先用一句话把背景压住会比较稳，比如 ${summaryLine}，然后马上接业务约束，例如入口流量、状态表、权限边界、下游依赖和人工兜底。`,
      `讲主链路时，不要把它说成抽象方案，而是按状态变化来讲。围绕“${focus}”往下展开，说明请求先落到哪里、核心规则在哪判断、哪些数据会持久化、哪个环节需要异步化或补偿。项目设计题只要把“状态有没有写进去、调用有没有幂等、失败会不会半成功”这几件事讲清楚，面试官通常就会继续听。`,
      `真正容易翻车的，往往不是主流程，而是例外情况。这里可以主动把 ${pitfallPoints.slice(0, 3).join("、")} 这些风险说出来，再补一句它们分别会表现成什么现象，例如重复扣减、灰度误伤、审计缺口、回滚不干净或运营误操作。这样读者复习时就不只是记住方案名字，而是知道哪些地方最需要防守。`,
      `如果继续深挖，通常就会落到 ${followupLine || "权限、补偿和回滚"} 这类问题上。这时不要再回到大词，而是讲证据：你会看业务状态表、审计日志、队列堆积、错误率、回滚记录还是最近变更。项目题越往后，越像一次事故复盘或方案评审，能说出观测面，可信度就会明显上来。`,
      `最后收口时，尽量把 ${topic} 讲成一套决策闭环：背景约束是什么，为什么不用更简单的方案，当前方案最贵的复杂度落在哪，出了问题如何止血，回稳后又靠什么指标证明这套设计真的站住了。这样的结构比“先定义再列点”更接近真实项目表达。`
    ];
  }

  if (folder === "mysql") {
    return [
      `${topic} 这类 MySQL 题最怕把“书上的规律”直接当成线上结论。更稳的讲法是先把 SQL 放进执行链：优化器会怎么选路径，索引能不能帮你减少扫描，最终是卡在排序、回表、锁等待还是临时表。先用一句话压住主题，比如 ${summaryLine}，然后马上把问题锚到执行计划和数据分布。`,
      `主线部分最好围绕一条具体 SQL 或一个 EXPLAIN 结果来讲。拿“${focus}”当切口，说明 Extra、type、rows、filtered、索引顺序和 limit 位置分别意味着什么。MySQL 题一旦脱离具体证据，就很容易变成泛泛而谈；反过来，只要能把执行计划和索引路径讲顺，内容就会立刻扎实很多。`,
      `真正让线上变慢的，往往不是一个单点配置，而是多个代价叠在一起。这里适合主动补 ${pitfallPoints.slice(0, 3).join("、")} 这些风险，再说明它们在大表、深分页、冷热分布不均或长事务场景下会怎么被放大。这样读者不只知道“有 filesort/回表/锁”，还知道为什么测试环境不明显，线上却会炸。`,
      `继续深挖时，面试官一般会顺着 ${followupLine || "执行计划、锁和分页"} 往下问。你可以直接说：我会先看 EXPLAIN ANALYZE、慢日志、锁等待、事务状态、临时表和复制延迟，再决定是改索引、改 SQL、改分页方式，还是拆访问路径。MySQL 题最加分的地方，就是你知道下一步该拿什么证据。`,
      `最后收口时，把 ${topic} 讲成一次性能排查会更顺：先看到什么现象，哪条 SQL 可疑，执行计划说明了什么，为什么原来的索引或写法不够用，改完以后又看哪些指标确认确实回稳。这样文章既保留知识点，也保留了真正的使用场景。`
    ];
  }

  if (folder === "mq") {
    return [
      `${topic} 这类题如果只说“可靠”或“高吞吐”，其实信息量很低。更好的切法是先把消息链路拆成三段：生产者怎么发，Broker 怎么收，消费者怎么确认。先用一句话定住问题，比如 ${summaryLine}，然后说明这个能力到底是在保护哪一段，又把代价推给了哪一段。`,
      `主链路部分尽量按状态走，而不是按概念堆名词。围绕“${focus}”往下讲，说明消息发送后先得到谁的确认、哪一步可能重试、哪一步可能重复消费、哪一步会积压。消息队列题只要能把“哪里会丢、哪里会重、哪里会堵”这三件事讲清楚，面试官通常就觉得你不是在背百科。`,
      `真正复杂的地方在异常分支。这里可以主动补 ${pitfallPoints.slice(0, 3).join("、")} 这些风险，再解释它们和吞吐、顺序、幂等、补偿之间的关系。比如有些配置让成功率看起来更高，但会把重试风暴和下游压力一起抬起来；这种取舍不说，答案就容易显得平。`,
      `如果继续往下问，常见落点一般是 ${followupLine || "积压、重试和幂等"}。这时最好直接切到证据层：会看消费延迟、分区堆积、ISR 变化、死信量、发送失败率，还是业务侧对账。MQ 题最能体现经验的地方，就是你知道问题不只在 Broker，也可能已经传到消费端和业务表里了。`,
      `最后收口时，可以把 ${topic} 讲成一次链路治理：为什么原来同步或默认配置不够，改完之后哪一段更稳了，又付出了哪些延迟、顺序或复杂度成本。这样就不是单纯解释一个参数或机制，而是在讲一次真实的工程权衡。`
    ];
  }

  return [
    `${topic} 这种 Java 题如果只停在定义，很容易被一句“那为什么会这样”追住。比较稳的讲法是先把它放回 JDK 语义或并发语义里，先用一句话压住主题，比如 ${summaryLine}，再说明它到底在解决什么问题，或者在约束什么行为。`,
    `主线部分适合围绕“${focus}”展开，把状态变化、对象关系或线程交互讲清楚。Java 题越往后问，越不看你能不能背 API，而看你能不能把底层语义、可见性、CAS/锁、生命周期或者 JDK 实现讲成一条连续的因果链。`,
    `真正容易翻车的，往往是边界和代价。这里可以主动补 ${pitfallPoints.slice(0, 3).join("、")} 这些点，再解释它们在高并发、长生命周期对象、版本差异或错误用法下会怎样放大。这样读者不会只记住“这个东西能干嘛”，还会知道“什么时候别这么用”。`,
    `如果面试官继续追问，通常会落到 ${followupLine || "语义、版本和最小复现"} 这些方向。这时最好补一个验证视角：你会看源码方法、单测、最小复现、线程栈、JFR、日志还是压测数据。Java 并发题尤其如此，能讲出怎么证伪，可信度会高很多。`,
    `最后收口时，尽量把 ${topic} 讲成“结论 -> 机制 -> 边界 -> 代价 -> 验证”这条线。这样既保留了八股题该有的清晰度，也能把它拉到真正像工程经验的层次。`
  ];
}

function shouldRewrite(detail) {
  return (
    detail.includes("第一步是拆清问题背景。") &&
    detail.includes("第二步是讲机制。") &&
    detail.includes("第三步是补边界。") &&
    detail.includes("最后收束成一套回答节奏：先给结论，再讲机制，再补边界，最后说验证方式。")
  );
}

const files = collectMarkdownFiles(root);
let updated = 0;

for (const file of files) {
  const folder = path.relative(root, file).split(path.sep)[0];
  if (!targetFolders.has(folder)) {
    continue;
  }

  const raw = fs.readFileSync(file, "utf8");
  const parsed = matter(normalize(raw));
  const detail = extractSection(parsed.content, "详细讲解");
  if (!shouldRewrite(detail)) {
    continue;
  }

  const interview = extractSection(parsed.content, "面试回答");
  const followups = extractSection(parsed.content, "常见追问");
  const pitfalls = extractSection(parsed.content, "易错点");
  const nextDetail = buildParagraphs(
    folder,
    typeof parsed.data.title === "string" ? parsed.data.title : path.basename(file, ".md"),
    typeof parsed.data.summary === "string" ? parsed.data.summary : "",
    interview,
    followups,
    pitfalls
  ).join("\n\n");

  const nextContent = replaceSection(parsed.content, "详细讲解", nextDetail);
  const rebuilt = matter.stringify(nextContent, parsed.data, { lineWidth: 0 });
  fs.writeFileSync(file, rebuilt.replace(/\n/g, "\r\n"), "utf8");
  updated += 1;
}

console.log(JSON.stringify({ updated }, null, 2));
