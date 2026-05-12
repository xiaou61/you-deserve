# Task Plan

## Goal
把题库从“短答案 + 生图提示词”升级成“更详细的面试题内容 + 每题都有可视化图解”。

## Phases
- [complete] 1. 盘点现有题目、可视化数据和页面渲染链路
- [complete] 2. 批量扩写所有题目 Markdown，保留原有内容并补充实战细节
- [complete] 3. 优化可视化数据生成，让每题都有更完整的图解节点
- [complete] 4. 改造题目页视觉组件，隐藏“生图提示词”，展示真正图解
- [complete] 5. 跑 lint/build，访问页面验证效果
- [complete] 6. 按 10 道一批增加 1000-2000 字 `详细讲解`，并保存批处理进度
- [complete] 7. 规划第三轮内容增强：把 `常见追问` 按 10 道一批补成更能接面试追问的版本
- [complete] 8. 第四轮题目质检：按排序每 10 道一批精查事实准确性、理解难度、表达深度和可改进点，只先记录问题与建议
- [complete] 9. 第五轮内容修复：按审计 P1 优先级每 10 道一批修正文、常见追问、图解提示和 visual 节点
- [complete] 10. 后台/API 收尾加固：修复管理端假成功、客户端上报 slug、无效对象删除等边界
- [pending] 11. 第六轮定向提质：从“已完成覆盖”转向“提升可读性、差异化和实战表达”，按优先级批量优化 400 篇内容

## Detail Batch Progress
- Batch size: 10
- Completed batches: 1-40
- Completed range: sorted questions 1-400
- Next batch: 41
- Next range: none
- Status: verified through batch 40; all question batches completed

## Round 6 Batch Progress
- Batch size: 20
- Completed batches: 1
- Completed range: Batch 1 / Java 基础与并发高频 20 篇
- Current scope: `hashmap-thread-unsafe`, `hashmap-resize`, `hashmap-load-factor`, `arraylist-linkedlist`, `arraylist-fail-fast`, `concurrenthashmap`, `copyonwritearraylist`, `thread-pool-core-parameters`, `thread-pool-rejection-policy`, `threadlocal`, `threadlocal-inheritable`, `completablefuture`, `completablefuture-exception`, `blockingqueue`, `aqs`, `synchronized-reentrantlock`, `reentrantreadwritelock`, `atomic-classes-cas`, `volatile-visibility`, `cas-aba`
- Next batch: 2 / Spring 基础、AOP、事务高频 20 篇

