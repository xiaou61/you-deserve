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
  const normalized = normalize(content);
  const match = normalized.match(new RegExp(`(?:^|\\n)## ${title}\\n\\n([\\s\\S]*?)(?=\\n## |$)`));
  return match?.[1]?.trim() ?? "";
}

function replaceSection(content, title, body) {
  const normalized = normalize(content);
  return normalized.replace(
    new RegExp(`((?:^|\\n)## ${title}\\n\\n)([\\s\\S]*?)(?=\\n## |$)`),
    `$1${body.trim()}\n`
  );
}

function folderName(filePath) {
  return path.relative(root, filePath).split(path.sep)[0];
}

function firstInterviewLine(section) {
  const bullet = section
    .split("\n")
    .map((line) => line.trim())
    .find((line) => /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line));

  if (!bullet) {
    return "";
  }

  return bullet.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "").replace(/[。！？!?]+$/u, "").trim();
}

function titleText(data, fallback) {
  return typeof data.title === "string" ? data.title.trim() : fallback;
}

function summaryText(data, fallback) {
  return typeof data.summary === "string" ? data.summary.trim() : fallback;
}

function hasGenericFollowups(section) {
  return (
    section.includes("### 这题最容易被追问的边界是什么？") &&
    section.includes("### 怎么证明自己不是在背模板？") &&
    section.includes("### 和相近方案怎么区分？") &&
    section.includes("### 面试官继续深挖时怎么展开？")
  );
}

