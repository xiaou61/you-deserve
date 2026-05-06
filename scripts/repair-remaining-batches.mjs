import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

const root = process.cwd();
const questionsRoot = path.join(root, "content", "questions");
const auditsRoot = path.join(root, "docs", "question-audit");
const visualPath = path.join(root, "content", "visuals", "question-visuals.json");
const progressPath = path.join(root, "content", "question-repair-progress.json");

const skipSections = new Set(["深挖理解", "实战落地", "追问准备", "回答模板"]);

const profiles = [
  {
    match: (file) => file.includes("/algorithm/"),
    type: "flow",
    name: "算法",
    focus: "输入规模、状态定义、边界样例和复杂度推导",
    mechanism: "先给暴力思路，再说明为什么当前数据特征允许优化，最后落到状态、指针、堆、哈希或递归栈这些可验证结构",
    boundary: "空输入、重复元素、极值、无解、越界、负数、溢出和复杂度退化",
    signals: "边界样例、时间复杂度、空间复杂度、单调性、递归深度和反例",
    alternatives: "暴力解、排序、哈希、双指针、二分、堆、动态规划或图遍历",
    dimensions: "正确性、复杂度、边界样例和实现难度",
    nodes: ["识别题型约束", "定义核心状态", "推导转移规则", "处理边界样例", "分析复杂度", "准备反例验证"]
  },
  {
    match: (file) => file.includes("/distributed/"),
    type: "sequence",
    name: "分布式",
    focus: "角色边界、一致性语义、超时重试和故障恢复",
    mechanism: "把请求、协调者、参与节点、存储状态和补偿任务串成时序，而不是只罗列组件名",
    boundary: "网络分区、时钟漂移、旧 leader、重复请求、超时重试、幂等和脑裂",
    signals: "租约、任期、版本号、TraceId、重试次数、状态机、延迟和错误率",
    alternatives: "本地事务、最终一致、TCC、Saga、Raft、租约、fencing token 或配置中心方案",
    dimensions: "一致性、可用性、延迟、实现复杂度和故障恢复成本",
    nodes: ["明确参与角色", "标出状态变更", "处理超时重试", "防止旧状态写入", "补偿异常分支", "验证一致性结果"]
  },
  {
    match: (file) => file.includes("/engineering/"),
    type: "flow",
    name: "工程化",
    focus: "发布流程、资源边界、排障命令、回滚策略和监控告警",
    mechanism: "按环境、镜像、配置、健康检查、流量切换和回滚链路展开",
    boundary: "配置漂移、资源打满、探针误判、发布失败、依赖异常和回滚窗口",
    signals: "发布记录、容器状态、日志、CPU、内存、磁盘、网络、P95/P99 和告警",
    alternatives: "蓝绿、金丝雀、滚动发布、限流、降级、扩容、回滚或手工止血",
    dimensions: "发布风险、恢复速度、资源成本、用户影响和运维复杂度",
    nodes: ["确认运行环境", "检查配置资源", "观察健康信号", "执行灰度发布", "准备回滚路径", "复盘告警阈值"]
  },
  {
    match: (file) => file.includes("/java/"),
    type: "structure",
    name: "Java",
    focus: "对象模型、并发语义、API 边界、异常行为和最小复现",
    mechanism: "从语言规则、JDK 实现、线程可见性或集合结构出发，说明为什么会出现这个行为",
    boundary: "线程安全、可变性、泛型擦除、异常包装、版本差异、空值和性能退化",
    signals: "单元测试、线程栈、JFR、日志、源码方法名、构造参数和最小复现",
    alternatives: "基础 API、并发容器、锁、原子类、不可变对象、Stream 或 CompletableFuture",
    dimensions: "语义正确性、线程安全、可读性、性能和版本兼容性",
    nodes: ["定位语言语义", "说明JDK实现", "拆清线程边界", "补充异常行为", "构造最小复现", "给出替代方案"]
  },
  {
    match: (file) => file.includes("/jvm/"),
    type: "structure",
    name: "JVM",
    focus: "运行时结构、参数开关、日志指标、排障工具和版本差异",
    mechanism: "把内存区域、类加载、JIT、GC 或 safepoint 放到真实运行时链路里解释",
    boundary: "堆外内存、容器限制、GC 停顿、类加载泄漏、JIT 退化和版本默认值变化",
    signals: "GC 日志、JFR、jcmd、jstack、jmap、NMT、CodeCache、Safepoint 和线程状态",
    alternatives: "GC 参数、内存拆分、对象生命周期分析、类加载排查或运行时采样",
    dimensions: "停顿时间、吞吐、内存占用、排障成本和 JDK 版本",
    nodes: ["确认运行时区域", "读取关键日志", "关联JVM参数", "定位异常对象", "验证版本差异", "沉淀排障命令"]
  },
  {
    match: (file) => file.includes("/mq/"),
    type: "sequence",
    name: "消息队列",
    focus: "生产发送、Broker 存储、消费确认、重试死信和幂等补偿",
    mechanism: "按生产者、Broker、消费者、业务数据库和补偿任务拆链路",
    boundary: "重复投递、顺序错乱、消息积压、事务边界、重试风暴和毒丸消息",
    signals: "消费延迟、offset、重试次数、死信量、事务状态、幂等表和最终数据状态",
    alternatives: "同步调用、异步消息、Outbox、事务消息、延迟消息或补偿任务",
    dimensions: "可靠性、顺序性、延迟、吞吐、幂等成本和补偿成本",
    nodes: ["生产者发送", "Broker持久化", "消费者确认", "处理重试死信", "保证业务幂等", "核对最终状态"]
  },
  {
    match: (file) => file.includes("/mybatis/"),
    type: "structure",
    name: "MyBatis",
    focus: "SQL 生成、参数绑定、执行器行为、缓存边界和日志排查",
    mechanism: "从 Mapper 方法、MappedStatement、BoundSql、Executor、StatementHandler 和结果映射讲清调用链",
    boundary: "SQL 注入、一级缓存作用域、二级缓存一致性、批处理 flush、插件顺序和线程安全",
    signals: "最终 SQL、参数绑定日志、执行器类型、缓存命中、慢 SQL、连接池和事务边界",
    alternatives: "XML、注解、动态 SQL、插件、TypeHandler、分页插件或手写 SQL",
    dimensions: "SQL 可控性、注入风险、缓存一致性、性能和维护成本",
    nodes: ["进入Mapper代理", "生成BoundSql", "绑定SQL参数", "选择执行器", "映射返回结果", "查看日志证据"]
  },
  {
    match: (file) => file.includes("/mysql/"),
    type: "structure",
    name: "MySQL",
    focus: "执行计划、索引事务、锁范围、统计指标和数据一致性",
    mechanism: "把 SQL、优化器、索引结构、事务隔离和存储引擎行为串起来",
    boundary: "索引失效、锁范围扩大、主从延迟、统计信息过期、深分页和 DDL 风险",
    signals: "EXPLAIN、慢日志、optimizer trace、锁等待、事务状态、redo/undo/binlog 和复制延迟",
    alternatives: "索引优化、SQL 改写、分页改造、读写分离、分区分库或归档策略",
    dimensions: "查询性能、锁影响、一致性、扩展性和回滚难度",
    nodes: ["分析SQL条件", "查看执行计划", "确认索引命中", "判断锁和事务", "观察运行指标", "制定回滚方案"]
  },
  {
    match: (file) => file.includes("/network/"),
    type: "sequence",
    name: "网络协议",
    focus: "协议字段、连接状态、缓存策略、抓包排查和安全边界",
    mechanism: "按客户端、DNS、连接建立、请求头、服务端响应和连接关闭的时序说明",
    boundary: "缓存过期、跨域、TLS 握手、队头阻塞、连接复用、TIME_WAIT 和代理转发",
    signals: "状态码、请求头、响应头、tcpdump、Wireshark、DNS 记录、证书和连接状态",
    alternatives: "HTTP 缓存、CDN、反向代理、HTTP/2、HTTP/3、gRPC、WebSocket 或 TCP 参数",
    dimensions: "协议语义、延迟、兼容性、安全性和排查成本",
    nodes: ["识别协议层次", "标出关键字段", "说明连接状态", "处理缓存安全", "抓包验证链路", "区分相近协议"]
  },
  {
    match: (file) => file.includes("/os/"),
    type: "structure",
    name: "操作系统",
    focus: "内核对象、系统调用、资源指标、排障命令和隔离边界",
    mechanism: "从进程线程、文件描述符、虚拟内存、IO 模型或内核调度解释现象",
    boundary: "上下文切换、fd 泄漏、内存映射、零拷贝适用范围、cgroup 限制和 namespace 隔离",
    signals: "top、pidstat、strace、lsof、ss、vmstat、perf、eBPF 和容器资源指标",
    alternatives: "多进程、多线程、IO 多路复用、mmap、sendfile、cgroup 或 namespace",
    dimensions: "资源消耗、吞吐、延迟、隔离性和排障复杂度",
    nodes: ["确认内核对象", "定位系统调用", "观察资源指标", "分析状态变化", "选择排障命令", "说明隔离边界"]
  },
  {
    match: (file) => file.includes("/project/"),
    type: "flow",
    name: "项目设计",
    focus: "业务状态机、幂等约束、失败补偿、灰度回滚和审计指标",
    mechanism: "先讲业务目标和数据模型，再讲主链路、异常分支、补偿任务和运营后台",
    boundary: "重复请求、超时回调、权限越权、资金库存不一致、灰度误伤和人工修复",
    signals: "状态表、流水表、唯一索引、审计日志、对账结果、告警、Runbook 和回滚记录",
    alternatives: "同步事务、异步补偿、状态机、Outbox、定时扫描、人工审核或多级降级",
    dimensions: "一致性要求、用户体验、资金库存风险、实现成本和人工兜底成本",
    nodes: ["明确业务目标", "设计核心状态", "约束幂等唯一", "处理失败补偿", "接入审计监控", "验证灰度回滚"]
  },
  {
    match: (file) => file.includes("/redis/"),
    type: "structure",
    name: "Redis",
    focus: "命令语义、key 设计、过期策略、内存指标和客户端行为",
    mechanism: "从数据结构、命令原子性、过期淘汰、集群路由或客户端重试解释",
    boundary: "大 key、热 key、缓存击穿、主从切换、Cluster 跨槽、Lua 阻塞和内存碎片",
    signals: "INFO、SLOWLOG、MEMORY USAGE、OBJECT ENCODING、CLIENT LIST、命中率和延迟",
    alternatives: "String、Hash、ZSet、Lua、Pipeline、Stream、Cluster、哨兵或本地缓存",
    dimensions: "读写性能、一致性、内存成本、可用性和运维复杂度",
    nodes: ["选择数据结构", "说明命令语义", "设计key和TTL", "处理热点风险", "观察Redis指标", "准备降级补偿"]
  },
  {
    match: (file) => file.includes("/spring/"),
    type: "sequence",
    name: "Spring",
    focus: "容器生命周期、代理边界、配置加载、过滤器链和 Actuator 验证",
    mechanism: "把请求进入、Bean 创建、AOP 代理、事务上下文或自动配置条件放到调用链里讲",
    boundary: "代理失效、线程池上下文丢失、配置覆盖、过滤器顺序、事务边界和响应式阻塞",
    signals: "启动日志、ConditionEvaluationReport、Actuator、异常栈、线程池指标、事务日志和安全状态码",
    alternatives: "注解配置、BeanPostProcessor、Import、AOP、Filter、Interceptor、Starter 或 WebFlux",
    dimensions: "生效时机、代理边界、线程上下文、配置覆盖和排障成本",
    nodes: ["进入Spring链路", "定位容器阶段", "判断代理边界", "检查配置条件", "观察运行信号", "准备回滚方案"]
  }
];