## Decisions
- 优先做可运行的批量增强脚本，避免手工改几道题导致覆盖不完整。
- 保留原始 Markdown 的 frontmatter 和已有回答，只追加结构化扩展段落。
- 新的超长详解按 10 道一批推进，进度写入 `content/question-detail-progress.json`，方便后续继续。
- 详解正文使用 `## 详细讲解`，长度目标为去空白后 1000-2000 个中文字符左右；图解继续使用站内 `QuestionVisual` 渲染，避免只显示 Mermaid 代码块。
- 第一批详解实际长度已按脚本独立校验，最短 1002、最长 1072。
- 前四十批详解实际长度已按脚本独立校验，400 道全部在 1000-2000 字符目标内；当前整体范围 1000-1264，batch 10 范围 1005-1160，batch 11 范围 1026-1167，batch 12 范围 1122-1204，batch 13 范围 1038-1204，batch 14 范围 1007-1221，batch 15 范围 1142-1254，batch 16 范围 1049-1209，batch 17 范围 1164-1237，batch 18 范围 1148-1237，batch 19 范围 1127-1204，batch 20 范围 1112-1208，batch 21 范围 1007-1186，batch 22 范围 1156-1264，batch 23 范围 1135-1179，batch 24 范围 1131-1215，batch 25 范围 1125-1214，batch 26 范围 1099-1250，batch 27 范围 1157-1243，batch 28 范围 1143-1247，batch 29 范围 1144-1193，batch 30 范围 1128-1207，batch 31 范围 1139-1217，batch 32 范围 1120-1219，batch 33 范围 1124-1247，batch 34 范围 1150-1243，batch 35 范围 1137-1201，batch 36 范围 1151-1209，batch 37 范围 1133-1226，batch 38 范围 1128-1189，batch 39 范围 1128-1216，batch 40 范围 1130-1151。
- `scripts/enrich-detail-batch.mjs` 已增强为可自动生成缺失批次 payload，并会为不足 1000 字符的历史详解追加工程化补充，避免进度数字前进但内容质量掉线。
- 第三轮内容增强不再补正文长度，而是单独盯 `## 常见追问`：目标从“2 个简短追问”升级到“4 个左右能继续展开的追问”，每篇至少覆盖原理、场景、故障、对比四类中的三类。
- 第三轮仍按 10 道一批推进，总计划记录在 `docs/plans/2026-05-03-common-followup-expansion-plan.md`，优先顺序建议为 Batch 1-10 -> Batch 39-40 -> Batch 24-30 -> 其余批次。
- 第四轮质检从按文件路径排序后的题目列表开始，每批 10 道；输出记录放在 `docs/question-audit/`，每题标注结论、严重度、问题点和建议改法。
- 第四轮 Batch 1 已完成，记录在 `docs/question-audit/2026-05-03-batch-01-algorithm.md`。
- 第四轮 Batch 2 已完成，记录在 `docs/question-audit/2026-05-03-batch-02-algorithm-distributed.md`；主要发现是分布式题被消息队列模板污染，算法题仍有系统设计套话。
- 第四轮 Batch 3 已完成，记录在 `docs/question-audit/2026-05-03-batch-03-distributed.md`；主要发现是基础答案可用，但高阶分布式题的实战段落和追问被同一套模板抹平。
- 第四轮 Batch 4 已完成，记录在 `docs/question-audit/2026-05-03-batch-04-distributed.md`；主要发现是 Nacos、Raft、RPC、Saga、Seata、Sentinel 的主体概念可用，但专项机制和图解提示需要精修。
- 第四轮 Batch 5 已完成，记录在 `docs/question-audit/2026-05-03-batch-05-distributed-engineering.md`；主要发现是工程化题基础质量较好，分布式题仍需清理模板和补专项追问。
- 第四轮 Batch 6 已完成，记录在 `docs/question-audit/2026-05-03-batch-06-engineering.md`；主要发现是工程化题正文整体较好，但追问和图解需要专项化。
- 第四轮 Batch 7 已完成，记录在 `docs/question-audit/2026-05-03-batch-07-engineering-java.md`；主要发现是工程化题继续有专项深度不足和重复图解，`opentelemetry-three-pillars` 存在 slug/主题定位偏移，Java 题后半段被工程化模板污染。
- 第四轮 Batch 8 已完成，记录在 `docs/question-audit/2026-05-03-batch-08-java.md`；主要发现是 Java 题核心短答案多数可用，但自动扩写段落大量使用工程化通用模板，部分 `常见追问` 像占位。
- 第四轮 Batch 9 已完成，记录在 `docs/question-audit/2026-05-03-batch-09-java.md`；主要发现是泛型擦除示例丢失、HashMap 代码块拼接、Java 并发工具题追问模板化。
- 第四轮 Batch 10 已完成，记录在 `docs/question-audit/2026-05-03-batch-10-java-jvm.md`；主要发现是 Java 新特性/基础题重复图解集中，`java-time-api` 的 Date 表述不严谨，`常见追问` 多为占位。
- 第四轮 Batch 11 已完成，记录在 `docs/question-audit/2026-05-03-batch-11-java-spring.md`；主要发现是 `locksupport` 有列表拼接，读写锁/StampedLock 重复图解，并发锁题边界追问不足。
- 第四轮 Batch 12 已完成，记录在 `docs/question-audit/2026-05-03-batch-12-java.md`；主要发现是 `string-stringbuilder-stringbuffer` 缺失 `+` 符号、`string-intern` 列表拼接、线程池和 ThreadLocal 题追问需专项化。
- 第四轮 Batch 13 已完成，记录在 `docs/question-audit/2026-05-03-batch-13-java-jvm.md`；主要发现是 Java/JVM 题主体概念基本正确，但通用工程模板污染继续存在，`direct-memory` 图解截断、`g1-gc` 重复图解需要优先修。
- 第四轮 Batch 14 已完成，记录在 `docs/question-audit/2026-05-03-batch-14-jvm.md`；主要发现是 JVM 排障题基础方向正确，但 6 篇重复图解、Code Cache/类卸载/偏向锁/JIT 追问占位明显。
- 第四轮 Batch 15 已完成，记录在 `docs/question-audit/2026-05-03-batch-15-jvm.md`；主要发现是 JVM 内存/OOM 基础题较好，但 NMT、String Deduplication、TLAB、ZGC/Shenandoah 重复图解和占位追问集中。
- 第四轮 Batch 16 已完成，记录在 `docs/question-audit/2026-05-03-batch-16-mq-kafka.md`；主要发现是 MQ 基础方向可用，但 Kafka exactly once、acks、Controller、幂等生产者等高阶语义需要补机制边界。
- 第四轮 Batch 17 已完成，记录在 `docs/question-audit/2026-05-03-batch-17-mq-kafka.md`；主要发现是 offset、积压、消费幂等正文较好，但 Kafka Log Compaction、Page Cache、分区选择、事务题重复图解和机制细节不足。
- 第四轮 Batch 18 已完成，记录在 `docs/question-audit/2026-05-03-batch-18-mq.md`；主要发现是 MQ 收尾题主体方向可用，但 RocketMQ 延迟/Tag/Key、毒丸消息、乱序补偿存在重复图解、占位追问和产品细节不足。
- 第四轮 Batch 19 已完成，记录在 `docs/question-audit/2026-05-03-batch-19-mybatis.md`；主要发现是 MyBatis 基础答案整体较稳，但动态表名、ExecutorType、二级缓存坑点、SqlSession 线程安全存在重复图解、占位追问和框架边界不足。
- 第四轮 Batch 20 已完成，记录在 `docs/question-audit/2026-05-03-batch-20-mybatis-mysql.md`；主要发现是 N+1、resultMap、聚簇/二级索引内容较稳，但 TypeHandler、插件机制、冷热归档、连接池需要修重复图解、补专项机制和监控指标。
- 第四轮 Batch 21 已完成，记录在 `docs/question-audit/2026-05-03-batch-21-mysql-index.md`；主要发现是覆盖索引、ICP、B+ 树、Buffer Pool 基础较稳，但 count 题命名定位不一致、Join 算法深度不足、不可见索引和 AHI 重复图解。
- 第四轮 Batch 22 已完成，记录在 `docs/question-audit/2026-05-04-batch-22-mysql-lock-index.md`；主要发现是 EXPLAIN/索引失效/最左前缀/死锁主体较稳，但 Change Buffer、死锁日志、Skip Scan、插入意向锁、JSON 索引存在通用模板污染、重复图解和 MySQL 专项机制不足。
- 第四轮 Batch 23 已完成，记录在 `docs/question-audit/2026-05-04-batch-23-mysql-replication-sharding.md`；主要发现是 MVCC 与 redo/undo/binlog 正文较好，但主从复制、Next-Key Lock、分区表、幻读、GTID 和分库分表仍有通用模板污染、重复图解和工程边界不足。
- 第四轮 Batch 24 已完成，记录在 `docs/question-audit/2026-05-04-batch-24-mysql-sql-optimization.md`；主要发现是事务隔离正文较强，但慢 SQL、undo purge、Online DDL、直方图、读写分离延迟和临时表缺少真实命令、参数、指标和故障证据。
- 第四轮 Batch 25 已完成，记录在 `docs/question-audit/2026-05-04-batch-25-network-http-dns.md`；主要发现是 DNS 解析和 GET/POST 正文较好，但 CDN、Cookie/Session/Token、CORS、DNS 缓存、gRPC 流和 HTTP 缓存缺少协议头、安全边界、缓存策略和排障细节。
- 第四轮 Batch 26 已完成，记录在 `docs/question-audit/2026-05-04-batch-26-network-http-tcp.md`；主要发现是 HTTP/HTTPS、状态码、HTTP/2/3、TCP 握手/挥手/可靠传输正文较好，但 Keep-Alive、Range、Nagle/Delayed ACK、TIME_WAIT 仍缺协议字段、状态机和抓包排查细节。
- 第四轮 Batch 27 已完成，记录在 `docs/question-audit/2026-05-04-batch-27-network-os.md`；主要发现是 TCP/UDP、上下文切换、OS 死锁、IO 多路复用正文较好，但 TLS、WebSocket、epoll、cgroup、eBPF 仍缺真实握手字段、系统调用、内核对象和排障工具。
- 第四轮 Batch 28 已完成，记录在 `docs/question-audit/2026-05-04-batch-28-os-project.md`；主要发现是进程线程、用户态/内核态、虚拟内存正文较好，但 fd、namespace、mmap、页面置换、零拷贝和项目治理题仍缺内核路径、观测命令、指标和闭环。
- 第四轮 Batch 29 已完成，记录在 `docs/question-audit/2026-05-04-batch-29-project-api-governance.md`；主要发现是接口幂等正文较好，但接口兼容、签名、版本、审计、防篡改、灰度、容量、评论和优惠券防刷仍缺数据结构、状态机、约束、回滚和监控指标。
- 第四轮 Batch 30 已完成，记录在 `docs/question-audit/2026-05-04-batch-30-project-data-platform.md`；主要发现是全局异常处理正文较好，但优惠券、数据迁移、权限、同步、ES、功能开关、上传、网关鉴权和 Excel 导入导出仍缺状态机、失败补偿、安全校验和清理计划。
- 第四轮 Batch 31 已完成，记录在 `docs/question-audit/2026-05-04-batch-31-project-transactions-identity.md`；主要发现是 JWT 正文较好，但故障复盘、库存、调度、多地域、多租户、通知、OAuth/OIDC、订单状态机仍缺状态流转、协议参数、故障演练和补偿闭环。
- 第四轮 Batch 32 已完成，记录在 `docs/question-audit/2026-05-04-batch-32-project-search-payment.md`；主要发现是分页和 RBAC 正文较好，但支付、压测、对账、Runbook、搜索联想、站内搜索和相关性仍缺资金状态、压测模型、差错处理、Runbook 可执行步骤和搜索评估指标。
- 第四轮 Batch 33 已完成，记录在 `docs/question-audit/2026-05-04-batch-33-project-redis-cache.md`；主要发现是秒杀、布隆过滤器、缓存一致性正文较好，但敏感数据脱敏、SLO/SLI、SSO、Webhook、Bitmap/HLL、Cache Aside、缓存击穿仍缺数据分级、错误预算、协议流、命令参数和竞态窗口。
- 第四轮 Batch 34 已完成，记录在 `docs/question-audit/2026-05-04-batch-34-redis-cluster-cache.md`；主要发现是 Redis Cluster、ACL、输出缓冲区和缓存预热/降级题方向正确但缺命令、参数、状态机和线上排查证据，5 篇重复 `## 图解提示`。
- 第四轮 Batch 35 已完成，记录在 `docs/question-audit/2026-05-04-batch-35-redis-structures-tools.md`；主要发现是 Redis 数据结构、分布式锁、过期淘汰和持久化正文较好，但 GEO、key 设计、Lua、Pipeline、quicklist/listpack 需要补命令、内部编码和风险边界。
- 第四轮 Batch 36 已完成，记录在 `docs/question-audit/2026-05-04-batch-36-redis-ops-semantics.md`；主要发现是 Redis 限流、SCAN、SlowLog、Stream、事务、UNLINK 和 RedLock 需要补语义边界、争议点、失败补偿和运维命令。
- 第四轮 Batch 37 已完成，记录在 `docs/question-audit/2026-05-04-batch-37-redis-spring-basics.md`；主要发现是 Redis ZSet 排行榜和 Spring 基础题主体可用，但容器扩展点、条件装配、配置优先级和 FactoryBean 需要补生命周期位置和源码级术语。
- 第四轮 Batch 38 已完成，记录在 `docs/question-audit/2026-05-04-batch-38-spring-web-boot-aop.md`；主要发现是 Filter/Interceptor/AOP、Bean 生命周期和自动配置主线较好，但事务事件、`@Async`、自定义 Starter、启动流程需要补代理边界、线程池和 Boot 3 机制。
- 第四轮 Batch 39 已完成，记录在 `docs/question-audit/2026-05-04-batch-39-spring-cache-mvc-security.md`；主要发现是 Spring MVC 流程和 Security 基础较好，但 Cache、ConfigurationProperties、Import、参数解析器、消息转换器和 Scheduled 需要补调用链、状态码和生产坑位。
- 第四轮 Batch 40 已完成，记录在 `docs/question-audit/2026-05-04-batch-40-spring-security-transaction-webflux.md`；主要发现是事务失效、Starter 和传播行为较好，但 JWT、Validation、WebClient、事务隔离/readOnly/rollback、WebFlux 需要补安全链路、数据库映射和响应式边界。
- 第四轮题目质检已完成按文件路径排序第 1-400 题，下一阶段建议按 P1 优先级批量修正文、`## 图解提示` 和 visual 节点截断。
- 第五轮 Batch 34 修复已完成，范围为按文件路径排序第 331-340 题；已重写 Redis Cluster/cache 10 篇的 `详细讲解`、`常见追问`、`图解提示` 和 visual 节点，修复重复图解、模板污染和截断标签。修复进度记录在 `content/question-repair-progress.json`。
- 第五轮 Batch 35 修复已完成，范围为 Redis 数据结构与工具机制第 341-350 题；已重写 10 篇 `详细讲解`、`常见追问`、`图解提示` 和 visual 节点，重点补 Redis 命令、参数、内部编码、不能用的边界和线上观测方式。
- 第五轮 Batch 36 修复已完成，范围为 Redis 运维与语义机制第 351-360 题；已重写 10 篇 `详细讲解`、`常见追问`、`图解提示` 和 visual 节点，重点补限流算法、SCAN cursor 语义、主从/哨兵/Cluster 边界、SlowLog、Stream PEL、事务回滚边界、UNLINK lazy free 和 RedLock 争议。
- 第五轮 Batch 37 修复已完成并复核，范围为 Redis 排行榜与 Spring 基础第 361-370 题；已修正 Spring 文件误带 Redis 通用尾段的问题，重跑后 10 篇均通过专用校验脚本。
- 第五轮 Batch 38 修复已完成，范围为 Spring Web、Boot 与 AOP 第 371-380 题；已重写 10 篇 `详细讲解`、`常见追问`、`图解提示` 和 visual 节点，重点补 Filter/Interceptor/AOP 顺序、Actuator 安全、事务事件阶段、`@Async` 线程池上下文、Bean 生命周期、Boot 3 自动配置、自定义 Starter 和启动流程。
- 第五轮 Batch 39 修复已完成，范围为 Spring Cache、MVC 扩展与 Security 第 381-390 题；已重写 10 篇 `详细讲解`、`常见追问`、`图解提示` 和 visual 节点，重点补 Cache key/TTL/事务后失效、配置绑定、事件边界、Import 三路径、MVC 参数解析、消息转换、Profile、Scheduled 和 Security 过滤器链。
- 第五轮 Batch 40 修复已完成，范围为 Spring Security、事务与 WebFlux 第 391-400 题；已重写 10 篇 `详细讲解`、`常见追问`、`图解提示` 和 visual 节点，重点补 JWT 过滤器链、事务失效/隔离/传播/readOnly/回滚边界、Validation 分组嵌套、WebClient 响应式边界、Starter 分工和 WebFlux 选型。
- 第五轮 Batch 34-40 已全部复核通过：`node scripts/validate-repair-batch.mjs 34` 至 `40` 均通过；`npm run lint` 通过；`npm run build` 通过，Next.js 成功生成 430 个页面。
- 2026-05-05 已补齐第五轮剩余 Batch 1-33：新增 `scripts/repair-remaining-batches.mjs` 批量清理前 330 题的通用模板污染、重复 `## 图解提示`、追问不足和 visual 截断标签。
- 新增 `scripts/validate-all-repairs.mjs` 和 `npm run validate:content`，用于一次性验证 40 个修复批次。
- 第五轮 Batch 1-40 已全部通过内容校验：每篇 `详细讲解` 1000-2000 字符、每篇 4 个 `常见追问`、每篇 1 个 `## 图解提示`、每题 6 个 visual 节点且无截断标签。
- 最终收尾验证已完成：`npm run validate:content`、`npm run lint`、`npm run build` 均通过；lint warning 已清零，Next.js 成功生成 430 个页面。
- 运行时加固已完成：`ensureDb()` 初始化失败后允许后续重试；学习行为 API 已拒绝不存在题目的 slug，避免前台写入脏互动数据。加固后 `validate:content/lint/build` 均通过。
- 依赖安全加固已完成：通过 npm overrides 将 Next 内部 PostCSS 从 vulnerable `8.4.31` 提升到 `8.5.10`；官方 registry `npm audit --omit=dev` 已为 0 vulnerabilities，构建验证通过。
- 数据库诊断命令已补齐：新增 `npm run check:db`，用于检查 PostgreSQL 连接和核心表初始化状态；当前环境明确失败在 55432 端口未监听。
- 后台管理 API 已补齐存在性校验：用户、管理员、评论、笔记、用户行为、题目行为的无效目标不再返回假成功；PATCH 空字段和非法状态类型会提前拒绝。
- 数据巡检修复接口改为服务端读取 `getQuestionMetas()` 生成有效 slug 列表，不再信任前端传入的 `validSlugs`；前端一键修复按钮也不再提交题库 slug。
- Markdown 页面继续使用 `dangerouslySetInnerHTML` 承接 unified 输出，但输出前必须经过 `rehype-sanitize`；标题锚点和代码高亮放在 sanitize 之后由本地可信插件生成。
- 第六轮不再做“400 篇统一重写”，而是做“定向提质”：优先清理机械模板感、增强专题差异、补真实命令/指标/状态流和项目表达，让内容从“能看”升级到“更像面试辅导材料”。
- 第六轮的独立执行方案记录在 `docs/plans/2026-05-11-content-optimization-round6-plan.md`，建议按“高频基础题 -> 中间件/数据库 -> 项目设计题 -> 长尾专题”的顺序推进，每批 20 篇。
- 第六轮 Batch 1 已完成：通过 `scripts/optimize-round6-batch1.py` 批量更新 20 篇 Java 高频题的 `一句话结论`、`面试回答`、`常见追问`、`图解提示`，重点去掉追问模板味并补监控、容量、边界、排障抓手。
- 第六轮 Batch 1 校验已完成：`npm run validate:content` 通过。`npm run build` 失败，但失败点位于既有 TypeScript 问题 `src/components/personal-center.tsx:588`，与本次内容改动无关。

## Errors Encountered
- `Get-Content src\app\questions\[slug]\page.tsx` 被 PowerShell 当作通配符路径解析，改用 `-LiteralPath`。
- `docker compose up -d postgres` 无法连接 Docker Desktop Linux Engine；后续确认是 Docker Desktop daemon 无法启动，`com.docker.service` 又受 Windows 权限限制无法启动。
- 本机 PostgreSQL 17 可监听 5432，但 `you_deserve` 和 `postgres` 两个账号都不能用示例密码连接，导致数据库烟测无法在当前凭据下完成。