function buildFollowups(folder, title, summary, focus) {
  const topic = title.replace(/[？?]+$/u, "");
  const hook = focus || summary || topic;

  const templates = {
    algorithm: [
      ["这题最容易讲错的地方在哪？", `通常不是主思路本身，而是边界处理和复杂度判断。像「${hook}」这种题，最好主动说清楚空输入、重复元素、越界、是否允许原地修改，以及为什么这里不用另一种写法。这样面试官会更容易判断你是真的理解了套路，而不是只记住了模板。`],
      ["如果我现场手写，面试官最可能盯哪一步？", "一般会盯循环不变量、指针/窗口移动条件、递归终止条件，以及时间复杂度是不是和你嘴上说的一致。答的时候最好边写边解释状态怎么变化，别只报答案。"],
      ["数据规模一放大，原来的做法先坏在哪？", "先看时间复杂度，再看空间占用和常数项。很多算法题纸面上能过，但一到大输入就会卡在重复扫描、递归栈过深、哈希冲突或排序成本上。"],
      ["怎么把算法题讲得像自己真会用？", `别只说“这是某某模板题”，可以直接说：我会先判断 ${topic} 属于哪类约束，再选最合适的状态表示或数据结构，最后用一个反例证明这个写法不会漏。这样就更像实战思维。`]
    ],
    distributed: [
      ["这类分布式题最容易在哪个边界翻车？", `最常见的是把主链路讲顺了，却漏掉超时、重试、幂等、补偿和脑裂边界。像「${topic}」这种题，如果不主动补这几个点，面试官通常会继续追着问。`],
      ["线上排查时你会先看什么？", "先看入口流量、下游错误率、超时分布、重试次数、熔断/限流命中，再看状态是不是已经写了一半。分布式问题最怕只盯日志，不把链路和指标一起对。"],
      ["规模再涨一截，原来的结论会先变在哪里？", "通常会先体现在协调成本、热点分布、重试风暴、选主抖动或一致性代价上。答题时最好补一句：流量变大后，我会先判断瓶颈是网络、存储还是协调层。"],
      ["如果要讲成项目经历，该怎么组织？", `可以按“为什么要做 ${topic} -> 当时系统卡在哪 -> 方案怎么拆 -> 出问题怎么兜底 -> 最后靠什么指标证明有效”这条线来讲，会比纯概念更像你自己做过。`]
    ],
    engineering: [
      ["这类工程题最容易遗漏什么？", `最容易漏的是发布前检查、灰度观察、回滚入口和事后清理。像「${topic}」这种题，如果只讲工具，不讲操作顺序和止血方式，答案会显得发虚。`],
      ["线上真出问题时先看什么证据？", "先看日志和监控面板，再看变更记录、实例状态、资源曲线、错误峰值和最近发布。很多工程故障不是组件不会用，而是没有在第一时间抓到最关键的观测面。"],
      ["为什么这题不能只讲 happy path？", "因为真实系统里最贵的通常是异常分支：发布一半、配置不一致、健康检查误判、回滚不彻底、资源打满。这些不主动讲，工程题就会像 PPT。"],
      ["怎么讲得更像自己上线过？", `直接把 ${topic} 放进一次真实变更里：上线前怎么确认、上线时看什么、发现异常后怎么回滚、事后怎么收敛技术债。这样的表达会比列工具清单更有说服力。`]
    ],
    java: [
      ["Java 基础题最容易被追问到哪一层？", `通常会从定义继续追到内存语义、并发边界、对象生命周期或 JDK 版本差异。像「${topic}」这种题，最好主动说清楚它在多线程或大对象场景下有没有额外代价。`],
      ["如果要证明自己不是背概念，会补什么？", "最有效的是补一个可复现的小例子：哪种写法会出错、输出会长什么样、为什么会这样。Java 题一旦有最小复现，可信度会立刻上来。"],
      ["线上真的会通过什么现象暴露出来？", "一般会落到 GC 抖动、线程阻塞、对象分配过多、状态不一致或接口 RT 上升。把概念和现象连起来，才更像工程师而不是题库朗读器。"],
      ["面试里怎么把它讲顺？", `可以按“结论 -> 机制 -> 反例 -> 适用边界”来讲 ${topic}。如果再补一句你会怎么验证，通常就已经超过一面标准答案了。`]
    ],
    jvm: [
      ["JVM 题最容易讲得太空的地方在哪？", `就是只讲术语，不讲观测。像「${topic}」这种题，如果不顺手补一句会看什么日志、火焰图、JFR 或诊断命令，内容就容易飘。`],
      ["排查时第一眼看什么？", "先确认是 CPU、内存、停顿还是线程卡死，再决定去看 GC 日志、jstack、堆外内存、类加载还是编译行为。JVM 排查最怕一上来就盲打命令。"],
      ["为什么同一个结论在不同线上环境会不一样？", "因为堆大小、GC 选择、对象分配模式、容器限制和流量形态都在变。答题时主动提版本差异和运行参数，通常会显得更稳。"],
      ["怎么讲得像真处理过线上问题？", `别只背定义，可以直接说：如果 ${topic} 相关指标异常，我会先看哪几个信号，再判断是短期抖动还是结构性问题，最后再决定调参数、改代码还是换收集器。`]
    ],
    mq: [
      ["消息队列题最容易把哪段说过头？", `最容易把“可靠性”说成单点能力。像「${topic}」这种题，真正要拆开讲的是生产者、Broker、消费者三段分别会怎么丢、怎么重、怎么积压。`],
      ["线上优先盯哪些指标？", "先看消费延迟、分区堆积、重试次数、死信量、ISR 变化、发送失败率和业务侧对账。MQ 题最大的加分点就是你知道证据不只在 Broker。"],
      ["吞吐上来之后，原来的结论哪里会失效？", "通常会先体现在分区热点、顺序被打散、重试风暴、回压传导和消费者处理不过来。答的时候最好主动补一句扩容和限流的取舍。"],
      ["如果讲成项目经历，怎么讲最顺？", `可以按“为什么要引入消息 -> 当时想解决什么同步瓶颈 -> 用 ${topic} 后哪段链路变了 -> 怎么防重和补偿 -> 最后看什么指标回稳”来讲。`]
    ],
    mybatis: [
      ["MyBatis 题最容易和什么混在一起？", `最常见的是把框架行为和数据库行为混成一件事。像「${topic}」这种题，最好主动区分：这部分是 MyBatis 层做的，这部分是 JDBC 或 MySQL 自己决定的。`],
      ["排查时先看 mapper 还是先看数据库？", "通常两边都要看：先看最终生成的 SQL 和参数，再看执行计划、慢日志、事务边界和连接池状态。只盯 XML 或只盯数据库都容易漏真因。"],
      ["为什么很多问题只在线上才明显？", "因为数据量、事务长度、并发度和缓存命中情况跟本地完全不是一个量级。答题时把这句讲出来，面试官一般就知道你踩过坑。"],
      ["怎么把这题讲得更像实战？", `别只说注解或标签名，可以顺手补一句：如果 ${topic} 真出问题，我会如何定位最终 SQL、怎么验证影响范围、改完以后看什么指标。`]
    ],
    mysql: [
      ["这类 MySQL 题最容易把哪个边界讲错？", `最常见的是把“理论结论”直接套到所有执行计划上。像「${topic}」这种题，数据分布、索引命中、统计信息、排序方向和 limit 位置一变，结论就可能变样。`],
      ["线上排查时优先看哪些证据？", "先看 EXPLAIN / EXPLAIN ANALYZE、rows、filtered、slow log、临时表、锁等待和事务状态，再决定是改索引、改 SQL，还是改访问路径。MySQL 题最好用证据说话。"],
      ["为什么小表上看起来没问题，线上却会炸？", "因为数据量、冷热分布、回表成本、磁盘临时文件和长事务都会在大规模下放大。面试里主动说这句，会比单纯背索引规则更像做过性能优化。"],
      ["如果要讲成项目经历，怎么组织？", `可以按“现象 -> SQL -> 执行计划 -> 为什么慢/锁/扫这么多 -> 我改了什么 -> 指标怎么回稳”这条线讲 ${topic}，会非常顺。`]
    ],
    network: [
      ["网络题最容易和哪些层混掉？", `最常见的是把 DNS、TCP、TLS、HTTP、代理和 CDN 混成一团。像「${topic}」这种题，最好主动说清楚它发生在第几层，前后各依赖什么。`],
      ["真排障时第一步抓什么？", "先确定失败卡在解析、建连、握手、传输还是应用层，再选 dig、curl、tcpdump、Wireshark、请求头和连接状态去看。顺序比工具名更重要。"],
      ["为什么同样是“慢”，可能完全不是一个问题？", "因为慢可能来自 DNS 缓存失效、TCP 重传、TLS 握手、代理转发、服务端排队，甚至浏览器并发限制。答题时把这层拆开，内容立刻就厚了。"],
      ["怎么把它讲成真实链路？", `可以把 ${topic} 放到一次完整请求里，从浏览器或客户端出发，讲到服务端返回，中间哪一跳出问题会看到什么现象。这样用户也更容易记住。`]
    ],
    os: [
      ["操作系统题最容易停在什么层面？", `最容易停在术语解释，不往资源竞争和调度代价上走。像「${topic}」这种题，最好主动补一句它会通过什么系统现象暴露出来。`],
      ["排查时会优先看哪些信号？", "先看 CPU、上下文切换、系统调用、内存页行为、fd、队列长度和阻塞栈，再决定往内核态、用户态还是文件系统继续挖。"],
      ["为什么同一个问题在测试环境不明显？", "因为测试环境的并发、资源限制和 IO 形态往往太轻，很多调度或缓存问题根本放不大。把这句话讲出来，系统题就会更接近真实世界。"],
      ["面试里怎么讲得有画面感？", `可以把 ${topic} 直接对应到一个现象，比如 CPU 飙高、阻塞变多、内存紧张、网络堆积，然后再解释底层机制。用户会更容易记，也更容易讲顺。`]
    ],
    project: [
      ["项目设计题最容易在什么边界翻车？", `最常见的是把主链路讲得很漂亮，却漏掉权限、幂等、补偿、灰度、回滚和人工兜底。像「${topic}」这种题，面试官往往就是盯这些地方继续深挖。`],
      ["如果线上真出问题，你第一眼会看什么？", "先看业务状态表、审计日志、告警、队列堆积、错误峰值和最近变更，再判断是规则错了、数据错了还是补偿没跟上。项目题最怕脱离观测。"],
      ["为什么这类题不能只讲主流程？", "因为真实系统最贵的通常是异常路径：重复请求、灰度误伤、回滚不干净、下游超时、运营误操作。你不主动讲，面试官一定会来问。"],
      ["如果要讲成自己的项目经历，最顺的结构是什么？", `直接按“背景约束 -> 为什么需要 ${topic} -> 方案怎么拆 -> 最难的边界是什么 -> 出问题如何止血 -> 最后怎么验证有效”来讲，最像真实经历。`]
    ],
    redis: [
      ["Redis 题最容易在哪个边界讲虚？", `最常见的是只讲命令，不讲热点、TTL、内存和主从/集群边界。像「${topic}」这种题，如果不把这些现实约束补出来，就很像背命令手册。`],
      ["排查时你会先看哪些指标或命令？", "通常先看命中率、慢日志、INFO、内存碎片、热点 key、迁移状态、复制延迟和错误码，再决定是数据结构选错了，还是流量形态变了。"],
      ["为什么本地 demo 看起来都正常，线上却会出事？", "因为本地没有热点集中、没有大 key、没有主从切换、也没有 TTL 抖动。一到线上，这些边界会同时出现。"],
      ["怎么把这题讲得更像做过线上缓存？", `别只说 Redis 会什么，最好顺手补一句：如果 ${topic} 出问题，我会先看哪几个指标、怎么止血、之后怎么防再发。这样就很像真实经验。`]
    ]
  };

  const selected = templates[folder] ?? [
    ["这题最容易讲虚的地方在哪？", `像「${topic}」这种题，如果只给结论，不补使用边界、失败现象和验证证据，面试官通常会继续追问。`],
    ["如果要排查，第一眼看什么？", "先看能直接说明问题方向的日志、指标、状态变化或最小复现，不要一上来就漫无目的地翻代码。"],
    ["为什么结论会随着场景变化？", "因为数据规模、并发度、调用链位置和失败成本都在变。答题时主动补一句“什么条件下结论会变”，通常就会更稳。"],
    ["怎么把它讲成自己的经验？", `可以按“背景 -> 机制 -> 边界 -> 验证”来讲 ${topic}，比只复述定义更像自己真的用过。`]
  ];

  return selected
    .map(([heading, answer]) => `### ${heading}\n\n${answer}`)
    .join("\n\n");
}

const files = collectMarkdownFiles(root);
let updated = 0;

for (const file of files) {
  const raw = fs.readFileSync(file, "utf8");
  const parsed = matter(normalize(raw));
  const followups = extractSection(parsed.content, "常见追问");

  if (!hasGenericFollowups(followups)) {
    continue;
  }

  const folder = folderName(file);
  const title = titleText(parsed.data, path.basename(file, ".md"));
  const summary = summaryText(parsed.data, title);
  const interview = extractSection(parsed.content, "面试回答");
  const focus = firstInterviewLine(interview);
  const nextFollowups = buildFollowups(folder, title, summary, focus);
  const nextContent = replaceSection(parsed.content, "常见追问", nextFollowups);
  const rebuilt = matter.stringify(nextContent, parsed.data, { lineWidth: 0 });

  fs.writeFileSync(file, rebuilt.replace(/\n/g, "\r\n"), "utf8");
  updated += 1;
}

console.log(JSON.stringify({ updated }, null, 2));
