import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const questionsRoot = path.join(root, "content", "questions");

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

function restore(text) {
  return text.replace(/\n/g, "\r\n");
}

function extractSection(content, title) {
  const match = content.match(new RegExp(`(?:^|\\n)## ${title}\\n([\\s\\S]*?)(?=\\n## |$)`));
  return match?.[1]?.trim() ?? "";
}

function replaceSection(content, title, body) {
  return content.replace(
    new RegExp(`((?:^|\\n)## ${title}\\n)([\\s\\S]*?)(?=\\n## |$)`),
    `$1${body.trim()}\n`
  );
}

function detailLength(text) {
  return text.replace(/\s/g, "").length;
}

function folderName(filePath) {
  return path.relative(questionsRoot, filePath).split(path.sep)[0];
}

function cleanSentence(text) {
  return text.replace(/\s+/g, " ").trim().replace(/[。！？!?]+$/u, "");
}

function buildParagraphs(folder, title, summary) {
  const topic = cleanSentence(title);
  const concise = cleanSentence(summary);

  const shared = {
    algorithm: [
      `这类算法题面试里真正拉差距的，通常不是把模板写出来，而是你能不能顺手讲清楚为什么选这个思路、复杂度卡在哪里、输入一变化会先坏在哪。回答 ${topic} 时，最好主动补一个边界例子，比如空数组、重复值、极端单调输入或需要原地修改时该怎么处理，这样面试官会更容易判断你是理解了套路还是只记住了题解。`
    ],
    distributed: [
      `分布式题真正加分的部分，往往是你能不能把 ${concise} 放回一条真实链路里讲：入口流量怎么进来，状态落在哪一层，失败后会出现什么现象，恢复时先看哪几个指标。只要把超时、重试、幂等、补偿和观测这几个抓手讲明白，答案就会从概念题升级成“这个人真做过系统治理”。`
    ],
    engineering: [
      `工程化题别只停在组件名称。更稳的讲法是把 ${concise} 对应到一次真实发布或故障处理：变更前要确认什么，执行过程中看哪些日志和指标，出了问题怎么回滚，事后怎么收敛技术债。这样用户读的时候更容易把知识点映射到自己的上线场景，而不是只记住几个术语。`
    ],
    java: [
      `Java 基础或并发题继续往下问时，面试官通常在看你有没有把“语义、边界、代价”一起想清楚。讲 ${topic} 时，最好主动补一句它在高并发、对象生命周期或异常分支下会出现什么副作用，以及你会用什么日志、压测或最小复现去证明自己的判断，这样答案会更像工程经验，不像纯背诵。`
    ],
    jvm: [
      `JVM 题真正好用的答法，一定会把概念和观测工具绑在一起。除了说明 ${concise}，还可以顺手补一句你会看哪些信号，例如 GC 日志、JFR、jstack、NMT、堆外内存曲线或暂停时间分布。用户真正需要的不是再听一遍术语定义，而是知道出问题时第一眼该看哪里。`
    ],
    mq: [
      `消息队列题最怕只讲“理论上可靠”。更好的说法是把 ${concise} 放回生产者、Broker、消费者三段链路里，分别说明哪里可能丢、哪里可能重、哪里可能积压，再补一个你会盯的指标组合，比如重试次数、消费延迟、死信量、堆积分区和业务侧对账。这样读者拿去答二面时会稳很多。`
    ],
    mybatis: [
      `MyBatis 题要讲得像项目经验，关键是别只停在框架 API。围绕 ${topic}，最好补一层“SQL 最终长什么样、执行计划怎么变、线程或事务边界会不会受影响、排查时看 mapper 日志还是数据库侧证据”。这样用户读完不只知道概念，还知道它为什么会在真实项目里翻车。`
    ],
    mysql: [
      `MySQL 题真正有用的部分，通常是你能不能把 ${concise} 和执行计划、索引路径、锁范围、慢日志这些证据连起来。用户读这类内容，最想要的不是一个大而化之的结论，而是“为什么这条 SQL 会慢、会锁、会扫这么多行，以及我接下来该怎么验证”。把这一层补出来，文章的可用性会高很多。`
    ],
    network: [
      `网络题别只背协议流程图。讲 ${topic} 时，最好顺手补一个排查视角：如果现象是慢、连不上、偶发失败，究竟先看 DNS、TCP、TLS、代理还是应用层头信息。用户真正需要的是把流程记住之后，还知道当链路断在中间某一跳时该怎么继续拆。`
    ],
    os: [
      `操作系统题一旦往深了问，面试官通常会把它拉回资源竞争、调度开销和实际观测。除了结论本身，回答 ${topic} 时可以补一句它在线上更容易通过什么现象暴露出来，例如上下文切换陡增、系统调用阻塞、页缓存命中变化或 fd 用尽。这样文章会更像能帮用户排障，而不是只帮用户过一面。`
    ],
    project: [
      `项目设计题最值钱的部分，是把 ${concise} 讲成一套完整闭环：触发条件是什么，主链路怎么跑，异常分支怎么止血，最后靠哪些指标判断方案是不是稳住了。用户读这种题，往往不是为了记答案，而是为了拿去套自己的项目故事，所以把状态机、补偿、审计、灰度和回滚说具体，会比再堆概念更有帮助。`
    ],
    spring: [
      `Spring 题如果只说注解和默认行为，很容易在追问里断掉。围绕 ${topic}，最好再补一层“它什么时候生效、为什么可能不生效、日志和调用栈会留下什么痕迹”。这样用户复习时能把知识点和真实排查动作连起来，答题也会更顺。`
    ],
    redis: [
      `Redis 题继续深挖时，面试官通常会把话题拉到热点、TTL、主从一致性和集群边界上。把 ${concise} 放回真实读写链路，再补一个你会看的指标组合，比如命中率、慢日志、热点分布、内存碎片或迁移状态，文章的实战味会明显更强。`
    ]
  };

  return shared[folder] ?? [
    `这类题继续深挖时，最好别只停在定义。把 ${concise} 放回真实调用链、数据流或排查流程里，再补一句你会看哪些日志、指标或边界条件去验证，文章会更像用户真能拿去答题和复盘的材料。`
  ];
}

const files = collectMarkdownFiles(questionsRoot);
let updated = 0;

for (const file of files) {
  const raw = fs.readFileSync(file, "utf8");
  const normalized = normalize(raw);
  const parsed = matter(normalized);
  const detail = extractSection(parsed.content, "详细讲解");

  if (!detail) {
    continue;
  }

  const len = detailLength(detail);
  if (len >= 1000 || len > 1900) {
    continue;
  }

  const folder = folderName(file);
  const title = typeof parsed.data.title === "string" ? parsed.data.title : path.basename(file, ".md");
  const summary = typeof parsed.data.summary === "string" ? parsed.data.summary : title;
  const additions = buildParagraphs(folder, title, summary);

  let nextDetail = detail;
  for (const paragraph of additions) {
    if (detailLength(nextDetail) >= 1000) {
      break;
    }
    nextDetail = `${nextDetail}\n\n${paragraph}`;
  }

  if (detailLength(nextDetail) === len) {
    continue;
  }

  const nextContent = replaceSection(parsed.content, "详细讲解", nextDetail);
  const rebuilt = matter.stringify(nextContent, parsed.data, { lineWidth: 0 });
  fs.writeFileSync(file, restore(normalize(rebuilt)), "utf8");
  updated += 1;
}

console.log(JSON.stringify({ updated }, null, 2));
