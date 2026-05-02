import fs from "node:fs";
import path from "node:path";

const questionRoot = path.join(process.cwd(), "content", "questions");

const categoryProfiles = [
  {
    test: /Java|JVM|Spring|MyBatis/,
    focus: "对象模型、运行时行为、边界条件和框架默认行为",
    practice: "结合真实业务代码说明什么时候会踩坑、怎么定位、怎么替换方案",
    risk: "不要只背概念名词，要能说出触发条件、底层机制和排查入口"
  },
  {
    test: /MySQL|Redis/,
    focus: "数据结构、读写路径、一致性边界和性能影响",
    practice: "把答案落到慢查询、热点 key、事务隔离、缓存一致性或容量评估上",
    risk: "不要把数据库或缓存讲成万能组件，要说明适用范围和兜底手段"
  },
  {
    test: /MQ|分布式/,
    focus: "链路状态、失败重试、幂等、顺序和最终一致性",
    practice: "按生产链路讲清楚请求进入、状态推进、异常补偿和监控告警",
    risk: "不要只说引入中间件，要说明消息丢失、重复、乱序和积压如何处理"
  },
  {
    test: /网络|操作系统/,
    focus: "协议状态、内核资源、时序变化和故障表现",
    practice: "用抓包、日志、指标或系统命令把理论和排查动作连起来",
    risk: "不要只背定义，要说出一次真实请求或一次系统调用如何经过这些环节"
  },
  {
    test: /项目|工程/,
    focus: "业务目标、容量边界、数据一致性、灰度降级和可观测性",
    practice: "按需求约束、核心链路、异常分支、上线验证来组织回答",
    risk: "不要只画架构图，要把风险、取舍、回滚和监控讲完整"
  },
  {
    test: /算法/,
    focus: "问题抽象、状态定义、复杂度和边界样例",
    practice: "先说识别信号，再说模板步骤，最后补充容易写错的边界",
    risk: "不要直接背模板，要解释为什么这个模板适合当前问题"
  }
];

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
  const quoted = raw.match(new RegExp(`^${key}:\\s+"([^"]*)"`, "m"));
  if (quoted) return quoted[1];

  const bare = raw.match(new RegExp(`^${key}:\\s+([^\\n]+)`, "m"));
  return bare?.[1]?.trim() ?? "";
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
    .replace(/\s+/g, " ")
    .trim();
}

function firstSentence(text, fallback) {
  const clean = cleanText(text);
  const sentence = clean.split(/[。！？!?]/).map((item) => item.trim()).find(Boolean);
  return sentence || fallback;
}

function getProfile(category) {
  return categoryProfiles.find((profile) => profile.test.test(category)) ?? {
    focus: "核心概念、运行机制、适用边界和常见误区",
    practice: "结合生产问题说明如何使用、如何验证、如何兜底",
    risk: "不要停留在定义，要把原因、过程、影响和解决方案串起来"
  };
}

function inferDiagramType(title, category, tags) {
  const joined = `${title} ${category} ${tags.join(" ")}`;

  if (/区别|对比| vs |VS|分别|有什么不同/.test(joined)) return "对比图";
  if (/登录|握手|事务消息|消息表|分布式锁|RPC|调用|同步|复制|发送|消费|Read View|MVCC/.test(joined)) return "时序图";
  if (/项目设计|系统|权限|上传|搜索|订单|库存|秒杀|优惠券|评论|通知|网关|限流/.test(joined)) return "场景图";
  if (/流程|过程|怎么做|怎么排查|怎么设计|为什么需要|如何|生命周期|执行顺序|加载/.test(joined)) return "流程图";
  return "结构图";
}

function extractAnswerPoints(raw) {
  const answer = section(raw, "面试回答");
  const bullets = answer
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line))
    .map((line) => cleanText(line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "")))
    .filter((line) => line.length >= 2);

  if (bullets.length >= 3) {
    return bullets.slice(0, 6);
  }

  return cleanText(answer)
    .split(/[。；;]/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 6)
    .slice(0, 6);
}

