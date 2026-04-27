import type { LucideIcon } from "lucide-react";
import {
  Blocks,
  BrainCircuit,
  Cable,
  Container,
  Database,
  GitBranch,
  Leaf,
  Network,
  RadioTower,
  Share2
} from "lucide-react";

export type RoadmapStage = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  categories: string[];
  mustKnow: string[];
  output: string;
  sourceLabel: string;
  sourceUrl: string;
  icon: LucideIcon;
};

export const roadmapStages: RoadmapStage[] = [
  {
    id: "java-core",
    title: "Java 基础与集合",
    subtitle: "先把语言基本盘打稳",
    description:
      "目标不是把 API 背完，而是能解释集合、泛型、异常、对象模型这些面试常问概念背后的设计取舍。",
    categories: ["Java 基础"],
    mustKnow: ["HashMap", "ArrayList", "String", "equals/hashCode", "异常体系", "泛型"],
    output: "能把 Java 基础题答成“原理 + 场景 + 坑点”，而不是只背结论。",
    sourceLabel: "Oracle Java SE Docs",
    sourceUrl: "https://docs.oracle.com/en/java/javase/",
    icon: Blocks
  },
  {
    id: "jvm-concurrency",
    title: "JVM 与并发",
    subtitle: "后端面试最容易拉开差距",
    description:
      "围绕运行时内存、垃圾回收、类加载、JMM、锁、线程池、CAS 展开。这里决定你能不能从一面基础题撑到二面追问。",
    categories: ["JVM", "Java 并发"],
    mustKnow: ["运行时数据区", "GC Roots", "类加载", "volatile", "线程池", "CAS"],
    output: "能按“现象、底层原因、解决方式”组织并发和 JVM 回答。",
    sourceLabel: "Oracle Java Concurrency",
    sourceUrl: "https://docs.oracle.com/javase/tutorial/essential/concurrency/",
    icon: BrainCircuit
  },
  {
    id: "spring-backend",
    title: "Spring 后端开发",
    subtitle: "从会用框架到能解释框架",
    description:
      "重点掌握 IoC、AOP、Bean 生命周期、事务、MVC 流程、自动配置和安全基础。项目经历里很多问题最终都会回到 Spring。",
    categories: ["Spring", "MyBatis"],
    mustKnow: ["IoC", "AOP", "Bean 生命周期", "事务失效", "MVC 执行链", "MyBatis"],
    output: "能解释一个请求如何穿过 Spring，并能定位常见事务/代理问题。",
    sourceLabel: "Spring Framework Reference",
    sourceUrl: "https://docs.spring.io/spring-framework/reference/",
    icon: Leaf
  },
  {
    id: "mysql",
    title: "MySQL 与数据一致性",
    subtitle: "索引、事务、锁是必答题",
    description:
      "把 B+ 树索引、执行计划、事务隔离、MVCC、redo/undo/binlog、锁和死锁串成一条线，服务项目里的慢 SQL 和一致性问题。",
    categories: ["MySQL"],
    mustKnow: ["B+ 树", "最左前缀", "EXPLAIN", "MVCC", "事务日志", "死锁"],
    output: "能看懂慢 SQL 的风险，并说出为什么这样建索引。",
    sourceLabel: "MySQL Reference Manual",
    sourceUrl: "https://dev.mysql.com/doc/refman/8.4/en/optimization.html",
    icon: Database
  },
  {
    id: "redis-cache",
    title: "Redis 与缓存架构",
    subtitle: "高并发项目绕不开",
    description:
      "不仅要会数据结构，还要理解缓存穿透、击穿、雪崩、热 key、大 key、持久化、淘汰策略和分布式锁。",
    categories: ["Redis"],
    mustKnow: ["数据结构", "缓存三兄弟", "RDB/AOF", "过期淘汰", "分布式锁", "热 key"],
    output: "能把 Redis 从“会用命令”讲到“系统保护”。",
    sourceLabel: "Redis Docs",
    sourceUrl: "https://redis.io/docs/latest/",
    icon: RadioTower
  },
  {
    id: "mq",
    title: "消息队列与异步系统",
    subtitle: "项目高频追问区",
    description:
      "围绕可靠投递、重复消费、顺序消息、延迟消息、削峰填谷和最终一致性。二面项目题经常从这里往深处挖。",
    categories: ["消息队列"],
    mustKnow: ["可靠消息", "幂等消费", "顺序消息", "死信队列", "事务消息", "削峰"],
    output: "能把 MQ 放进真实业务链路，而不是只背生产者消费者。",
    sourceLabel: "Apache Kafka Docs",
    sourceUrl: "https://kafka.apache.org/documentation/",
    icon: Cable
  },
  {
    id: "distributed",
    title: "分布式与微服务",
    subtitle: "项目追问的分水岭",
    description:
      "补齐 CAP、BASE、分布式事务、限流、熔断、注册发现、网关和一致性哈希。这里决定项目回答能不能从单体 CRUD 走到系统设计。",
    categories: ["分布式系统"],
    mustKnow: ["CAP/BASE", "分布式事务", "限流算法", "熔断降级", "注册发现", "一致性哈希"],
    output: "能解释系统拆分后出现的问题，以及常见治理手段的取舍。",
    sourceLabel: "Spring Cloud Docs",
    sourceUrl: "https://docs.spring.io/spring-cloud/docs/current/reference/html/",
    icon: Share2
  },
  {
    id: "network-os",
    title: "计网与操作系统",
    subtitle: "基础题里的稳定得分点",
    description:
      "重点掌握 TCP、HTTP、HTTPS、DNS、进程线程、死锁、IO 多路复用。这些题不一定难，但回答混乱会很扣分。",
    categories: ["计算机网络", "操作系统"],
    mustKnow: ["TCP", "HTTP/HTTPS", "DNS", "进程线程", "死锁", "IO 多路复用"],
    output: "能用生活类比讲清楚抽象概念，再补上标准术语。",
    sourceLabel: "MDN HTTP Docs",
    sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP",
    icon: Network
  },
  {
    id: "algorithm",
    title: "算法与手撕题",
    subtitle: "笔试和一面稳定过线",
    description:
      "不追求刷爆题库，先拿下数组、链表、哈希、栈队列、二分、排序、TopK、LRU 这些后端面试最常见模板。",
    categories: ["数据结构与算法"],
    mustKnow: ["数组双指针", "链表", "哈希表", "二分", "TopK", "LRU"],
    output: "能把常见手撕题写出可运行代码，并说清楚复杂度。",
    sourceLabel: "VisuAlgo",
    sourceUrl: "https://visualgo.net/en",
    icon: GitBranch
  },
  {
    id: "engineering",
    title: "工程化与项目落地",
    subtitle: "从做题到能讲真实项目",
    description:
      "补齐 Linux、Git、Docker、CI/CD、日志监控和典型系统设计。目标是让项目经历听起来像真的跑过线上，而不是只停留在 CRUD。",
    categories: ["工程化", "项目设计"],
    mustKnow: ["Linux", "Git", "Docker", "限流", "幂等", "最终一致性"],
    output: "能把项目从本地代码讲到部署、排查、扩容和故障兜底。",
    sourceLabel: "Docker Docs",
    sourceUrl: "https://docs.docker.com/",
    icon: Container
  }
];

export function getRoadmapStageById(id: string): RoadmapStage | undefined {
  return roadmapStages.find((stage) => stage.id === id);
}
