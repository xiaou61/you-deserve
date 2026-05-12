import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = path.join(process.cwd(), "content", "questions");
const folders = new Set(["redis", "spring"]);

function collectMarkdownFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectMarkdownFiles(fullPath));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(fullPath);
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

function folderName(filePath) {
  return path.relative(root, filePath).split(path.sep)[0];
}

function clean(text) {
  return text.replace(/\s+/g, " ").trim().replace(/[。！？!?]+$/u, "");
}

function bullets(section) {
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line))
    .map((line) => clean(line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "")));
}

function followupTitles(section) {
  return Array.from(section.matchAll(/^###\s+(.+)$/gm)).map((m) => clean(m[1]));
}

function choose(items, fallback, index = 0) {
  return items[index] || items[0] || fallback;
}

function buildRedisVisual(title, interview, followups, pitfalls) {
  const topic = clean(title);
  const points = bullets(interview);
  const risks = bullets(pitfalls);
  const qs = followupTitles(followups);
  const step1 = choose(points, "请求进入 Redis");
  const step2 = choose(points.slice(1), "核心命令执行");
  const risk = choose(risks, "最容易翻车的边界");
  const q = choose(qs, "线上先看什么");

  const lower = topic.toLowerCase();
  if (lower.includes("锁")) {
    return `适合画一张时序图：客户端尝试加锁 -> Redis 执行 ${step1} -> 业务线程持锁执行业务 -> 释放时用 Lua 校验 token -> 补上 ${risk} -> 最后标 ${q} 对应的日志和指标。这样画能把“谁拿锁、谁删锁、哪里会误删”一眼看清。`;
  }
  if (lower.includes("故障转移") || lower.includes("failover")) {
    return `适合画一张集群故障转移图：主节点失联 -> 其他节点先标记 PFAIL -> 多数派形成 FAIL 共识 -> 从节点发起选举并提升为新主 -> 客户端刷新路由 -> 最后补上 ${risk}。重点把“判故障、选主、改路由”三段分开画。`;
  }
  if (lower.includes("cluster") || lower.includes("slot") || lower.includes("moved") || lower.includes("ask")) {
    return `适合画一张集群路由图：客户端按 slot 找节点 -> Redis 执行 ${step1} -> 返回 MOVED/ASK 或命中新节点 -> 客户端更新本地路由 -> 补上 ${risk} -> 最后标 ${q} 相关指标。画面最好能看出 slot、节点和客户端缓存三者关系。`;
  }
  if (lower.includes("stream") || lower.includes("pubsub")) {
    return `适合画一张消息流图：生产端写入 -> Redis 内部保存 ${step1} -> 消费端读取或确认 -> 积压/重试在什么位置出现 -> 补上 ${risk} -> 最后标 ${q}。重点不是命令全列，而是消息在哪一段可能堆住。`;
  }
  if (lower.includes("cache") || lower.includes("缓存") || lower.includes("热点") || lower.includes("穿透") || lower.includes("击穿") || lower.includes("雪崩")) {
    return `适合画一张缓存访问图：请求先查缓存 -> 未命中时回源数据库 -> 回填或删缓存发生在何处 -> 热点/并发放大问题出现在哪一步 -> 补上 ${risk} -> 最后标 ${q}。这样画最容易讲清楚“为什么数据库会突然被打穿”。`;
  }
  return `适合画一张 Redis 数据流图：请求进入 -> 执行 ${step1} -> 再经过 ${step2} -> 状态写回或返回客户端 -> 补上 ${risk} -> 最后标 ${q} 对应的观测点。画的时候让“命令、状态、风险”三件事能一一对应。`;
}

function buildSpringVisual(title, interview, followups, pitfalls) {
  const topic = clean(title);
  const points = bullets(interview);
  const risks = bullets(pitfalls);
  const qs = followupTitles(followups);
  const step1 = choose(points, "请求进入 Spring 容器");
  const step2 = choose(points.slice(1), "代理或上下文介入");
  const risk = choose(risks, "最容易失效的边界");
  const q = choose(qs, "怎么验证它真的生效");

  const lower = topic.toLowerCase();
  if (lower.includes("aop") || lower.includes("代理") || lower.includes("切面")) {
    return `适合画一张代理调用图：调用方进入 Bean -> 代理先拦截 -> 执行 ${step1} 对应的增强逻辑 -> 再进入目标方法 -> 补上 ${risk} -> 最后标 ${q} 时会看的日志或代理类名。重点把“代理对象”和“目标对象”分成两层。`;
  }
  if (lower.includes("事务")) {
    return `适合画一张事务边界图：外层方法进入代理 -> 判断当前线程是否已有事务 -> 按 ${step1} 决定加入/挂起/新建 -> 内层方法抛异常或提交 -> 补上 ${risk} -> 最后标 ${q} 对应的事务日志。这样画最容易把传播行为和回滚语义讲清楚。`;
  }
  if (lower.includes("bean") || lower.includes("autowired") || lower.includes("resource") || lower.includes("factorybean")) {
    return `适合画一张容器生命周期图：Spring 扫描或注册 Bean -> 执行 ${step1} -> 完成依赖注入和初始化 -> 什么时候暴露给业务使用 -> 补上 ${risk} -> 最后标 ${q} 会看的启动日志或 Bean 类型。画面最好能看出“容器接管前后”的区别。`;
  }
  if (lower.includes("mvc") || lower.includes("argument") || lower.includes("converter") || lower.includes("filter") || lower.includes("interceptor") || lower.includes("webflux") || lower.includes("webclient")) {
    return `适合画一张请求处理链图：请求进入框架入口 -> 经过 ${step1} -> 再经过 ${step2} -> 控制器或响应阶段返回 -> 补上 ${risk} -> 最后标 ${q} 对应的顺序和日志。把过滤器、拦截器、控制器三段拆开画会更清楚。`;
  }
  if (lower.includes("boot") || lower.includes("starter") || lower.includes("conditional") || lower.includes("profiles") || lower.includes("configuration")) {
    return `适合画一张自动装配图：应用启动 -> 条件判断 ${step1} -> 创建或跳过配置类 -> Bean 注册到容器 -> 补上 ${risk} -> 最后标 ${q} 会看的条件装配报告。重点不是类名堆满，而是“为什么它会生效/不生效”。`;
  }
  return `适合画一张 Spring 运行链图：入口进入容器 -> 执行 ${step1} -> 再经过 ${step2} -> 最终落到业务方法或 Bean 生命周期节点 -> 补上 ${risk} -> 最后标 ${q} 对应的验证证据。画的时候让“入口、容器、边界”三层关系清楚就够了。`;
}

const files = collectMarkdownFiles(root);
let updated = 0;

for (const file of files) {
  const folder = folderName(file);
  if (!folders.has(folder)) continue;

  const raw = fs.readFileSync(file, "utf8");
  const parsed = matter(normalize(raw));
  const title = typeof parsed.data.title === "string" ? parsed.data.title : path.basename(file, ".md");
  const interview = extractSection(parsed.content, "面试回答");
  const followups = extractSection(parsed.content, "常见追问");
  const pitfalls = extractSection(parsed.content, "易错点");

  const nextVisual =
    folder === "redis"
      ? buildRedisVisual(title, interview, followups, pitfalls)
      : buildSpringVisual(title, interview, followups, pitfalls);

  const nextContent = replaceSection(parsed.content, "图解提示", nextVisual);
  const rebuilt = matter.stringify(nextContent, parsed.data, { lineWidth: 0 });
  fs.writeFileSync(file, rebuilt.replace(/\n/g, "\r\n"), "utf8");
  updated += 1;
}

console.log(JSON.stringify({ updated }, null, 2));