function compactPoint(text) {
  const clean = cleanText(text)
    .replace(/^可以从[^：:]*[：:]/, "")
    .replace(/^先/, "")
    .replace(/^再/, "")
    .replace(/^最后/, "");
  const first = clean.split(/[。；;，,：:]/).map((item) => item.trim()).find(Boolean) ?? clean;

  if (first.length <= 18) {
    return first;
  }

  const splitAt = first.search(/[、/和或与]/);
  if (splitAt >= 6 && splitAt <= 18) {
    return first.slice(0, splitAt).trim();
  }

  return `${first.slice(0, 18).trim()}…`;
}

function makeVisualHint({ title, category, tags, summary, raw }) {
  const diagram = inferDiagramType(title, category, tags);
  const points = extractAnswerPoints(raw);
  const fallbackNodes = [
    "背景问题",
    "核心机制",
    "关键风险",
    "解决方案",
    "面试落点"
  ];
  const nodes = (points.length >= 3 ? points : fallbackNodes).slice(0, 5).map(compactPoint);

  return `适合画一张${diagram}：${title.replace(/[？?]$/g, "")}。核心节点：${nodes.join(" -> ")}。画面重点突出“问题从哪里来、机制如何工作、风险在哪里、怎么落到实践”。补充一句背景：${summary}。`;
}

function makeDeepDive({ title, category, summary, raw }) {
  const profile = getProfile(category);
  const conclusion = firstSentence(section(raw, "一句话结论"), summary);
  const answerPoints = extractAnswerPoints(raw);
  const primary = answerPoints[0] ?? conclusion;
  const secondary = answerPoints[1] ?? summary;
  const tertiary = answerPoints[2] ?? profile.risk;

  return `## 深挖理解

这道题不要只停在“是什么”。面试官真正想确认的是：你能不能把 ${title.replace(/[？?]$/g, "")} 放回真实系统里，讲清楚它为什么出现、解决什么问题、代价是什么。可以先用一句话定调：${conclusion}

拆开来看，第一层是背景问题：${summary} 如果只背结论，很容易在追问里断掉；更稳的方式是先说明问题发生的场景，再解释机制为什么能缓解这个问题。

第二层是核心机制：${primary} 这里要尽量把动作讲成链路，而不是罗列名词。比如谁先发生、谁依赖谁、哪个状态会改变、失败时会留下什么痕迹。

第三层是边界和取舍：${secondary} 它通常不是银弹，真正的面试加分点是能主动说出适用范围、性能影响、复杂度和替代方案。

最后落到风险意识：${tertiary} ${profile.risk}。这样回答会比单纯背八股更像做过项目的人。`;
}