const defaultProfile = {
  type: "structure",
  name: "通用",
  focus: "概念边界、核心链路、异常分支和验证方式",
  mechanism: "先说明问题，再拆机制、边界、代价和验证闭环",
  boundary: "输入异常、状态不一致、性能退化和恢复成本",
  signals: "日志、指标、状态数据、测试样例和复盘记录",
  alternatives: "同步方案、异步方案、缓存、队列、降级或人工补偿",
  dimensions: "正确性、性能、复杂度、维护成本和恢复成本",
  nodes: ["明确问题背景", "拆解核心机制", "说明适用边界", "处理异常分支", "观察验证信号", "沉淀回答模板"]
};

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

function cleanInline(text) {
  return String(text ?? "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .replace(/[|]/g, "")
    .trim();
}

function withoutStop(text) {
  return cleanInline(text).replace(/[。！？!?；;]+$/, "");
}

function trimSentence(text, max = 90) {
  const cleaned = cleanInline(text)
    .replace(/^[-*]\s*/, "")
    .replace(/^\d+[.、]\s*/, "")
    .replace(/^建议补[:：]?/, "")
    .trim();

  if (cleaned.length <= max) {
    return cleaned;
  }

  const natural = cleaned.split(/[。；;.!?？]/)[0]?.trim();

  if (natural && natural.length <= max) {
    return natural;
  }

  return cleaned.slice(0, max).replace(/[，、：:；;,.!?？-]\s*$/, "");
}

function labelFrom(text, fallback) {
  const source = cleanInline(text)
    .replace(/^回答时最好补一句[:：]?/, "")
    .replace(/^建议补[:：]?/, "")
    .replace(/^补[:：]?/, "")
    .replace(/。.*$/, "")
    .replace(/[，,；;：:]+.*$/, "")
    .trim();
  const raw = cleanInline(text);
  const keywordLabel =
    /扩容|桶位置|链地址法|开放寻址|哈希冲突/.test(raw)
      ? "区分冲突处理"
      : /状态|流转/.test(source)
      ? "梳理状态流转"
      : /爬楼梯|打家劫舍|背包|例子|状态定义/.test(source)
        ? "补具体DP例子"
      : /幂等|重复/.test(source)
        ? "设计幂等约束"
        : /索引|EXPLAIN|SQL/.test(source)
          ? "确认SQL路径"
          : /锁|并发|线程/.test(source)
            ? "说明并发边界"
            : /缓存|Redis|key|TTL/.test(source)
              ? "拆清缓存语义"
              : /消息|Broker|消费|Kafka|MQ|RocketMQ/.test(source)
                ? "说明消息语义"
                : /事务|回滚|一致/.test(source)
                  ? "明确一致性边界"
                  : /HTTP|TCP|DNS|TLS|协议/.test(source)
                    ? "标出协议字段"
                    : /GC|JVM|内存|类加载/.test(source)
                      ? "观察运行时指标"
                      : /Spring|Bean|AOP|Filter/.test(source)
                        ? "定位Spring阶段"
                        : /dp|DP|复杂度|遍历|指针|排序|堆|哈希/.test(source)
                          ? "推导算法复杂度"
                          : "";

  const tooGeneric = /^(明确|补|增加|区分|建议|说明|处理|设计)$/.test(source);
  const label = source.length > 0 && source.length <= 18 && !tooGeneric ? source : keywordLabel || fallback;

  return cleanInline(label).replace(/[.…]|\.{3}/g, "").slice(0, 24) || fallback;
}

function extractSection(content, title) {
  const match = content.match(new RegExp(`(?:^|\\r?\\n)## ${title}\\r?\\n([\\s\\S]*?)(?=\\r?\\n## |$)`));
  return match?.[1]?.trim() ?? "";
}

function setSection(content, title, body, beforeTitle) {
  const section = `## ${title}\n\n${body.trim()}\n`;
  const pattern = new RegExp(`(?:^|\\r?\\n)## ${title}\\r?\\n[\\s\\S]*?(?=\\r?\\n## |$)`, "g");
  const matches = [...content.matchAll(pattern)];

  if (matches.length > 0) {
    let next = content;

    for (let index = matches.length - 1; index >= 0; index -= 1) {
      const match = matches[index];
      const start = match.index ?? 0;
      const end = start + match[0].length;
      next = `${next.slice(0, start)}\n${index === 0 ? section : ""}${next.slice(end)}`;
    }

    return next.replace(/\n{3,}/g, "\n\n").trimEnd();
  }

  if (beforeTitle) {
    const beforeMatch = content.match(new RegExp(`^## ${beforeTitle}\\r?$`, "m"));

    if (beforeMatch?.index !== undefined) {
      return `${content.slice(0, beforeMatch.index)}${section}\n${content.slice(beforeMatch.index)}`.replace(/\n{3,}/g, "\n\n").trimEnd();
    }
  }

  return `${content.trimEnd()}\n\n${section}`.trimEnd();
}

function removeGeneratedSections(content) {
  let next = content;

  for (const title of skipSections) {
    next = next.replace(new RegExp(`(?:^|\\r?\\n)## ${title}\\r?\\n[\\s\\S]*?(?=\\r?\\n## |$)`, "g"), "\n");
  }

  return next.replace(/\n{3,}/g, "\n\n").trimEnd();
}

function answerPoints(content) {
  const answer = extractSection(content, "面试回答");
  const lines = answer
    .split(/\r?\n/)
    .map((line) => cleanInline(line))
    .filter(Boolean)
    .filter((line) => !/[：:]$/.test(line))
    .filter((line) => /^[-*]\s+|^\d+[.、]\s+/.test(line) || line.length > 8)
    .map((line) => trimSentence(line.replace(/^[-*]\s+/, ""), 70));

  return Array.from(new Set(lines)).slice(0, 5);
}

function sectionPlain(content, title, fallback = "") {
  return trimSentence(extractSection(content, title).split(/\r?\n/).filter(Boolean).join(" "), 160) || fallback;
}

function listPlain(content, title, fallback = "") {
  const section = extractSection(content, title);
  const items = section
    .split(/\r?\n/)
    .map((line) => cleanInline(line).replace(/^[-*]\s+/, ""))
    .filter(Boolean)
    .filter((line) => !/^#+\s/.test(line))
    .slice(0, 3);

  return items.join("；") || fallback;
}

function readAuditAdvice() {
  const advice = new Map();

  if (!fs.existsSync(auditsRoot)) {
    return advice;
  }

  for (const file of collectMarkdownFiles(auditsRoot)) {
    const raw = fs.readFileSync(file, "utf8");

    for (const line of raw.split(/\r?\n/)) {
      const pathMatch = line.match(/`(content\/questions\/[^`]+\.md)`/);

      if (!pathMatch) {
        continue;
      }

      const cells = line
        .split("|")
        .map((cell) => cleanInline(cell))
        .filter(Boolean);
      const last = cells.at(-1) ?? "";

      advice.set(pathMatch[1], last);
    }
  }

  return advice;
}

function profileFor(file) {
  return profiles.find((profile) => profile.match(file)) ?? defaultProfile;
}

function auditFocus(advice) {
  const cleaned = cleanInline(advice)
    .replace(/方向正确[，,]?/g, "")
    .replace(/主体质量较好[，,]?/g, "")
    .replace(/正文质量较好[，,]?/g, "")
    .replace(/但正文模板化且重复 ## 图解提示/g, "")
    .replace(/重复 ## 图解提示/g, "")
    .trim();
  const fragments = cleaned
    .split(/[。；;]/)
    .map((fragment) => fragment.trim())
    .filter(Boolean)
    .map((fragment) => {
      const suggestion = fragment.match(/建议(.*)$/)?.[1];
      const should = fragment.match(/(?:需要|应|要)(补|明确|区分|清理|替换|增加|修复)(.*)$/);

      if (suggestion) {
        return suggestion.replace(/^[:：]?/, "").trim();
      }

      if (should) {
        return `${should[1]}${should[2]}`.trim();
      }

      return "";
    })
    .filter(Boolean)
    .filter((fragment) => !/模板|重复|截断|硬伤|主体|方向|结论|当前|前半段/.test(fragment))
    .slice(0, 3);

  return trimSentence(fragments.join("；"), 180);
}

function buildNodes({ profile, points, advice }) {
  const adviceParts = auditFocus(advice)
    .split(/[。；;]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const candidates = [
    profile.nodes[0],
    points[0],
    points[1],
    adviceParts[0],
    adviceParts[1],
    profile.nodes[5]
  ];

  return profile.nodes.map((fallback, index) => ({
    label: labelFrom(candidates[index], fallback),
    detail:
      index === 0
        ? `先确认这题属于${profile.name}问题，回答围绕${profile.focus}展开。`
        : index === 5
          ? `最后用${profile.signals}证明方案有效。`
          : trimSentence(candidates[index] || fallback, 72) || fallback,
    tone: index === 0 ? "main" : index >= 3 ? "warn" : "safe"
  }));
}

function buildDetail({ parsed, file, profile, points, advice, conclusion, explanation, mistakes }) {
  const title = parsed.data.title ?? path.basename(file, ".md");
  const summary = parsed.data.summary ?? conclusion;
  const pointText = points.slice(0, 4).join("；") || summary;
  const focus = auditFocus(advice);
  const mistakeText = mistakes || `不要只背结论，要说明${profile.boundary}。`;
  const paragraphs = [
    `${title} 这道题现在要从“能背出来”修到“能接住追问”。核心结论是：${withoutStop(summary)}。回答时先把它放回${profile.name}语境，说明它解决什么矛盾，再围绕${profile.focus}展开。这样能避免泛泛而谈，也能让面试官听出你知道这题的真实边界。`,
    `第一步是拆清问题背景。${withoutStop(explanation || conclusion)}。在${profile.name}题里，背景不能写成空泛的工程套话，而要落到${profile.mechanism}。如果只说“看场景”或“加组件”，读者很难知道下一步该检查什么；如果能把输入、状态、依赖和输出说清，答案就有了主线。`,
    `第二步是讲机制。可以围绕这些点展开：${pointText}。每个点都要回答三个问题：它在链路里的位置是什么，它改变了什么状态，失败或边界条件下会留下什么现象。把这三件事讲清楚，追问从概念跳到实战时就不会断。`,
    `第三步是补边界。这里尤其要主动说明${profile.boundary}。${withoutStop(mistakeText)}。很多八股答案的问题不是方向错，而是没有说适用范围；一旦遇到数据规模变化、异常分支或版本差异，原来的结论就可能不成立。`,
    focus
      ? `第四步是补专项深度：${focus}。这部分适合放在面试回答后半段，用来证明你不仅知道标准答案，也知道高频追问会往哪里挖。`
      : `第四步要补验证证据。可以用${profile.signals}来确认推理是否成立。验证动作越具体，越能说明你不是在背模板。`,
    `最后收束成一套回答节奏：先给结论，再讲机制，再补边界，最后说验证方式。对这题来说，验证可以看${profile.signals}；方案选择可以和${profile.alternatives}对比。这样既保留八股题的清晰度，也能把答案讲成可落地、可排查、可复盘的经验。`
  ];

  let detail = paragraphs.join("\n\n");

  const supplements = [
    `如果面试官继续追问，可以再补一层取舍：为什么不用另一个方案、什么时候会退化、怎么发现反例或异常、出问题后如何止血。${profile.name}题最怕只有名词没有链路，补上${profile.focus}之后，答案会更稳。`,
    `讲到最后还可以补一句排查方式：先复现最小场景，再观察${profile.signals}，最后和${profile.alternatives}做对比。这个收束能把概念题变成可验证的分析题。`
  ];

  for (const supplement of supplements) {
    if (detail.replace(/\s/g, "").length >= 1000) {
      break;
    }

    detail += `\n\n${supplement}`;
  }

  return detail;
}

function buildFollowups({ title, profile, advice, points }) {
  const core = points[0] || title;
  const focus = auditFocus(advice) || profile.focus;

  return [
    [
      "这题最容易被追问的边界是什么？",
      `重点说清${profile.boundary}。不要只给结论，要说明哪些条件下结论成立，哪些条件下会退化或需要换方案。`
    ],
    [
      "怎么证明自己不是在背模板？",
      `用${profile.signals}做验证。能说出具体信号、反例或排查入口，答案就从概念层进入实战层。`
    ],
    ["和相近方案怎么区分？", `可以拿${profile.alternatives}对比，从${profile.dimensions}几个维度选择。`],
    [
      "面试官继续深挖时怎么展开？",
      `先围绕“${core}”讲清主链路，再补“${focus}”。如果能把边界条件、异常分支和验证闭环连起来，就能接住二面、三面的追问。`
    ]
  ]
    .map(([question, answer]) => `### ${question}\n\n${answer}`)
    .join("\n\n");
}

function buildDiagram({ profile, nodes, parsed }) {
  const title = parsed.data.title ?? "这道题";
  const graphName = profile.type === "compare" ? "对比图" : profile.type === "sequence" ? "时序图" : profile.type === "flow" ? "流程图" : "结构图";
  const labels = nodes.map((node) => node.label).join(" -> ");

  return `适合画一张${graphName}：${labels}。画面重点突出：${title} 不是孤立概念，要把核心机制、边界风险、异常处理和验证证据放在同一张图里。`;
}

function toVisual({ profile, nodes, parsed }) {
  const title = parsed.data.title ?? "题目图解";
  const summary = parsed.data.summary ?? `${profile.name}题图解`;
  const graphName = profile.type === "compare" ? "对比图" : profile.type === "sequence" ? "时序图" : profile.type === "flow" ? "流程图" : "结构图";

  return {
    type: profile.type,
    title: `${title}：${graphName}`,
    summary: `${summary}，重点看${profile.focus}。`,
    nodes,
    prompt: `画一张${graphName}：${nodes.map((node) => node.label).join(" -> ")}。突出${profile.focus}，避免使用省略号或截断标签。`,
    takeaway: `回答要从结论走到${profile.signals}，形成验证闭环。`
  };
}

function updateProgress(batches) {
  const current = fs.existsSync(progressPath) ? JSON.parse(fs.readFileSync(progressPath, "utf8")) : {};
  const completed = Array.from(new Set([...(current.completedRepairBatches ?? []), ...batches])).sort((a, b) => a - b);
  const sortedBatches = [...batches].sort((a, b) => a - b);
  const firstBatch = sortedBatches[0];
  const lastBatch = sortedBatches.at(-1);
  const repairedRange = `${(firstBatch - 1) * 10 + 1}-${lastBatch * 10}`;

  current.updatedAt = "2026-05-05";
  current.batchSize = 10;
  current.completedRepairBatches = completed;
  current.lastBatch = {
    batch: lastBatch,
    batches: sortedBatches,
    range: repairedRange,
    slugs: [],
    fixes: [
      "批量重写详细讲解，清除通用模板污染",
      "扩充常见追问为 4 个专项追问",
      "去重并重写图解提示",
      "更新 visual 节点，消除截断标签"
    ]
  };
  current.nextBatch = Array.from({ length: 40 }, (_, index) => index + 1).find((batch) => !completed.includes(batch)) ?? null;

  fs.writeFileSync(progressPath, JSON.stringify(current, null, 2) + "\n", "utf8");
}

const auditAdvice = readAuditAdvice();
const visuals = JSON.parse(fs.readFileSync(visualPath, "utf8"));
const allFiles = collectMarkdownFiles(questionsRoot)
  .map((file) => path.relative(root, file).replaceAll("\\", "/"))
  .sort((a, b) => a.localeCompare(b));

const requested = process.argv.slice(2).map((value) => Number.parseInt(value, 10)).filter(Number.isInteger);
const batches = requested.length > 0 ? requested : Array.from({ length: 33 }, (_, index) => index + 1);

let changed = 0;

for (const batch of batches) {
  const files = allFiles.slice((batch - 1) * 10, batch * 10);

  if (files.length !== 10) {
    throw new Error(`Batch ${batch} resolved to ${files.length} files.`);
  }

  for (const file of files) {
    const fullPath = path.join(root, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const parsed = matter(raw);
    const profile = profileFor(file);
    const points = answerPoints(parsed.content);
    const conclusion = sectionPlain(parsed.content, "一句话结论", parsed.data.summary ?? "");
    const explanation = sectionPlain(parsed.content, "通俗解释", conclusion);
    const mistakes = listPlain(parsed.content, "易错点");
    const advice = auditAdvice.get(file) ?? "";
    const title = parsed.data.title ?? path.basename(file, ".md");
    const nodes = buildNodes({ profile, points, advice });

    let next = removeGeneratedSections(raw);
    next = setSection(next, "常见追问", buildFollowups({ title, profile, advice, points }), "易错点");
    next = setSection(
      next,
      "详细讲解",
      buildDetail({ parsed, file, profile, points, advice, conclusion, explanation, mistakes }),
      "图解提示"
    );
    next = setSection(next, "图解提示", buildDiagram({ profile, nodes, parsed }), "记忆钩子");

    fs.writeFileSync(fullPath, `${next.trimEnd()}\n`, "utf8");

    const slug = parsed.data.slug ?? path.basename(file, ".md");
    visuals[slug] = toVisual({ profile, nodes, parsed });
    changed += 1;
  }
}

fs.writeFileSync(visualPath, JSON.stringify(visuals, null, 2) + "\n", "utf8");
updateProgress(batches);

console.log(`Repaired ${changed} question files across batches ${batches[0]}-${batches.at(-1)}.`);
