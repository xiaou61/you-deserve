import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "content", "questions");

const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (entry.isFile() && fullPath.endsWith(".md")) {
      files.push(fullPath);
    }
  }
}

walk(root);

function normalizeLineBreaks(text) {
  return text.replace(/\r\n/g, "\n");
}

function restoreLineBreaks(text) {
  return text.replace(/\n/g, "\r\n");
}

function splitSections(content) {
  const parts = content.split(/\n(?=## )/);
  const intro = parts.shift() ?? "";
  const sections = new Map();

  for (const part of parts) {
    const match = part.match(/^## ([^\n]+)\n\n([\s\S]*)$/);
    if (!match) {
      continue;
    }

    sections.set(match[1].trim(), match[2].trim());
  }

  return { intro, sections };
}

function joinSections(intro, sections) {
  const ordered = [intro.trim()];

  for (const [heading, body] of sections.entries()) {
    ordered.push(`## ${heading}\n\n${body.trim()}`);
  }

  return `${ordered.join("\n\n")}\n`;
}

function paragraphList(body) {
  return body
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function firstSentence(text) {
  const compact = text.replace(/\s+/g, " ").trim();
  const match = compact.match(/^(.+?[。！？!?])/);
  return match ? match[1].trim() : compact;
}

function cleanFragment(text) {
  return text.trim().replace(/[。！？!?]+$/u, "");
}

function firstInterviewPoint(interview) {
  const bullet = interview
    .split("\n")
    .map((line) => line.trim())
    .find((line) => /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line));

  if (bullet) {
    return bullet.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "").trim();
  }

  return firstSentence(interview);
}

function followupTitles(body) {
  return Array.from(body.matchAll(/^###\s+(.+)$/gm)).map((match) => match[1].trim());
}

function dedupeBlankLines(text) {
  return text.replace(/\n{3,}/g, "\n\n").trim();
}

function cleanCommonBoilerplate(content) {
  return dedupeBlankLines(
    content
      .replace(
        /\n?回答时最好补一句：这个点不是孤立知识点，真正落地时要结合业务场景、数据规模和失败兜底，说明你不是只背概念。\n?/g,
        "\n"
      )
      .replace(/这道题现在要从“能背出来”修到“能接住追问”。/g, "")
      .replace(/这样能避免泛泛而谈，也能让面试官听出你知道这题的真实边界。/g, "")
      .replace(/\n\n适合画(?:结构图|流程图)：[^\n]+\s*$/g, "")
  );
}

function trimSpringRedisDetail(body, category, summary, followups) {
  const kept = paragraphList(body).filter(
    (paragraph) =>
      !paragraph.startsWith("如果把这道题讲成项目经历") &&
      !paragraph.startsWith("图解时不要只画名词列表") &&
      !paragraph.startsWith("落到线上时，还要主动补监控证据")
  );

  const followupHint =
    followups.length >= 2
      ? `像“${followups[0]}”和“${followups[1]}”这种追问，通常就是在确认你有没有把边界条件和排查抓手真的想清楚。`
      : followups.length === 1
        ? `像“${followups[0]}”这种追问，通常就是在确认你有没有把边界条件和排查抓手真的想清楚。`
        : "面试官继续深挖时，通常就是在确认你有没有把边界条件和排查抓手真的想清楚。";

  if (category === "spring") {
    kept.push(
      `如果把它放进真实项目里，面试官更在意的通常不是定义本身，而是“${cleanFragment(summary)}”这件事到底发生在请求链还是容器初始化阶段、依赖的是代理还是原始对象、出了问题会在日志、调用栈还是上下文里留下什么痕迹。回答时最好主动点出入口、顺序和生效条件，例如有没有经过 Spring 管理、是否发生了自调用、线程切换后上下文是否还在。`
    );
    kept.push(
      `再往下讲时，尽量把“怎么证明它真的生效了”也补出来，比如会看哪段启动日志、哪个过滤器或拦截器顺序、什么异常栈、哪些单测或最小复现。${followupHint} 能把这些信号讲清楚，答案就不只是“我知道这个注解”，而是“我能在项目里定位它为什么失效、为什么顺序错、为什么结果和预期不一致”。`
    );
  } else {
    kept.push(
      `如果把它放进真实流量里，真正要讲清的是“${cleanFragment(summary)}”这件事会带来什么收益，又会把风险推到哪里。比如 key 命名是否稳定、热点是否集中、TTL 和淘汰策略会不会让结果失真、客户端和服务端看到的是不是同一份状态。Redis 题只说命令远远不够，最好把读写路径、内存变化和主从/集群边界一起交代。`
    );
    kept.push(
      `再往下讲时，最好补一层验证动作：你会看哪些命令、指标或日志来证明自己的判断，比如命中率、慢日志、\`INFO\`、TTL 抽样、热点分布、错误码变化，必要时再配合压测或业务侧对账。${followupHint} 能把这些观察信号和兜底动作说出来，答案才更像线上经验，而不是只会复述 Redis 名词。`
    );
  }

  return dedupeBlankLines(kept.join("\n\n"));
}

function buildDeepDive(category, summary, interview, followups) {
  const focus = firstInterviewPoint(interview);
  const followupHint =
    followups.length >= 2
      ? `常见深挖通常会落到“${followups[0]}”和“${followups[1]}”这两类边界。`
      : followups.length === 1
        ? `常见深挖通常会落到“${followups[0]}”这类边界。`
        : "常见深挖通常会落到边界条件、失效场景和排查顺序。";

  if (category === "spring") {
    return [
      "这类 Spring 题真正拉开差距的，不是把注解或概念背全，而是把“生效时机、运行链路、失效边界”三件事讲顺。",
      `- **先说为什么会用它**：${summary}`,
      `- **再说它怎么生效**：围绕“${cleanFragment(focus)}”把入口、容器行为和上下文变化串起来。`,
      `- **最后补最容易翻车的点**：Spring 题别只停在配置名词，最好主动交代代理边界、自调用、过滤器顺序、线程切换或配置优先级。${followupHint}`
    ].join("\n");
  }

  return [
    "这类 Redis 题真正有区分度的，不是把命令名背出来，而是能讲清楚它解决什么线上矛盾、代价在哪里、出事时怎么定位。",
    `- **先说业务场景**：${summary}`,
    `- **再说核心动作**：围绕“${cleanFragment(focus)}”把 key、命令、读写链路和状态变化讲明白。`,
    `- **最后补风险和边界**：Redis 题最好主动说明热点、TTL、内存、主从一致性、限流降级或集群迁移这些现实约束。${followupHint}`
  ].join("\n");
}

function buildPractical(category, title) {
  if (category === "spring") {
    return [
      "- **先看哪里**：先确认入口是否真的走到了预期链路，再查过滤器/拦截器顺序、代理是否生效、配置是否被覆盖。",
      "- **用什么证据验证**：优先看启动日志、条件装配报告、请求日志、异常栈、线程切换点，以及必要的单测或最小复现。",
      "- **排查时怎么收口**：把问题归类成“容器没接管、代理没命中、上下文丢了、配置顺序错了”这几类，再逐项排除。",
      `- **面试里怎么落地**：把《${title}》讲成一次真实排障或设计取舍，效果会比单纯复述定义更稳。`
    ].join("\n");
  }

  return [
    "- **先查什么命令和指标**：优先看 key 设计、TTL、命中率、慢日志、`INFO` 指标、热点分布和错误返回。",
    "- **怎么验证推断对不对**：用抽样读写、压测、业务日志和告警曲线确认问题是否真的发生在缓存层，而不是下游数据库或客户端。",
    "- **线上怎么兜底**：准备限流、降级、旁路读、延迟重试、热点隔离或预热回补，避免问题从缓存层扩散到主链路。",
    `- **面试里怎么落地**：把《${title}》讲成“现象 -> 判断 -> 动作 -> 指标回稳”的闭环，会更像做过线上系统的人。`
  ].join("\n");
}

function buildAnswerTemplate(category, summary) {
  if (category === "spring") {
    return [
      "面试时可以按 4 句讲完：",
      "",
      `1. **先给结论**：${summary}`,
      "2. **再讲链路**：它在 Spring 容器或请求链里什么时候触发，核心对象或上下文怎么变化。",
      "3. **补充边界**：哪些情况下会失效、顺序不对、代理不生效，或者因为线程切换导致结果和预期不一致。",
      "4. **落到排查**：最后补一句你会看哪些日志、配置或测试去验证。"
    ].join("\n");
  }

  return [
    "面试时可以按 4 句讲完：",
    "",
    `1. **先给结论**：${summary}`,
    "2. **再讲机制**：核心命令、数据结构或读写路径是怎么工作的。",
    "3. **补充风险**：热点、过期、一致性、内存、主从或集群边界分别会怎么影响结果。",
    "4. **落到实战**：最后补一句你会看哪些指标、日志或命令来验证。"
  ].join("\n");
}

let updatedFiles = 0;
let springRedisRewrites = 0;

for (const file of files) {
  const original = fs.readFileSync(file, "utf8");
  let content = normalizeLineBreaks(original);
  const cleaned = cleanCommonBoilerplate(content);
  let next = cleaned;

  if (file.includes(`${path.sep}spring${path.sep}`) || file.includes(`${path.sep}redis${path.sep}`)) {
    const category = file.includes(`${path.sep}spring${path.sep}`) ? "spring" : "redis";
    const { intro, sections } = splitSections(cleaned);

    if (!sections.has("深挖理解") || !sections.has("实战落地") || !sections.has("回答模板")) {
      next = cleaned;
    } else {
    const summaryMatch = intro.match(/summary:\s*"([^"]+)"/);
    const summary = summaryMatch ? summaryMatch[1].trim() : "";
    const titleMatch = intro.match(/title:\s*"([^"]+)"/);
    const title = titleMatch ? titleMatch[1].trim() : path.basename(file, ".md");
    const interview = sections.get("面试回答") ?? "";
    const followups = followupTitles(sections.get("常见追问") ?? "");

    if (sections.has("详细讲解")) {
      sections.set(
        "详细讲解",
        trimSpringRedisDetail(sections.get("详细讲解") ?? "", category, summary, followups)
      );
    }

    if (sections.has("深挖理解")) {
      sections.set("深挖理解", buildDeepDive(category, summary, interview, followups));
    }

    if (sections.has("实战落地")) {
      sections.set("实战落地", buildPractical(category, title));
    }

    if (sections.has("回答模板")) {
      sections.set("回答模板", buildAnswerTemplate(category, summary));
    }

    next = joinSections(intro, sections);
    springRedisRewrites += 1;
    }
  }

  next = dedupeBlankLines(next);

  if (next !== normalizeLineBreaks(original).trim()) {
    fs.writeFileSync(file, restoreLineBreaks(`${next}\n`), "utf8");
    updatedFiles += 1;
  }
}

console.log(
  JSON.stringify(
    {
      updatedFiles,
      springRedisRewrites
    },
    null,
    2
  )
);