function makePractice({ title, category, tags }) {
  const profile = getProfile(category);
  const tagText = tags.length ? tags.join("、") : category;
  const normalizedTitle = title.replace(/[？?]$/g, "");

  if (/算法/.test(category)) {
    return `## 实战落地

- **什么时候会遇到**：看到 ${tagText} 相关题目时，先识别输入规模、是否有序、是否需要去重、是否存在重复子问题，再决定用哪类模板。
- **怎么做方案**：先说暴力解法，再给出优化方向。围绕“状态定义、转移关系、数据结构、边界样例、复杂度”五个点组织，避免一上来就写代码。
- **怎么验证效果**：至少准备空输入、单元素、重复元素、极大值、边界窗口或无解场景。能主动讲测试样例，面试官会更相信你不是背模板。
- **怎么兜底**：如果最优解一时想不到，先交代可运行方案和复杂度，再逐步优化到更好的时间或空间复杂度。`;
  }

  if (/Java|JVM|Spring|MyBatis/.test(category)) {
    return `## 实战落地

- **什么时候会遇到**：当业务代码出现 ${tagText} 相关的并发异常、性能抖动、配置不生效、对象行为和预期不一致时，就可以用这道题定位原因。
- **怎么做方案**：先看触发条件，再看运行时机制。围绕“调用入口、对象状态、线程边界、框架代理、异常日志”五个位置检查，判断 ${normalizedTitle} 是设计问题、用法问题还是环境问题。
- **怎么验证效果**：用单元测试、压测、日志、线程栈、JFR/GC 日志或本地最小复现确认。${profile.practice}。
- **怎么兜底**：准备替代 API、隔离开关、降级策略、配置回滚和监控告警。面试里能讲出兜底，说明你不是只会写 happy path。`;
  }

  if (/MySQL|Redis/.test(category)) {
    return `## 实战落地

- **什么时候会遇到**：当业务里出现 ${tagText} 相关的慢查询、锁等待、热点 key、缓存不一致、内存上涨或写入抖动时，就要把这道题放到读写链路里分析。
- **怎么做方案**：先明确数据规模和访问模式，再选择索引、事务、缓存、过期策略或分片策略。围绕“读路径、写路径、并发控制、失败补偿、容量上限”五个点展开。
- **怎么验证效果**：看 explain、慢日志、锁等待、命中率、内存、QPS、P99 延迟和错误率。${profile.practice}。
- **怎么兜底**：准备降级读、限流、重建索引、缓存预热、补偿任务或数据修复脚本，避免单点方案拖垮主链路。`;
  }

  if (/MQ|分布式/.test(category)) {
    return `## 实战落地

- **什么时候会遇到**：当链路里出现 ${tagText} 相关的超时、重复、丢失、乱序、积压或状态不一致时，这道题就是排查入口。
- **怎么做方案**：按“生产者 -> Broker/注册中心 -> 消费者 -> 数据库 -> 补偿任务”拆链路，明确每一步的状态、重试和幂等键。
- **怎么验证效果**：看消息堆积、消费延迟、重试次数、死信数量、接口超时、TraceId 链路和最终数据状态。${profile.practice}。
- **怎么兜底**：准备幂等表、去重键、补偿任务、死信处理、限流降级和人工重放工具，保证失败可见、可追踪、可恢复。`;
  }

  if (/网络|操作系统/.test(category)) {
    return `## 实战落地

- **什么时候会遇到**：当线上出现 ${tagText} 相关的连接慢、请求超时、CPU 飙高、内存异常、文件句柄耗尽或网络抖动时，就可以从这道题切入。
- **怎么做方案**：按“客户端现象 -> 服务端日志 -> 系统指标 -> 协议状态 -> 内核资源”推进，先定位层次，再决定是代码、配置还是基础设施问题。
- **怎么验证效果**：用日志、抓包、连接状态、系统命令、监控指标和最小复现交叉验证。${profile.practice}。
- **怎么兜底**：准备超时配置、限流、连接池隔离、熔断、扩容或回滚方案，避免排查期间影响继续扩大。`;
  }

  if (/项目|工程/.test(category)) {
    return `## 实战落地

- **什么时候会遇到**：当你要把 ${tagText} 相关能力做成真实系统，而不是只写一个 demo 时，就要回答容量、权限、一致性、降级和可观测性。
- **怎么做方案**：先明确业务目标和约束，再拆“入口流量、核心服务、数据模型、异步任务、异常补偿、监控告警、发布回滚”。
- **怎么验证效果**：不要只看功能能不能跑通，还要做压测、灰度、告警演练、失败注入和数据核对。${profile.practice}。
- **怎么兜底**：准备开关、限流、降级、补偿任务、人工审核、数据修复脚本和回滚预案。项目题能讲出这些，可信度会明显更高。`;
  }

  return `## 实战落地

- **什么时候会遇到**：当业务里出现 ${tagText} 相关的性能、并发、一致性或可维护性问题时，就可以把这道题里的知识点拿出来判断。不要等线上出故障才想概念，设计阶段就要先问容量、失败分支和边界条件。
- **怎么做方案**：先明确目标，再拆链路。围绕“输入条件、核心处理、状态变化、异常分支、观测告警”五个位置检查一遍，判断 ${normalizedTitle} 应该放在哪个环节解决问题。
- **怎么验证效果**：不要只看功能能不能跑通，还要看压测指标、错误日志、慢操作、重试次数、队列积压、锁等待或资源占用等信号。${profile.practice}。
- **怎么兜底**：准备降级、限流、重试、补偿任务、人工修复脚本或回滚策略。面试里能讲出兜底，说明你不是只会写 happy path。`;
}

