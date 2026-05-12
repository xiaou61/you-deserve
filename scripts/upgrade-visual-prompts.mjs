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

function firstBullet(section) {
  const bullet = section
    .split("\n")
    .map((line) => line.trim())
    .find((line) => /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line));
  return bullet ? bullet.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "").replace(/[。！？!?]+$/u, "").trim() : "";
}

function folderName(filePath) {
  return path.relative(root, filePath).split(path.sep)[0];
}

function clean(text) {
  return text.replace(/\s+/g, " ").trim().replace(/[。！？!?]+$/u, "");
}

function buildPrompt(folder, title, interview, pitfalls) {
  const topic = clean(title);
  const focus = clean(firstBullet(interview) || topic);
  const pitfallList = pitfalls
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => clean(line.replace(/^[-*]\s+/, "")));

  const pitfall = pitfallList[0] || "补一个最容易出错的边界";

  const templates = {
    algorithm: `适合画一张流程图：先标题型约束 -> 再定核心状态或指针 -> 展开 ${focus} -> 放一个最容易错的边界样例 -> 标复杂度结论 -> 最后写反例检查。画的时候别铺太满，把状态怎么移动和哪里容易写错画清楚就够了。`,
    distributed: `适合画一张时序图：从调用方发起 -> 经过核心协调节点 -> 落到关键状态变更 -> 标出失败重试或补偿分支 -> 补上 ${pitfall} -> 最后落到监控或回滚入口。重点不是组件名越多越好，而是谁改状态、谁兜底、谁观测。`,
    engineering: `适合画一张运行流程图：先放变更入口 -> 再标核心检查点 -> 画出发布或切换动作 -> 补上异常回退分支 -> 标 ${pitfall} -> 最后放验证结果。画面尽量像一次真实上线，而不是工具名罗列。`,
    java: `适合画一张机制图：先放核心对象或状态 -> 再画线程/调用如何进入 -> 展开 ${focus} -> 补一个错误用法或边界 -> 标代价或副作用 -> 最后放验证手段。Java 题的图，最好让人一眼看出“状态怎么变”。`,
    jvm: `适合画一张运行机制图：先放内存区或执行入口 -> 再标关键对象/线程 -> 展开 ${focus} -> 补一个常见误判点 -> 标观测信号 -> 最后接排查动作。画的时候让“现象”和“底层位置”能对应起来。`,
    mq: `适合画一张消息链路图：生产者发送 -> Broker 接收 -> 副本或队列状态变化 -> 消费者确认 -> 补上 ${pitfall} -> 最后落到对账或补偿。重点要把“哪段会丢、哪段会重、哪段会堵”画出来。`,
    mybatis: `适合画一张调用链图：业务方法发起 -> Mapper/SQL 生成 -> JDBC 执行 -> 数据库返回 -> 补上 ${pitfall} -> 最后放排查入口。图里最好同时出现“最终 SQL”和“数据库行为”，这样不会悬空。`,
    mysql: `适合画一张执行路径图：SQL 输入 -> 优化器选路 -> 索引或扫描路径 -> 排序/回表/锁等待位置 -> 补上 ${pitfall} -> 最后标验证指标。别只画索引名，要把慢是怎么慢出来的画明白。`,
    network: `适合画一张请求链路图：客户端发起 -> 中间解析或建连 -> 协议层关键动作 -> 服务端处理 -> 补上 ${pitfall} -> 最后放抓包或日志验证。网络题的图最好能看出问题卡在第几层。`,
    os: `适合画一张系统行为图：请求或线程进入 -> 内核/调度关键动作 -> 资源竞争点 -> 补一个异常或退化分支 -> 标 ${pitfall} -> 最后接观察指标。画面重点是“现象和资源位置”能对上。`,
    project: `适合画一张业务闭环图：用户或上游请求进入 -> 核心规则判断 -> 状态表或队列更新 -> 补异常兜底分支 -> 标 ${pitfall} -> 最后接审计/告警/回滚。项目题的图越像一次真实业务流，复习价值越高。`,
    redis: `适合画一张缓存/数据流图：请求进入 -> 命中或落库判断 -> Redis 内部关键结构/命令 -> 补上 ${pitfall} -> 标监控指标 -> 最后接止血动作。别只画 key，最好让“热点、TTL、内存”也有位置。`
  };

  return templates[folder] ?? `适合画一张流程图：先放输入 -> 再标核心状态变化 -> 展开 ${focus} -> 补一个最容易错的边界 -> 标验证方式 -> 最后放结论。图示的关键是把主线和异常线同时交代出来。`;
}

const files = collectMarkdownFiles(root);
let updated = 0;

for (const file of files) {
  const raw = fs.readFileSync(file, "utf8");
  const parsed = matter(normalize(raw));
  const visual = extractSection(parsed.content, "图解提示");
  if (!visual || !visual.includes("->")) continue;

  const folder = folderName(file);
  const interview = extractSection(parsed.content, "面试回答");
  const pitfalls = extractSection(parsed.content, "易错点");
  const nextVisual = buildPrompt(
    folder,
    typeof parsed.data.title === "string" ? parsed.data.title : path.basename(file, ".md"),
    interview,
    pitfalls
  );

  const nextContent = replaceSection(parsed.content, "图解提示", nextVisual);
  const rebuilt = matter.stringify(nextContent, parsed.data, { lineWidth: 0 });
  fs.writeFileSync(file, rebuilt.replace(/\n/g, "\r\n"), "utf8");
  updated += 1;
}

console.log(JSON.stringify({ updated }, null, 2));
