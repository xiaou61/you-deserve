import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = path.join(process.cwd(), "content", "questions");
const folders = new Set(["redis", "spring"]);
const sectionsToDelete = ["深挖理解", "实战落地", "追问准备", "回答模板"];

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

function deleteSection(content, title) {
  return normalize(content).replace(
    new RegExp(`(?:^|\\n)## ${title}\\n+[\\s\\S]*?(?=\\n## |$)`, "g"),
    ""
  );
}

function firstSentence(text) {
  const compact = text.replace(/\s+/g, " ").trim();
  const match = compact.match(/^(.+?[。！？!?])/);
  return (match ? match[1] : compact).replace(/[。！？!?]+$/u, "").trim();
}

function bullets(section) {
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "").replace(/[。！？!?]+$/u, "").trim());
}

function followupTitles(section) {
  return Array.from(section.matchAll(/^###\s+(.+)$/gm)).map((m) => m[1].trim());
}

function folderName(filePath) {
  return path.relative(root, filePath).split(path.sep)[0];
}

function buildRedisDetail(title, summary, interview, followups, pitfalls) {
  const topic = title.replace(/[？?]+$/u, "").trim();
  const summaryLine = firstSentence(summary || title);
  const interviewPoints = bullets(interview);
  const pitfallPoints = bullets(pitfalls);
  const followupsList = followupTitles(followups);
  const focus = interviewPoints[0] || summaryLine;
  const pitfall = pitfallPoints[0] || "边界条件和一致性风险";
  const followupA = followupsList[0] || "它在高并发下会不会失效";
  const followupB = followupsList[1] || "出了问题先看什么";

  return [
    `${topic} 这类题如果只背命令或数据结构名字，面试官一般两句就能把答案追空。更稳的讲法是先把它放回真实请求链里：请求从哪里进来，Redis 在中间承担什么职责，命中以后省掉了什么成本，失效以后又会把压力推给谁。先用一句话压住主题，比如 ${summaryLine}，然后马上往读写路径和状态变化上落。`,
    `主线部分要尽量讲成“数据怎么流动”，而不是“组件会什么”。可以围绕“${focus}”往下展开，说明 key 是怎么设计的，命令是在什么时机发出的，客户端和服务端各自看到了什么状态，哪些结果是即时生效，哪些又要依赖复制、淘汰、TTL 或集群路由。Redis 题只要能把这条路径讲清楚，内容就已经比单纯背 API 厚很多。`,
    `真正容易翻车的地方通常不在 happy path，而在边界被放大以后。这里最好主动把 ${pitfall} 这类风险摆出来，再补一句它在线上会表现成什么现象，比如热点打满单核、TTL 抖动、主从短暂不一致、锁误删、缓存穿透后数据库被打穿，或者集群迁移时客户端不断重试。读者复习时最有价值的，往往就是这些“会怎么坏”的细节。`,
    `继续深挖时，问题通常会落到“${followupA}”和“${followupB}”这两个方向上。这时不要只说“看监控”，而是直接讲证据：会看哪些 key 模式、TTL 分布、命中率、慢日志、错误码、主从延迟、slot 迁移状态、客户端重试次数，必要时再配合业务日志和对账结果。能把观察信号说清楚，才像真的排过线上问题。`,
    `Redis 题还有一个很值钱的层次，是把取舍说出来。很多方案不是“能不能做”，而是“这样做会把复杂度和风险转移到哪里”。比如为了换吞吐量牺牲一部分一致性，或者为了更低延迟接受一段时间的数据不新鲜；再比如为了省一次数据库访问，引入了更复杂的过期、补偿或旁路读逻辑。把这些取舍讲出来，答案就从知识点变成工程判断。`,
    `${topic} 真正像项目经验的讲法，通常是“现象 -> 判断 -> 动作 -> 指标回稳”。先说你在什么症状下会怀疑它，再说如何缩小到缓存层，接着说明最小止血动作是什么，例如隔离热点、降级旁路、限流、延迟重试、预热回补或人工修复，最后补一句靠哪些指标判断问题真的被收住。这样读者拿去答项目追问时会更顺手。`,
    `最后收口时，不要把 ${topic} 讲成孤立的 Redis 技巧，而要把它放回整个系统：它解决了什么矛盾，最怕哪类边界，验证抓手是什么，替代方案为什么没选。只要这四件事讲顺，面试官基本就能判断你不是只会背名词，而是知道它在系统里到底怎么活。`
  ].join("\n\n");
}

function buildSpringDetail(title, summary, interview, followups, pitfalls) {
  const topic = title.replace(/[？?]+$/u, "").trim();
  const summaryLine = firstSentence(summary || title);
  const interviewPoints = bullets(interview);
  const pitfallPoints = bullets(pitfalls);
  const followupsList = followupTitles(followups);
  const focus = interviewPoints[0] || summaryLine;
  const pitfall = pitfallPoints[0] || "代理边界和调用顺序";
  const followupA = followupsList[0] || "它什么时候会失效";
  const followupB = followupsList[1] || "线上该怎么定位";

  return [
    `${topic} 这类 Spring 题最怕停在定义和注解名字上，因为面试官真正想听的通常不是“它是什么”，而是“它在容器或请求链里什么时候生效，失败时会留下什么痕迹”。先用一句话把主题压住，比如 ${summaryLine}，然后马上切到入口、代理、上下文或生命周期，答案就会更像工程视角。`,
    `主线部分最好按运行链路讲。围绕“${focus}”往下展开，说明调用是如何进入 Spring 管理对象的，核心代理或容器回调在哪一层介入，状态是在当前线程里传递、挂起还是切换，最后业务方法真正执行时拿到的是原始对象、代理对象还是某种包装后的上下文。Spring 题一旦讲出这条链，就不容易虚。`,
    `最常见的坑往往出在边界条件，而不是注解本身。这里适合主动补 ${pitfall} 这类问题，再把它们翻译成具体故障现象：为什么自调用让事务或切面失效，为什么 final/private 方法增强不到，为什么顺序一变日志、权限和事务行为就变了，为什么线程切换以后上下文拿不到，或者为什么 Bean 根本没交给 Spring 管理。这样读者就会知道“它是怎么坏的”。`,
    `继续深挖时，问题一般会落到“${followupA}”和“${followupB}”这些方向。比较好的答法不是泛泛地说“看日志”，而是直接点出证据：会看 Bean 实际类型、代理类名、启动日志、条件装配报告、异常栈、拦截器顺序、事务边界日志、最小复现单测，必要时再用断点或线程栈确认调用到底有没有经过代理。排查抓手越具体，内容越可信。`,
    `Spring 题还有一个经常被忽略的层次，是取舍。很多机制的价值并不只是“能不能用”，而是“用它以后可维护性、排查成本和运行时复杂度怎么变”。例如把稳定的横切逻辑抽到 AOP 里很合适，但把核心业务分支塞进切面就会让调用路径变隐蔽；再比如事务传播行为能让边界更清晰，也可能把连接池压力和回滚语义变复杂。把这些代价讲出来，会比只报术语更像真实判断。`,
    `如果把 ${topic} 放进真实项目里，更像人的讲法通常是“症状 -> 怀疑点 -> 证据 -> 修复动作 -> 回归验证”。先说你看到什么现象会怀疑是容器、代理或事务边界出了问题，再说怎么一步步缩小范围，接着说明修复是改注入方式、改调用路径、改顺序、补代理入口还是补最小复现，最后再补一句看哪些日志或测试确认它真的恢复正常。这样读者拿去答项目追问时会很顺。`,
    `最后收口时，尽量把 ${topic} 讲成一条完整的因果链：它为什么存在，运行时靠什么生效，最常见的失效边界是什么，你会拿什么证据验证，为什么不选别的实现方式。只要这几层讲清楚，Spring 题就不再像背框架名词，而会更像一个熟悉线上系统的人在讲经验。`
  ].join("\n\n");
}

const files = collectMarkdownFiles(root);
let updated = 0;

for (const file of files) {
  const folder = folderName(file);
  if (!folders.has(folder)) continue;

  const raw = fs.readFileSync(file, "utf8");
  const parsed = matter(normalize(raw));
  const interview = extractSection(parsed.content, "面试回答");
  const followups = extractSection(parsed.content, "常见追问");
  const pitfalls = extractSection(parsed.content, "易错点");
  const title = typeof parsed.data.title === "string" ? parsed.data.title : path.basename(file, ".md");
  const summary = typeof parsed.data.summary === "string" ? parsed.data.summary : "";

  const nextDetail =
    folder === "redis"
      ? buildRedisDetail(title, summary, interview, followups, pitfalls)
      : buildSpringDetail(title, summary, interview, followups, pitfalls);

  let nextContent = replaceSection(parsed.content, "详细讲解", nextDetail);
  for (const section of sectionsToDelete) {
    nextContent = deleteSection(nextContent, section);
  }
  const rebuilt = matter.stringify(nextContent.trim() + "\n", parsed.data, { lineWidth: 0 });
  fs.writeFileSync(file, rebuilt.replace(/\n/g, "\r\n"), "utf8");
  updated += 1;
}

console.log(JSON.stringify({ updated }, null, 2));