function makeFollowUp({ title, category }) {
  const profile = getProfile(category);

  return `## 追问准备

- **如果数据量或并发量扩大 10 倍怎么办？** 先回答瓶颈会出现在哪里，再说扩容、分片、缓存、异步化或限流策略，最后补一句监控指标怎么验证。
- **如果它失败了会有什么表现？** 从用户现象、服务日志、核心指标、数据状态四个角度描述。能说出失败表现，就能自然过渡到排查方案。
- **和相近方案怎么选？** 不要直接说“看场景”，要给出判断维度：一致性要求、延迟要求、吞吐量、实现复杂度、团队维护成本和故障恢复成本。
- **你在项目里会怎么讲？** 用“背景 -> 方案 -> 取舍 -> 验证 -> 复盘”的顺序，把 ${title.replace(/[？?]$/g, "")} 讲成一次工程决策，而不是一个孤立知识点。重点围绕 ${profile.focus}。`;
}

function makeTemplate({ summary }) {
  return `## 回答模板

面试时可以按这个节奏组织：

1. **先给结论**：${summary}
2. **再讲机制**：它的核心不是某个名词，而是一组处理链路。把关键角色、状态变化和触发条件说清楚。
3. **补充边界**：说明什么情况下有效，什么情况下会失效，以及为什么需要配套措施。
4. **落到项目**：如果我在项目里遇到，会先看指标和日志定位问题，再用灰度、压测和回滚策略验证方案。
5. **收一句风险**：真正重要的是不要只让功能跑通，还要保证高并发、异常分支和数据状态都可控。`;
}

function enrichmentBlock(raw) {
  const title = frontmatterValue(raw, "title");
  const category = frontmatterValue(raw, "category");
  const summary = frontmatterValue(raw, "summary");
  const tags = frontmatterArray(raw, "tags");

  return [
    makeDeepDive({ title, category, summary, raw }),
    makePractice({ title, category, tags, summary }),
    makeFollowUp({ title, category }),
    makeTemplate({ title, summary }),
    `## 图解提示\n\n${makeVisualHint({ title, category, tags, summary, raw })}`
  ].join("\n\n");
}

function insertBeforeMemoryHook(raw, block) {
  if (!block) {
    return raw;
  }

  const marker = "\n## 记忆钩子";
  const index = raw.indexOf(marker);

  if (index === -1) {
    return `${raw.trimEnd()}\n\n${block}\n`;
  }

  const deepDiveMarker = "\n## 深挖理解";
  const deepDiveIndex = raw.indexOf(deepDiveMarker);

  if (deepDiveIndex !== -1 && deepDiveIndex < index) {
    return `${raw.slice(0, deepDiveIndex).trimEnd()}\n\n${block}\n${raw.slice(index)}`;
  }

  return `${raw.slice(0, index).trimEnd()}\n\n${block}\n${raw.slice(index)}`;
}

let changed = 0;
let skipped = 0;

for (const file of walk(questionRoot)) {
  const raw = fs.readFileSync(file, "utf8");
  const block = enrichmentBlock(raw);

  if (!block) {
    skipped += 1;
    continue;
  }

  fs.writeFileSync(file, insertBeforeMemoryHook(raw, block), "utf8");
  changed += 1;
}

console.log(`questions_changed=${changed}`);
console.log(`questions_skipped=${skipped}`);
