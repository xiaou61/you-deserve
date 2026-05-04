import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const visualPath = path.join(root, "content", "visuals", "question-visuals.json");
const progressPath = path.join(root, "content", "question-repair-progress.json");

const batch34 = [
  {
    file: "content/questions/redis/cache-preheat-degrade.md",
    slug: "cache-preheat-degrade",
    visual: {
      type: "flow",
      title: "缓存预热和缓存降级：执行闭环图",
      summary: "预热负责在流量前装好热点缓存，降级负责在缓存异常时保护核心链路和数据库。",
      nodes: [
        ["识别热点数据", "来自历史访问、运营配置、活动商品、配置字典"],
        ["限速批量预热", "分批查库写 Redis，避免预热任务打爆 DB"],
        ["校验命中率", "抽样读取缓存，观察命中率、失败数和容量"],
        ["监控缓存异常", "关注 Redis 延迟、错误率、连接池和命中率"],
        ["打开降级开关", "非核心功能返回默认值、只读结果或本地缓存"],
        ["恢复和回补", "缓存恢复后逐步关闭降级并补偿缺失数据"]
      ],
      prompt: "画一张流程图：识别热点数据 -> 限速批量预热 -> 校验命中率 -> 监控缓存异常 -> 打开降级开关 -> 恢复和回补。突出预热防冷启动、降级防故障扩散，并标出 DB 保护和恢复条件。",
      takeaway: "预热解决开场冷缓存，降级解决缓存层失守。"
    },
    detail: [
      "缓存预热和缓存降级经常被放在一起问，但它们解决的是两个不同阶段的问题。预热发生在流量高峰之前，目标是把可预测的热点数据提前放进 Redis，避免活动开始、系统重启或发布后第一波请求全部回源数据库。降级发生在缓存层变慢、不可用或命中率突然下降之后，目标是牺牲一部分体验或非核心功能，保护数据库和核心接口不被拖垮。",
      "预热不是全量导入。真正可落地的预热要先确定热点来源，例如历史 TOP N、运营配置的活动商品、首页推荐位、字典配置、库存快照或搜索高频词。执行时要分批、限速、可重试，写入 Redis 时要带版本和 TTL，TTL 最好加随机抖动，避免预热后的 key 在同一时间集中失效。预热任务本身也要受连接池和 QPS 控制，否则它会在业务流量到来前先把数据库打满。",
      "降级也不是简单返回空。降级要按业务分级：核心链路如支付、下单、库存确认通常只能限流或排队，不能随便返回假数据；非核心链路如排行榜、推荐、统计角标可以返回默认值、旧缓存、本地缓存或静态兜底。比较成熟的方案会把降级做成开关，支持按接口、租户、场景、比例开启，并记录每次降级命中的原因和用户影响。",
      "线上验证要看缓存命中率、Redis 延迟、Redis 错误率、DB QPS、DB 慢查询、接口 P95/P99、预热成功数和预热失败数。预热完成后不要只看任务成功，要抽样读缓存并确认版本正确；降级开启后也不能只看错误率下降，还要确认数据库连接池恢复、核心接口成功率恢复、降级结果没有造成数据错误。",
      "面试回答可以按“预热前置、降级兜底、监控闭环”组织。先说明预热保护冷启动，降级保护故障期；再讲热点识别、批量写入、TTL 抖动、失败重试；然后补业务分级、降级开关、本地缓存和默认值；最后用命中率、DB QPS、P99、错误率证明方案有效。这样就不是背概念，而是把缓存治理讲成完整链路。"
    ],
    followups: [
      ["预热数据从哪里来？", "常见来源是历史访问排行、运营活动配置、搜索热词、配置字典和即将上线的活动库存。不要全量预热，要按热点、核心程度和容量上限筛选。"],
      ["预热任务会不会打爆数据库？", "会，所以必须分批、限速、错峰，并控制连接池和并发数。预热失败要可重试、可跳过、可告警，不能让预热任务抢占线上主链路资源。"],
      ["降级时能不能直接返回默认值？", "要看业务等级。推荐、统计、榜单可以返回默认值或旧值；支付、库存、风控这类强一致链路更适合限流、排队或快速失败。"],
      ["怎么证明预热和降级有效？", "预热看命中率、预热成功数、冷启动 DB QPS；降级看核心接口成功率、DB 连接池、P99、错误率和降级命中量是否按预期变化。"]
    ]
  },
  {
    file: "content/questions/redis/cache-warming.md",
    slug: "cache-warming",
    visual: {
      type: "flow",
      title: "缓存预热：从热点识别到命中验证",
      summary: "缓存预热是在流量到来前把热点数据提前写入缓存，重点是选对数据、限速执行和验证命中。",
      nodes: [
        ["确定预热范围", "活动商品、首页内容、字典配置、搜索热词"],
        ["生成预热任务", "按批次、优先级和版本组织任务"],
        ["限速读取数据库", "保护 DB，避免预热成为流量洪峰"],
        ["写入 Redis", "设置 TTL、版本号和随机过期"],
        ["抽样校验缓存", "读回 key，检查命中率和数据版本"],
        ["失败重试告警", "失败进入重试队列并触发告警"]
      ],
      prompt: "画一张流程图：确定预热范围 -> 生成预热任务 -> 限速读取数据库 -> 写入 Redis -> 抽样校验缓存 -> 失败重试告警。突出预热不是全量导入，而是受控地加载热点数据。",
      takeaway: "预热的关键不是提前写缓存，而是受控地写对热点。"
    },
    detail: [
      "缓存预热指在真实流量到来之前，把确定会被高频访问的数据提前加载到缓存里。它最典型的场景是秒杀、大促、首页推荐、系统重启、版本发布和配置字典加载。如果没有预热，第一波请求都会缓存未命中，然后同时访问数据库，轻则接口抖动，重则数据库连接池被打满，活动刚开始就进入故障状态。",
      "预热的第一步是选范围。不是所有数据都值得预热，真正应该预热的是高频、核心、可预测的数据。例如秒杀商品详情、库存快照、活动规则、首页热门列表、城市字典、会员等级配置。低频数据全量预热会浪费内存和数据库 IO，还可能把真正热点挤出缓存。预热范围最好带版本号或批次号，方便发布回滚和数据校验。",
      "第二步是执行控制。预热任务通常由启动任务、定时任务、运营触发或消息触发，但无论哪种方式，都要限制并发和速率。批量查库要分页，写 Redis 要控制 pipeline 大小，TTL 要加随机抖动，失败要进入重试队列。活动类预热还要考虑开场前完成度，必要时按核心数据优先预热，非核心数据延迟加载。",
      "第三步是验证。很多团队只看“任务跑完了”，但这不等于缓存真的可用。更稳的做法是抽样读取 Redis，检查 key 是否存在、value 版本是否正确、TTL 是否合理，再观察活动开始后的缓存命中率、DB QPS、接口 P99 和错误率。如果预热后命中率仍然低，说明热点范围、key 规则或业务读路径可能不一致。",
      "预热失败要有兜底。比如活动开始前预热完成率低于阈值，可以延迟开场、降低入口流量、只开放部分用户、启用本地缓存或直接走排队页。面试里可以强调：缓存预热不是“提前塞数据”这么简单，而是一套从热点识别、受控写入、版本校验到失败降级的发布保障机制。"
    ],
    followups: [
      ["缓存预热适合所有系统吗？", "不适合。只有热点可预测、冷启动压力明显、数据库回源成本高的场景收益明显。普通低频查询不需要复杂预热。"],
      ["预热和懒加载有什么区别？", "懒加载是请求来了再查库回填，简单但冷启动会抖；预热是流量前主动加载，复杂但能保护开场高峰。"],
      ["预热数据更新了怎么办？", "要带版本或更新时间，发布时按新版本写入，旧版本逐步过期；重要数据还要在写库后删缓存或重新预热。"],
      ["如何避免大量 key 同时过期？", "TTL 加随机抖动，热点 key 可用逻辑过期加异步刷新，活动结束后再按节奏清理。"]
    ]
  },
  {
    file: "content/questions/redis/cluster-moved-ask.md",
    slug: "redis-cluster-moved-ask",
    visual: {
      type: "sequence",
      title: "MOVED 与 ASK：Redis Cluster 重定向时序",
      summary: "MOVED 要刷新槽位路由，ASK 只是在迁移期间临时访问目标节点。",
      nodes: [
        ["客户端算 slot", "按 CRC16 和 hash tag 计算 key 所属槽"],
        ["访问旧节点", "本地 slot cache 可能已经过期"],
        ["返回 MOVED", "槽已归属新节点，客户端刷新路由"],
        ["返回 ASK", "槽正在迁移，客户端只临时访问目标节点"],
        ["发送 ASKING", "ASK 场景先向目标节点发送 ASKING"],
        ["重试业务命令", "执行命令后不立即永久修改槽映射"]
      ],
      prompt: "画一张时序图：客户端算 slot -> 访问旧节点 -> 返回 MOVED 或 ASK -> MOVED 刷新路由 -> ASK 先发送 ASKING -> 重试业务命令。突出永久重定向和临时重定向的区别。",
      takeaway: "MOVED 改通讯录，ASK 只临时问路。"
    },
    detail: [
      "Redis Cluster 用 16384 个 hash slot 做数据分片，客户端先根据 key 计算槽位，再根据本地 slot cache 找到负责这个槽的节点。MOVED 和 ASK 都是客户端访问了不合适的节点后收到的重定向响应，但语义不同：MOVED 表示槽位已经永久归属到另一个节点，ASK 表示槽位正在迁移中，目标节点只是临时接受这次请求。",
      "MOVED 通常出现在扩容、缩容、reshard 或客户端路由缓存过期之后。节点返回 `MOVED slot host:port`，意思是这个槽现在由另一个节点负责。成熟客户端收到 MOVED 后，会更新本地槽位映射，常见做法是重新拉取 `CLUSTER SLOTS` 或局部更新 slot cache。之后同一槽位的请求就应该直接去新节点，而不是每次都先打旧节点。",
      "ASK 出现在槽迁移过程中。迁移时源节点可能处于 migrating 状态，目标节点处于 importing 状态，有些 key 已经迁到目标节点，有些还在源节点。节点返回 `ASK slot host:port` 时，客户端应该临时去目标节点访问一次，并且在业务命令前先发送 `ASKING`。关键点是 ASK 不代表槽位永久迁走，所以客户端不应该立刻刷新整个 slot cache。",
      "这道题的易错点是只说“都是重定向”。实际落地时，MOVED 影响后续路由，ASK 只影响本次请求；MOVED 可以触发槽位缓存更新，ASK 必须配合 ASKING；MOVED 多说明客户端路由表旧了，ASK 多说明集群正在迁移槽。pipeline 和 multi-key 操作还要额外注意跨槽限制，涉及多个 key 时最好使用 hash tag 让相关 key 落到同一槽。",
      "排查时可以看客户端日志里的 MOVED/ASK 次数、重试次数、`CLUSTER NODES`、`CLUSTER SLOTS`、迁移期间的 importing/migrating 状态和请求延迟。如果 MOVED 长时间大量出现，可能是客户端不支持 Cluster、slot cache 不刷新或代理层路由异常；如果 ASK 增多，则要确认是否正在 reshard，以及客户端是否正确发送 ASKING。"
    ],
    followups: [
      ["MOVED 和 ASK 最大区别是什么？", "MOVED 是永久槽位归属变化，要更新客户端路由；ASK 是迁移期间临时访问目标节点，不应永久更新槽位表。"],
      ["ASK 为什么要先发 ASKING？", "目标节点处于 importing 状态，默认不会随便接收不归自己负责的槽。ASKING 是告诉目标节点这次请求来自合法迁移重定向。"],
      ["客户端需要自己处理这些响应吗？", "成熟 Redis Cluster 客户端通常会自动处理，但业务要配置正确的 cluster mode，并关注重试次数和拓扑刷新策略。"],
      ["多 key 命令为什么容易出问题？", "Cluster 要求一个命令涉及的多个 key 通常在同一 slot，跨槽会报错。可以用 hash tag 把相关 key 放到同一槽。"]
    ]
  },
  {
    file: "content/questions/redis/memory-fragmentation.md",
    slug: "redis-memory-fragmentation",
    visual: {
      type: "structure",
      title: "Redis 内存碎片：指标与处理路径",
      summary: "内存碎片是 allocator/RSS 占用高于 Redis 实际数据内存，处理时要先判断再治理。",
      nodes: [
        ["查看 used_memory", "Redis 数据实际占用内存"],
        ["对比 used_memory_rss", "进程向操作系统申请的常驻内存"],
        ["计算碎片率", "关注 mem_fragmentation_ratio"],
        ["识别大 key 变动", "大 value 频繁扩缩容易产生空洞"],
        ["启用主动整理", "评估 activedefrag 和 CPU 成本"],
        ["迁移或重启", "低峰期迁移实例释放 RSS"]
      ],
      prompt: "画一张结构图：查看 used_memory -> 对比 used_memory_rss -> 计算碎片率 -> 识别大 key 变动 -> 启用主动整理 -> 迁移或重启。突出先看指标再治理。",
      takeaway: "碎片率高不是数据多，而是内存空洞多。"
    },
    detail: [
      "Redis 内存碎片指 Redis 实际保存的数据没有那么大，但进程向操作系统占用的 RSS 仍然很高。常见观察方式是对比 `used_memory` 和 `used_memory_rss`，再看 `mem_fragmentation_ratio`。如果 used_memory 下降了，但 RSS 长时间不降，通常说明内存分配器内部产生了空洞，或者操作系统还没有把内存归还。",
      "碎片的来源和 Redis 的内存分配模式有关。Redis 默认常用 jemalloc 这类分配器，小对象会按规格分配内存。频繁创建、删除、扩容、缩容不同大小的 value，会让内存中出现很多无法立即复用的小空洞。大 Hash、大 List、大 String 反复修改尤其容易放大这个问题，因为 value 大小变化会导致重新分配和释放。",
      "判断碎片要谨慎。`mem_fragmentation_ratio` 偏高不一定总是坏事，小实例、fork、复制缓冲、客户端缓冲、AOF rewrite、RDB bgsave 都可能影响 RSS。排查时要结合 `INFO memory`、`MEMORY STATS`、big key 扫描、客户端输出缓冲区和后台任务。不要看到 ratio 高就立刻重启，否则可能忽略真正的内存增长来源。",
      "治理手段有几类。第一是减少大 key 和频繁变长 value，把大对象拆成多个小 key 或分桶结构；第二是开启或调优主动碎片整理，如 `activedefrag yes`，但它会消耗 CPU，要在延迟敏感场景谨慎评估；第三是在低峰期做主从切换、迁移或重启，让进程重新申请连续内存；第四是设置合理 maxmemory 和淘汰策略，避免内存长期打满后碎片问题扩大。",
      "面试里可以这样收束：Redis 内存碎片不是缓存数据本身多，而是分配器占住的内存和数据实际占用不匹配。线上要先看 `used_memory`、`used_memory_rss`、`mem_fragmentation_ratio` 和 `MEMORY STATS`，再判断是碎片、大 key、缓冲区还是后台 fork 引起。处理上优先治理大 key 和写入模式，必要时再开主动整理或迁移重启。"
    ],
    followups: [
      ["mem_fragmentation_ratio 多高算异常？", "没有绝对值，要结合实例大小和业务波动看。长期明显高于 1.5 且 RSS 不下降时需要重点分析。"],
      ["为什么删除 key 后内存没降？", "Redis 数据内存下降不代表 RSS 立即归还给操作系统，分配器可能保留内存用于后续复用，也可能存在碎片。"],
      ["activedefrag 能随便开吗？", "不能。主动碎片整理会消耗 CPU，延迟敏感业务要灰度开启并观察 CPU、P99 和碎片率变化。"],
      ["重启是不是最简单？", "重启或主从切换能释放碎片，但有可用性风险。应放在低峰期，并先确认不是大 key、输出缓冲或后台任务导致的 RSS 高。"]
    ]
  },
  {
    file: "content/questions/redis/pubsub-vs-stream.md",
    slug: "redis-pubsub-vs-stream",
    visual: {
      type: "compare",
      title: "Pub/Sub vs Stream：广播和消息流对比",
      summary: "Pub/Sub 强调在线实时广播，Stream 强调消息持久化、消费组和确认。",
      nodes: [
        ["Pub/Sub 实时广播", "订阅者在线才收到消息"],
        ["Pub/Sub 不保留", "断线期间消息不可重放"],
        ["Stream 追加消息", "XADD 写入可持久化消息流"],
        ["消费组分摊", "XREADGROUP 支持多消费者协作"],
        ["PEL 和 XACK", "记录已投递未确认消息"],
        ["按可靠性选择", "广播通知用 Pub/Sub，轻量队列用 Stream"]
      ],
      prompt: "画一张对比图：Pub/Sub 实时广播、Pub/Sub 不保留、Stream 追加消息、消费组分摊、PEL 和 XACK、按可靠性选择。突出是否持久化、是否可重放、是否支持确认。",
      takeaway: "Pub/Sub 像直播，Stream 像可追溯的消息账本。"
    },
    detail: [
      "Redis Pub/Sub 和 Stream 都能做消息分发，但设计目标完全不同。Pub/Sub 是实时广播模型，发布者把消息发到 channel，当前在线订阅这个 channel 的客户端会收到；如果订阅者不在线、网络断开或处理太慢，Redis 不会为它保存历史消息。Stream 是 Redis 5 引入的消息流结构，消息会追加到 stream 里，有 ID、有保留策略，也支持消费者组和确认机制。",
      "Pub/Sub 的优点是简单、低延迟、模型清楚，适合在线通知、配置刷新、缓存失效广播、聊天室在线消息等场景。它的限制也很明显：没有持久化语义、没有消费确认、没有重放、没有消费进度管理。订阅者掉线期间的消息就是丢了，所以不要拿 Pub/Sub 做订单、支付、库存这类必须可靠处理的业务消息。",
      "Stream 更像轻量消息队列。生产者用 `XADD` 追加消息，消费者可以用 `XREAD` 读取，也可以用 `XREADGROUP` 以消费组方式分摊消息。每条投递给消费者但还没确认的消息会进入 PEL，消费者处理完成后用 `XACK` 确认。消费者宕机后，可以通过 `XPENDING`、`XAUTOCLAIM` 等机制把长时间未确认的消息转给其他消费者处理。",
      "Stream 也不是完整 Kafka 替代。它仍然运行在 Redis 内存模型上，容量、持久化、主从复制、AOF/RDB 策略都会影响可靠性和成本。大规模日志流、长时间保留、多分区高吞吐、严格顺序和跨机房复制，通常还是 Kafka、Pulsar 这类消息系统更合适。Stream 更适合中小规模、低运维成本、和 Redis 体系强相关的异步任务或事件流。",
      "面试时可以按三个维度对比：第一，是否保存消息，Pub/Sub 不保存，Stream 保存；第二，是否有消费进度，Pub/Sub 没有，Stream 有消费者组、PEL 和 ACK；第三，失败后能否补偿，Pub/Sub 掉线丢消息，Stream 可以重读或转移未确认消息。图解就画成两条泳道：Pub/Sub 是 publish 后在线订阅者立即收到；Stream 是 XADD 进入消息流，消费者组读取、处理、ACK。"
    ],
    followups: [
      ["Pub/Sub 能保证消息不丢吗？", "不能。订阅者不在线、连接断开或处理异常时，历史消息不会为它保留。"],
      ["Stream 的 PEL 是什么？", "PEL 是 Pending Entries List，记录已经投递给消费者但还没 XACK 的消息，用于失败转移和排查积压。"],
      ["Stream 适合替代 Kafka 吗？", "只适合轻量场景。大规模高吞吐、长周期保留、多分区治理和跨机房复制仍更适合 Kafka 等专业 MQ。"],
      ["怎么选择 Pub/Sub 和 Stream？", "只要在线广播和低延迟，用 Pub/Sub；需要持久化、确认、重放和消费组，用 Stream。"]
    ]
  },
  {
    file: "content/questions/redis/redis-acl.md",
    slug: "redis-acl",
    visual: {
      type: "structure",
      title: "Redis ACL：用户、命令和 key 范围",
      summary: "Redis ACL 用用户维度限制命令、key pattern、频道和密码，核心是最小权限。",
      nodes: [
        ["创建独立用户", "为不同应用或角色拆分账号"],
        ["设置密码和状态", "on/off 与多密码轮换"],
        ["限制命令类别", "+@read、+@write、-FLUSHALL"],
        ["限制 key pattern", "用 ~app:* 控制可访问 key"],
        ["限制频道权限", "用 &channel 控制 Pub/Sub 范围"],
        ["审计和轮换", "定期 ACL LIST、ACL LOG 和密钥轮换"]
      ],
      prompt: "画一张结构图：创建独立用户 -> 设置密码和状态 -> 限制命令类别 -> 限制 key pattern -> 限制频道权限 -> 审计和轮换。突出最小权限和危险命令隔离。",
      takeaway: "Redis ACL 的核心是把用户、命令、key 范围一起收紧。"
    },
    detail: [
      "Redis ACL 是 Redis 6 之后的重要安全能力，用来按用户控制能执行哪些命令、能访问哪些 key、能订阅哪些 channel。早期 Redis 主要依赖一个全局密码，多个应用共享同一套权限，一旦某个应用泄露密码或误执行危险命令，影响面很大。ACL 的价值是把“谁能做什么”拆细，做到最小权限。",
      "ACL 的配置可以用 `ACL SETUSER` 表达。比如给只读应用创建用户时，可以设置用户状态为 `on`，配置密码，再允许 `+@read`，禁止危险命令如 `-FLUSHALL`、`-CONFIG`，并用 `~app:read:*` 限制只能访问某个业务前缀的 key。对于 Pub/Sub，还可以用 `&channel` 限制频道范围。这样不同应用即使共享同一个 Redis，也不会拥有完全相同的操作能力。",
      "生产使用时要注意默认用户。很多集群为了兼容旧客户端，会保留 default 用户，如果 default 用户权限过大，ACL 的隔离效果会被削弱。更稳的做法是禁用或收紧 default 用户，为每个应用创建独立账号，并定期轮换密码。密码轮换时可以短期配置多个密码，先发布客户端新密码，再移除旧密码，避免一次性切换造成全站连接失败。",
      "ACL 不是数据隔离的全部。key pattern 只能按 key 名约束访问范围，如果业务 key 命名混乱、多个租户混在同一前缀，ACL 很难精确保护。所以 ACL 要和 key 设计规范、环境隔离、租户前缀、危险命令禁用和审计日志配合。对强隔离要求高的场景，还应该使用独立实例或独立集群，而不是只靠 ACL。",
      "排查和验证可以用 `ACL LIST` 查看用户规则，用 `ACL WHOAMI` 确认当前连接身份，用 `ACL LOG` 查看被拒绝的命令和原因。面试里可以强调：Redis ACL 解决的是 Redis 访问面的最小权限问题，不是替代网络隔离和应用鉴权。真正落地要做到独立用户、命令白名单、key 范围、密码轮换、审计告警一起闭环。"
    ],
    followups: [
      ["Redis ACL 和 requirepass 有什么区别？", "requirepass 更像全局密码，ACL 可以按用户限制命令、key pattern、频道和密码，更适合多应用共享实例。"],
      ["怎么禁止危险命令？", "可以在 ACL 中去掉危险命令权限，例如 `-FLUSHALL`、`-CONFIG`、`-KEYS`，也可以按命令类别控制。"],
      ["key pattern 能完全保证多租户隔离吗？", "不能。它依赖 key 命名规范，强隔离场景更适合独立实例或独立集群。"],
      ["密码轮换怎么做更稳？", "先给用户增加新密码，发布客户端使用新密码，确认连接稳定后再删除旧密码，并观察 ACL LOG 和连接错误率。"]
    ]
  },
  {
    file: "content/questions/redis/redis-cache-penetration.md",
    slug: "redis-cache-penetration-breakdown-avalanche",
    visual: {
      type: "compare",
      title: "缓存穿透、击穿、雪崩：故障路径对比",
      summary: "穿透是不存在数据打 DB，击穿是热点 key 过期打 DB，雪崩是大量 key 或缓存层同时失效。",
      nodes: [
        ["缓存穿透", "查不存在数据，缓存和 DB 都 miss"],
        ["空值和布隆", "缓存空结果或用 BloomFilter 拦截"],
        ["缓存击穿", "热点 key 失效，大量请求同时回源"],
        ["互斥和逻辑过期", "单线程重建或返回旧值异步刷新"],
        ["缓存雪崩", "大量 key 过期或 Redis 整体故障"],
        ["分散过期和降级", "TTL 抖动、限流、预热和兜底"]
      ],
      prompt: "画一张三列对比图：缓存穿透 -> 空值和布隆；缓存击穿 -> 互斥和逻辑过期；缓存雪崩 -> 分散过期和降级。突出请求如何打到数据库以及对应保护手段。",
      takeaway: "穿透是假 key，击穿是热 key，雪崩是一大片 key。"
    },
    detail: [
      "缓存穿透、击穿、雪崩都表现为数据库压力上升，但触发路径不同。缓存穿透是请求的数据本来就不存在，缓存查不到，数据库也查不到；攻击者如果构造大量随机 ID，每次都绕过缓存打到数据库，缓存层就失去保护作用。解决穿透常用空值缓存和布隆过滤器，空值缓存要设置较短 TTL，布隆过滤器要注意误判率和容量规划。",
      "缓存击穿针对的是热点 key。这个 key 平时访问量很大，缓存命中时数据库很轻松；一旦 key 在高峰期过期，大量请求同时发现 miss，然后一起查库重建缓存，数据库就会出现尖刺。解决击穿的关键是保护重建过程，可以用互斥锁做双重检查，只允许一个请求回源；也可以用逻辑过期，让请求先返回旧值，由后台异步刷新。",
      "缓存雪崩是更大范围的失效。它可能来自大量 key 设置了相同 TTL 后集中失效，也可能来自 Redis 节点故障、网络抖动、连接池耗尽或缓存集群整体不可用。雪崩的治理要系统化：TTL 加随机抖动，热点数据提前预热，Redis 做高可用，服务层限流熔断，非核心接口降级，数据库连接池和慢查询也要有保护。",
      "项目排查时可以从指标区分三者。穿透通常是不合法 key 或不存在 ID 增多，缓存命中率下降但 DB 返回空结果很多；击穿通常是某个热点 key 过期点附近 DB QPS 突刺；雪崩通常是整体命中率骤降、多个接口 P99 上升、DB 连接池被打满。能说出这些现象，说明你不是只背三种名字。",
      "回答时按请求路径最清楚：请求先查缓存，miss 后查数据库，查到再回填。穿透的问题是数据库也查不到；击穿的问题是热点 key 的回填没有被保护；雪崩的问题是大量 key 或缓存层同时不可用。图解可以画三条路径，再把空值/布隆、互斥/逻辑过期、随机 TTL/降级分别挂上去。"
    ],
    followups: [
      ["布隆过滤器能彻底解决穿透吗？", "不能。布隆过滤器有误判，且容量超过设计值后误判率会上升，所以还要配合空值缓存、限流和参数校验。"],
      ["互斥锁解决击穿有什么坑？", "要设置锁过期时间，获取锁后再双重检查缓存，失败请求要等待、降级或返回旧值，避免锁本身成为瓶颈。"],
      ["雪崩只靠 TTL 随机化够吗？", "不够。TTL 抖动只能解决集中失效，还要考虑 Redis 故障、高可用、限流、熔断、降级和数据库保护。"],
      ["这些方案如何验证？", "看缓存命中率、DB QPS、热点 key 访问量、接口 P99、错误率和降级命中量，并用压测模拟 key 过期和 Redis 异常。"]
    ]
  },
  {
    file: "content/questions/redis/redis-client-output-buffer.md",
    slug: "redis-client-output-buffer",
    visual: {
      type: "flow",
      title: "Redis 输出缓冲区爆掉：原因和排查",
      summary: "输出缓冲区爆掉通常是 Redis 产生响应快于客户端消费，常见于大查询、慢网络和 Pub/Sub 慢订阅者。",
      nodes: [
        ["Redis 生成响应", "大查询或订阅消息产生大量返回数据"],
        ["客户端消费变慢", "网络慢、业务线程阻塞或订阅者处理慢"],
        ["输出缓冲堆积", "obl、oll、omem 指标持续上涨"],
        ["触发限制断开", "client-output-buffer-limit 生效"],
        ["定位慢客户端", "CLIENT LIST、日志、网络和业务线程"],
        ["限流和拆分", "限制大查询、隔离订阅者、拆分返回"]
      ],
      prompt: "画一张流程图：Redis 生成响应 -> 客户端消费变慢 -> 输出缓冲堆积 -> 触发限制断开 -> 定位慢客户端 -> 限流和拆分。突出问题常在客户端消费慢。",
      takeaway: "输出缓冲区爆，不一定是 Redis 慢，常常是客户端接不动。"
    },
    detail: [
      "Redis 客户端输出缓冲区保存的是 Redis 已经生成、但客户端还没有读取走的响应数据。正常情况下响应很快被客户端消费，缓冲区不会持续增长；一旦 Redis 产生响应的速度超过客户端读取速度，输出缓冲就会堆积，超过限制后客户端可能被 Redis 主动断开。",
      "常见原因有三类。第一是大响应，比如 `HGETALL` 大 hash、`LRANGE 0 -1` 大 list、`SMEMBERS` 大 set、一次性返回大量 key 或 value；第二是客户端或网络慢，比如客户端业务线程阻塞、连接池使用不当、跨机房网络抖动；第三是 Pub/Sub 订阅者消费慢，发布速度很快但订阅端处理不过来，Redis 会为订阅连接堆积大量消息。",
      "Redis 对不同客户端类型有不同输出缓冲限制，可以通过 `client-output-buffer-limit` 配置 normal、replica、pubsub 三类。normal 客户端默认通常限制较宽或不限制，pubsub 客户端更容易因为持续消息堆积触发硬限制或软限制。排查时可以用 `CLIENT LIST` 看 `obl`、`oll`、`omem`，它们能反映输出缓冲相关状态；还要结合慢日志、大 key、网络指标和应用线程栈。",
      "处理思路不是简单调大缓冲。调大只能延缓爆掉，还会增加 Redis 内存风险。更稳的方案是限制大范围查询，改用分页、SCAN、按需字段读取；拆分大 key；控制 Pub/Sub 发布速度；给订阅者做异步队列和背压；把慢客户端隔离到独立连接或独立实例；对不重要的广播允许丢弃或重连拉取状态。",
      "面试里可以这样回答：输出缓冲区爆的本质是生产响应和消费响应速度不匹配。先用 `CLIENT LIST` 定位 omem 高的连接，再看它属于普通客户端、replica 还是 pubsub；然后回到业务命令、网络和客户端线程模型分析。最终治理要减少大响应、提高消费能力、限制慢客户端影响面，而不是只调大 buffer。"
    ],
    followups: [
      ["输出缓冲区爆一定是 Redis 性能差吗？", "不一定。很多时候 Redis 已经把响应生成好了，是客户端、网络或订阅者消费太慢。"],
      ["怎么定位是哪条连接有问题？", "用 `CLIENT LIST` 看连接的 `obl/oll/omem`，再结合客户端地址、名字、命令和业务日志定位。"],
      ["为什么 Pub/Sub 更容易爆？", "订阅者处理慢时，发布消息会持续堆积到订阅连接的输出缓冲区，历史消息又不能像 Stream 那样按确认消费。"],
      ["能不能直接调大限制？", "可以临时缓解，但会增加 Redis 内存风险。根因还是要减少大响应、做限流、拆分查询或隔离慢客户端。"]
    ]
  },
  {
    file: "content/questions/redis/redis-cluster-failover.md",
    slug: "redis-cluster-failover",
    visual: {
      type: "flow",
      title: "Redis Cluster 故障转移：从 PFAIL 到新主",
      summary: "Cluster 通过 gossip 探测、客观 FAIL、从节点竞选、多数派投票和 config epoch 完成故障转移。",
      nodes: [
        ["gossip 探测异常", "节点互相发送 ping/pong 发现不可达"],
        ["标记 PFAIL", "本节点主观认为目标节点疑似故障"],
        ["升级 FAIL", "多数主节点报告后形成客观故障"],
        ["从节点发起竞选", "按复制偏移量、优先级和延迟选择候选"],
        ["多数主节点投票", "获得授权后提升为新主并接管槽"],
        ["客户端刷新路由", "通过 MOVED 更新 slot cache"]
      ],
      prompt: "画一张流程图：gossip 探测异常 -> 标记 PFAIL -> 升级 FAIL -> 从节点发起竞选 -> 多数主节点投票 -> 客户端刷新路由。突出多数派、复制偏移量和 config epoch。",
      takeaway: "Cluster failover 是判故障、选新主、刷路由三件事。"
    },
    detail: [
      "Redis Cluster 的故障转移不依赖哨兵，而是集群节点自己通过 gossip 通信完成状态探测和选举。每个节点会周期性向其他节点发送 ping/pong，如果某个节点在 `cluster-node-timeout` 时间内没有响应，当前节点会先把它标记为 PFAIL，也就是主观疑似故障。PFAIL 只是单个节点的判断，还不能直接触发主从切换。",
      "当多个主节点都报告同一个主节点不可达，集群会把它升级为 FAIL，也就是客观故障。这个过程强调多数派，是为了降低网络抖动或局部分区造成误判。主节点被判 FAIL 后，它的从节点会尝试发起故障转移，但不是任意从节点都能立刻成为新主。候选从节点会考虑复制偏移量、优先级、和主节点断联时间等因素，尽量选择数据最新、状态更适合的从节点。",
      "从节点发起选举时，会向其他主节点请求投票。获得多数主节点授权后，从节点提升为新的主节点，接管原主负责的 hash slot，并更新配置纪元 config epoch。config epoch 可以理解为拓扑版本号，用来帮助集群在多次变化后判断谁的槽位归属更新。随后客户端访问旧节点或旧路由时，会通过 MOVED 感知槽位变化并刷新本地 slot cache。",
      "这套机制的边界也要说明。Cluster 故障转移不是强一致复制，主从复制存在异步窗口，主节点宕机前尚未复制到从节点的数据可能丢失。网络分区下，如果一侧没有多数派，故障转移会受到限制。故障转移期间客户端会经历短暂失败、重试、MOVED 更新和连接重建，所以业务侧要配置合理超时、重试和幂等。",
      "排查时可以看 `CLUSTER NODES` 中的 flags、fail 状态、主从关系和 config epoch，看 Redis 日志里的 failover 过程，看客户端 MOVED 数量和请求错误率。面试回答可以按“PFAIL 主观、FAIL 客观、从节点竞选、多数派投票、新主接管槽、客户端重路由”展开，再补一句异步复制可能丢数据，这就是高可用和强一致之间的取舍。"
    ],
    followups: [
      ["Cluster 故障转移需要哨兵吗？", "不需要。Redis Cluster 内部通过 gossip、FAIL 判定和从节点选举完成故障转移。"],
      ["PFAIL 和 FAIL 区别是什么？", "PFAIL 是单个节点主观认为不可达，FAIL 是多个主节点形成共识后的客观故障状态。"],
      ["故障转移会丢数据吗？", "可能。Cluster 主从复制通常是异步的，主节点宕机前未复制到从节点的数据可能丢失。"],
      ["客户端如何感知新主？", "通过 MOVED 响应或拓扑刷新更新 slot cache，之后同一槽位请求会发到新主。"]
    ]
  },
  {
    file: "content/questions/redis/redis-cluster-hash-slot.md",
    slug: "redis-cluster-hash-slot",
    visual: {
      type: "structure",
      title: "Redis Cluster hash slot：分片和路由",
      summary: "Cluster 先把 key 映射到 16384 个 slot，再把 slot 分配给主节点。",
      nodes: [
        ["计算 CRC16", "对 key 或 hash tag 计算 CRC16"],
        ["映射 16384 槽", "slot = CRC16(key) mod 16384"],
        ["槽分配给主节点", "每个主节点负责一段 slot"],
        ["客户端缓存路由", "slot cache 记录 slot 到节点的映射"],
        ["跨槽命令受限", "多 key 需要落在同一 slot"],
        ["迁移触发重定向", "reshard 时出现 MOVED 或 ASK"]
      ],
      prompt: "画一张结构图：计算 CRC16 -> 映射 16384 槽 -> 槽分配给主节点 -> 客户端缓存路由 -> 跨槽命令受限 -> 迁移触发重定向。突出 slot 是 key 和节点之间的中间层。",
      takeaway: "Cluster 不是直接 key 到节点，而是 key 到 slot 再到节点。"
    },
    detail: [
      "Redis Cluster 的 hash slot 可以理解为 key 和节点之间的中间层。Cluster 不是直接把每个 key 分配给某个节点，而是先用 CRC16 计算 key 的哈希值，再对 16384 取模得到 slot，然后把这些 slot 分配给不同主节点。这样扩容、缩容时移动的是槽，而不是逐个重新管理所有 key。",
      "为什么是 slot 而不是普通一致性哈希？slot 的好处是拓扑管理简单，集群只需要维护 16384 个槽位的归属。客户端可以缓存 slot 到节点的映射，访问时先算 key 属于哪个 slot，再把请求发到对应节点。如果节点扩容，只要把一部分 slot 迁移到新节点；如果缩容，把这个节点负责的 slot 迁走即可。",
      "hash tag 是 Cluster 面试高频追问。默认情况下，`user:1:name` 和 `user:1:order` 不一定在同一槽。如果 key 中包含 `{}`，Cluster 会只对大括号里的内容计算 slot，例如 `user:{1}:name` 和 `user:{1}:order` 会落到同一 slot。这个能力常用于需要多 key 操作的场景，但也可能造成热点 slot，所以不能滥用。",
      "跨槽限制也来自 slot 机制。一个命令如果涉及多个 key，而这些 key 不在同一 slot，Cluster 很难保证它们由同一节点处理，就会报 CROSSSLOT。MGET、MSET、Lua、多 key 事务都要注意这个限制。解决方式不是关闭 Cluster，而是调整 key 设计，把确实需要一起操作的 key 用 hash tag 放在同一槽，或者在业务层拆分请求。",
      "迁移时会出现 MOVED 和 ASK。MOVED 表示槽已经永久归属新节点，客户端要更新 slot cache；ASK 表示槽正在迁移中，本次请求临时去目标节点，并先发送 ASKING。排查时可以看 `CLUSTER SLOTS`、`CLUSTER NODES`、客户端拓扑刷新日志和 MOVED/ASK 次数。面试收束可以说：slot 让 Redis Cluster 具备分片和迁移能力，但也带来了跨槽命令限制、热点 slot 和客户端路由刷新这些工程问题。"
    ],
    followups: [
      ["为什么 Redis Cluster 有 16384 个 slot？", "这是固定槽位数量，便于集群维护槽到节点的映射。扩缩容时迁移 slot，比直接管理所有 key 更简单。"],
      ["hash tag 有什么用？", "让多个 key 使用大括号中的相同内容计算 slot，从而落到同一槽，支持多 key 操作。"],
      ["跨槽错误怎么处理？", "优先调整 key 设计，用 hash tag 保证相关 key 同槽；或者业务层拆分多 key 命令，不要强行跨节点执行。"],
      ["slot 迁移时客户端会怎样？", "可能收到 MOVED 或 ASK。MOVED 代表永久路由更新，ASK 代表迁移中的临时访问。"]
    ]
  }
];

const batch35 = [
  {
    file: "content/questions/redis/redis-data-structures.md",
    slug: "redis-data-structures",
    visual: {
      type: "compare",
      title: "Redis 常见数据结构：场景选择图",
      summary: "String、Hash、List、Set、ZSet 的选择要看数据模型、访问方式、排序需求和成员唯一性。",
      nodes: [
        ["String", "计数器、缓存对象、分布式锁 value"],
        ["Hash", "对象字段较稳定时节省 key 数量"],
        ["List", "按插入顺序处理队列或时间线"],
        ["Set", "去重集合、共同关注、标签交集"],
        ["ZSet", "排行榜、延迟队列、按分数范围查询"],
        ["选择原则", "按读写模式、元素规模和命令复杂度选择"]
      ],
      prompt: "画一张对比图：String -> Hash -> List -> Set -> ZSet -> 选择原则。突出每种结构的典型命令、适用场景和不适合的边界。",
      takeaway: "Redis 结构选择先看访问模式，再看命令成本。"
    },
    detail: [
      "Redis 常见结构不是五个名词的背诵题，而是数据建模题。String 最通用，适合简单缓存、计数器、状态值、分布式锁的随机 token，也可以存 JSON 或序列化对象；但 value 太大时会造成网络传输、复制和删除成本。Hash 适合一个对象有多个字段且字段更新相对独立的场景，例如用户资料、商品基础信息，但字段无限增长或单个 Hash 过大时同样会形成大 key。",
      "List 按插入顺序组织元素，常用命令有 `LPUSH/RPOP`、`LRANGE`、`BLPOP`，适合简单队列、最近列表和按顺序消费的轻量场景。Set 强调成员唯一，常用 `SADD/SISMEMBER/SINTER/SUNION`，适合去重、标签、共同关注、黑名单。ZSet 在成员唯一的基础上带 score，常用 `ZADD/ZREVRANGE/ZRANK/ZINCRBY`，适合排行榜、按时间戳排序、延迟任务和范围查询。",
      "选择结构时要讲边界。String 存大对象会让每次读写都搬运整个 value；Hash 虽然方便部分字段更新，但字段过多会变成大 key；List 做队列没有 MQ 的确认、重试和死信能力；Set 做大规模交并集会消耗 CPU；ZSet 的 score 是浮点数，排行榜要考虑并列分数、分页稳定性和历史榜单清理。结构选错，后面靠机器扩容也不一定救得回来。",
      "线上验证可以看 `OBJECT ENCODING`、`MEMORY USAGE`、big key 扫描、慢日志、命令耗时和网络出流量。面试里可以按“数据是否唯一、是否需要顺序、是否需要分数排序、是否需要局部字段更新、元素规模多大”来决策，而不是直接说 String 万能。这样回答会更像真实建模，而不是只会列数据类型。"
    ],
    followups: [
      ["对象缓存用 String 还是 Hash？", "字段整体读写多、对象不大时 String 简单；字段独立更新频繁且字段数量稳定时 Hash 更合适。"],
      ["List 能不能当可靠队列？", "只能做轻量队列。它缺少完整确认、重试、死信和消费进度管理，可靠消息更适合 Stream 或专业 MQ。"],
      ["ZSet 排行榜有什么坑？", "要处理并列分数、分页稳定性、榜单裁剪、周期 key 和大榜单内存成本。"],
      ["怎么发现结构选错？", "看慢日志、大 key、`MEMORY USAGE`、网络出流量、命令耗时和业务读写路径是否频繁搬运无关字段。"]
    ]
  },
  {
    file: "content/questions/redis/redis-distributed-lock.md",
    slug: "redis-distributed-lock",
    visual: {
      type: "sequence",
      title: "Redis 分布式锁：加锁、续期与释放",
      summary: "Redis 锁要用原子加锁、唯一标识和 Lua 校验释放，还要说明超时、续期和一致性边界。",
      nodes: [
        ["SET NX PX", "原子设置 key、唯一 token 和过期时间"],
        ["执行业务", "业务必须小于锁有效期或支持续期"],
        ["校验 token", "释放前确认锁仍属于当前线程"],
        ["Lua 删除", "比较和删除必须原子完成"],
        ["处理超时", "业务超时要考虑续期和幂等"],
        ["一致性边界", "主从切换可能丢锁，强一致需 fencing token"]
      ],
      prompt: "画一张时序图：SET NX PX -> 执行业务 -> 校验 token -> Lua 删除 -> 处理超时 -> 一致性边界。突出唯一标识、过期时间、Lua 原子释放和主从切换风险。",
      takeaway: "Redis 锁能控并发，但不能天然保证强一致。"
    },
    detail: [
      "Redis 分布式锁的基础实现是 `SET lockKey token NX PX ttl`。`NX` 保证 key 不存在时才设置，`PX` 设置过期时间，token 是客户端生成的唯一值，用来证明这把锁属于谁。加锁必须是一个原子命令，不能先 `SETNX` 再单独 `EXPIRE`，否则中间客户端宕机可能留下永不过期的锁。",
      "释放锁也不能直接 `DEL lockKey`。如果业务执行超过 TTL，锁可能已经过期并被另一个客户端拿到，这时旧客户端再 DEL 就会删除别人的锁。正确做法是用 Lua 脚本先比较 value 是否等于自己的 token，再删除。比较和删除放在同一个脚本里，才能避免校验后到删除前发生并发变化。",
      "面试里要主动讲边界。业务执行时间可能超过锁 TTL，需要合理估算 TTL，或者使用看门狗续期，但续期也要能在客户端异常时停止。Redis 主从复制通常是异步的，主节点拿到锁后还没复制到从节点就宕机，故障转移后其他客户端可能再次拿到锁。这个风险决定了 Redis 锁更适合容忍短暂并发风险的场景，不适合资金扣减这类绝对强一致资源保护。",
      "更成熟的回答要补 fencing token。即使锁服务短暂失误，只要业务资源侧要求每次写入携带单调递增 token，并拒绝旧 token，就能防止旧持有者在超时后继续写入。强一致协调场景可以考虑 ZooKeeper、etcd 或数据库唯一约束，而不是把 Redis 锁当万能分布式事务。"
    ],
    followups: [
      ["为什么 value 要放唯一 token？", "释放锁时要确认锁仍属于自己，避免业务超时后误删别人后来拿到的锁。"],
      ["锁过期时间怎么设？", "要大于业务正常执行时间，并结合 P99、下游超时和重试评估；执行时间不确定时要考虑续期和幂等。"],
      ["Redis 锁在主从切换时安全吗？", "不绝对安全。异步复制窗口可能造成锁丢失，强一致场景要加 fencing token 或换一致性更强的协调组件。"],
      ["Redisson 看门狗解决所有问题吗？", "不能。它解决业务执行超过 TTL 的续期问题，但不消除主从切换、业务幂等和资源侧旧请求写入问题。"]
    ]
  },
  {
    file: "content/questions/redis/redis-expire-eviction.md",
    slug: "redis-expire-eviction",
    visual: {
      type: "compare",
      title: "Redis 过期删除与内存淘汰：触发时机对比",
      summary: "过期删除处理已经到期的 key，内存淘汰是在 maxmemory 压力下选择 key 释放空间。",
      nodes: [
        ["过期删除", "key 到 TTL 后变成可删除对象"],
        ["惰性删除", "访问 key 时发现过期再删除"],
        ["定期删除", "后台周期抽样清理过期 key"],
        ["内存淘汰", "used_memory 超过 maxmemory 后触发"],
        ["淘汰策略", "allkeys/volatile 与 LRU/LFU/random/ttl"],
        ["监控验证", "expired_keys、evicted_keys、命中率和延迟"]
      ],
      prompt: "画一张对比图：过期删除 -> 惰性删除 -> 定期删除 -> 内存淘汰 -> 淘汰策略 -> 监控验证。突出到期清理和内存压力淘汰不是一回事。",
      takeaway: "过期是时间到了，淘汰是内存不够了。"
    },
    detail: [
      "Redis 过期删除和内存淘汰是两套机制。过期删除针对设置了 TTL 的 key，时间到了以后 key 逻辑上不应该再被返回；内存淘汰针对 Redis 使用内存超过 `maxmemory` 的情况，即使 key 没过期，也可能被选中删除。把两者混在一起，会误判线上缓存丢失原因。",
      "过期删除通常由惰性删除和定期删除配合完成。惰性删除是在访问 key 时检查 TTL，如果已经过期就删除并返回不存在；定期删除是 Redis 后台周期性抽样检查带过期时间的 key，删除其中已过期的部分。这样设计是为了避免每个 key 到点都触发定时器，降低调度成本，但也意味着过期 key 不一定在到期瞬间立刻释放内存。",
      "内存淘汰由 `maxmemory-policy` 控制。常见策略包括 `noeviction`、`allkeys-lru`、`volatile-lru`、`allkeys-lfu`、`volatile-ttl`、random 等。allkeys 表示所有 key 都可能被淘汰，volatile 只在设置了 TTL 的 key 中选。缓存场景常用 allkeys-lru 或 allkeys-lfu；如果 Redis 里混有不能丢的状态数据，就要非常谨慎，最好拆实例。",
      "排查时看 `expired_keys` 和 `evicted_keys` 很关键。expired_keys 上升说明过期删除发生，evicted_keys 上升说明内存压力触发了淘汰。还要结合命中率、used_memory、maxmemory、慢日志和业务错误。如果大量 key 同时过期，可能造成命中率下降和回源尖刺；如果 evicted_keys 持续上升，说明容量、TTL、数据结构或淘汰策略需要重新设计。"
    ],
    followups: [
      ["key 过期后会立刻释放内存吗？", "不一定。Redis 结合惰性删除和定期删除，过期 key 可能在一段时间后才真正清理。"],
      ["volatile-lru 和 allkeys-lru 有什么区别？", "volatile-lru 只淘汰设置 TTL 的 key，allkeys-lru 会在所有 key 中淘汰。"],
      ["怎么判断是过期还是淘汰导致缓存没了？", "看 `expired_keys` 和 `evicted_keys`，再结合 maxmemory、TTL 分布和命中率变化。"],
      ["Redis 里能混放缓存和重要状态吗？", "不建议。缓存可以被淘汰，重要状态不应受淘汰策略影响，最好拆实例或至少拆库并严格配置。"]
    ]
  },
  {
    file: "content/questions/redis/redis-geo.md",
    slug: "redis-geo",
    visual: {
      type: "flow",
      title: "Redis GEO：附近位置查询流程",
      summary: "Redis GEO 基于经纬度和 GeoHash/ZSet 能力，适合做附近的人、门店和骑手粗粒度查询。",
      nodes: [
        ["GEOADD 写位置", "保存成员经纬度"],
        ["GEODIST 算距离", "计算两个成员之间距离"],
        ["GEOSEARCH 查附近", "按半径或矩形范围检索"],
        ["返回距离坐标", "WITHDIST、WITHCOORD、ASC、COUNT"],
        ["业务二次过滤", "按营业状态、权限、精度再过滤"],
        ["控制范围性能", "限制半径、数量和隐私暴露"]
      ],
      prompt: "画一张流程图：GEOADD 写位置 -> GEODIST 算距离 -> GEOSEARCH 查附近 -> 返回距离坐标 -> 业务二次过滤 -> 控制范围性能。突出 GEO 适合粗筛附近对象。",
      takeaway: "Redis GEO 适合附近粗筛，精排还要交给业务。"
    },
    detail: [
      "Redis GEO 适合解决附近位置检索问题，例如附近门店、附近骑手、附近设备、城市范围内的 POI 粗筛。它不是单独的数据结构，而是基于有序集合和 GeoHash 思想封装的一组命令，把经纬度编码后存入 ZSet。常见写入命令是 `GEOADD key longitude latitude member`，查询距离可以用 `GEODIST`。",
      "附近查询推荐使用 `GEOSEARCH`，可以按半径或矩形范围查询，并配合 `WITHDIST`、`WITHCOORD`、`ASC/DESC`、`COUNT` 控制返回距离、坐标、排序和数量。老版本常见 `GEORADIUS`，但新版本更推荐 `GEOSEARCH`。面试里说出这些命令，会比只说“Redis 能查附近的人”更可信。",
      "GEO 的边界也要讲清楚。它适合粗粒度位置筛选，不适合替代专业 GIS。经纬度要校验合法范围，地球曲率和编码精度会带来误差；大半径查询会返回大量成员，可能造成 Redis CPU 和网络开销；用户位置属于敏感数据，还要考虑授权、脱敏、过期和隐私合规。很多业务会先用 Redis GEO 粗筛一批候选，再在应用层按营业状态、配送范围、评分和实时可用性精排。",
      "线上排查重点是 key 的成员数量、查询半径、COUNT 限制、慢日志和返回结果大小。不要为了省事把全国所有位置放进一个 key 后做大半径查询，通常要按城市、业务线或地理分区拆 key。回答时可以用“写入位置、范围粗筛、带距离返回、业务精排、隐私和性能控制”这条链路组织。"
    ],
    followups: [
      ["Redis GEO 底层是什么？", "它基于 GeoHash 编码和 ZSet 能力实现，成员按编码后的分数组织。"],
      ["GEOSEARCH 和 GEORADIUS 怎么选？", "新版本更推荐 GEOSEARCH，语义更统一，支持按半径或矩形查询。"],
      ["附近查询为什么还要业务二次过滤？", "Redis GEO 只做位置粗筛，营业状态、权限、配送范围、实时可用性和排序规则通常要业务层处理。"],
      ["GEO 有哪些生产风险？", "大范围查询、成员过多、隐私合规、坐标非法、位置长期不清理都会带来性能和安全风险。"]
    ]
  },
  {
    file: "content/questions/redis/redis-hot-key-big-key.md",
    slug: "redis-hot-key-big-key",
    visual: {
      type: "structure",
      title: "Redis 热 key 和大 key：发现与治理",
      summary: "热 key 是访问集中，大 key 是单个 key 体积或成员过大，二者治理方向不同。",
      nodes: [
        ["识别热 key", "代理统计、客户端埋点、监控访问频次"],
        ["识别大 key", "--bigkeys、MEMORY USAGE、扫描抽样"],
        ["热 key 分散", "本地缓存、副本读、分片 key、限流"],
        ["大 key 拆分", "Hash 分桶、List/ZSet 分页、对象拆字段"],
        ["安全删除", "UNLINK、分批清理、低峰执行"],
        ["治理验证", "看 P99、慢日志、内存、网络和命中率"]
      ],
      prompt: "画一张结构图：识别热 key -> 识别大 key -> 热 key 分散 -> 大 key 拆分 -> 安全删除 -> 治理验证。突出热 key 和大 key 的不同治理路径。",
      takeaway: "热 key 是访问过热，大 key 是体积过大。"
    },
    detail: [
      "Redis 热 key 和大 key 是两类不同问题。热 key 指某个 key 被极高频访问，导致单节点 QPS、网络或 CPU 压力集中；大 key 指单个 key 的 value 很大或集合成员很多，导致读写、复制、删除、迁移和持久化成本变高。热 key 关注访问分布，大 key 关注数据体积，两者可能同时出现，但治理方向不同。",
      "热 key 的发现可以依赖代理层统计、客户端埋点、Redis 监控、热点探测命令或业务日志。治理方式包括本地缓存、读副本、把一个热点拆成多个分片 key、在入口限流、用逻辑过期异步刷新，或者把热点数据前置到 CDN/网关。大 key 的发现常用 `redis-cli --bigkeys`、`MEMORY USAGE`、离线扫描和慢日志，治理方式是拆结构、拆字段、分页读取、控制成员数量。",
      "大 key 的危险不只是占内存。一次 `HGETALL`、`SMEMBERS`、`LRANGE 0 -1` 可能阻塞 Redis 事件循环，返回大响应还会撑大输出缓冲区；删除大 key 用 `DEL` 可能同步释放内存造成抖动，生产更推荐 `UNLINK` 或分批删除。持久化、复制、slot 迁移时，大 key 也会放大网络和 fork 写时复制成本。",
      "面试回答可以按“发现、拆解、兜底、验证”展开。发现看访问频次、命令耗时、内存占用和返回大小；拆解时热 key 走流量分散，大 key 走数据拆分；兜底要有限流、本地缓存、异步刷新和低峰清理；验证看 P99、慢日志、Redis CPU、网络出流量、内存曲线和热点访问是否下降。"
    ],
    followups: [
      ["热 key 和大 key 最大区别是什么？", "热 key 是访问频率异常集中，大 key 是单个 key 体积或成员数量过大。"],
      ["怎么发现大 key？", "可以用 `--bigkeys`、`MEMORY USAGE`、扫描抽样、慢日志和业务侧返回大小统计。"],
      ["为什么删除大 key 要小心？", "DEL 可能同步释放大量内存导致阻塞，生产更适合 UNLINK 或分批低峰删除。"],
      ["热 key 怎么治理？", "本地缓存、分片 key、读副本、限流、逻辑过期异步刷新，以及把热点前置到更靠近入口的位置。"]
    ]
  },
  {
    file: "content/questions/redis/redis-key-design.md",
    slug: "redis-key-design",
    visual: {
      type: "structure",
      title: "Redis key 设计：命名、隔离和治理",
      summary: "好的 key 设计要可读、可隔离、可迁移、可观测，并兼顾 TTL 和 Cluster hash tag。",
      nodes: [
        ["业务前缀", "app:module:entity:id 清楚表达归属"],
        ["环境和租户", "env、tenant、region 避免互相污染"],
        ["控制长度和 value", "key 不过长，value 不做巨大对象"],
        ["TTL 和抖动", "临时缓存设置过期并避免集中失效"],
        ["Cluster hash tag", "多 key 操作需要同槽时使用 {}"],
        ["废弃和迁移", "版本号、灰度双写、清理过期 key"]
      ],
      prompt: "画一张结构图：业务前缀 -> 环境和租户 -> 控制长度和 value -> TTL 和抖动 -> Cluster hash tag -> 废弃和迁移。突出 key 设计是治理体系。",
      takeaway: "key 名不是字符串细节，而是缓存治理边界。"
    },
    detail: [
      "Redis key 设计首先要可读和可治理。常见格式是 `业务:模块:实体:标识`，例如 `mall:coupon:user:1001`。这样从 key 名就能看出归属，排查、统计、删除和迁移都更安全。不同环境、租户、地区或业务线要有明确前缀，避免测试数据、灰度数据和生产数据混在一起。",
      "key 不宜过长，过长会浪费内存和网络；也不能太短到无法识别归属。更重要的是 value 不能无限膨胀。很多大 key 问题不是 key 名本身，而是一个 key 里塞了巨大的 JSON、Hash、Set 或 ZSet。设计时要规定单 key value 大小、集合成员上限、分页读取方式和清理策略。",
      "TTL 是 key 设计的一部分。临时缓存、查询结果、会话状态、验证码等必须有过期时间；热点 key 的 TTL 要加随机抖动，避免同一批 key 集中失效。永久 key 要有明确理由，并纳入容量评估。对于缓存版本切换，可以在 key 里带版本号，灰度期间双读双写，稳定后清理旧版本 key。",
      "Cluster 场景还要考虑 hash tag。多 key 命令、Lua 或事务如果要求多个 key 在同一 slot，可以使用 `{}` 包住共同部分，例如 `order:{1001}:base` 和 `order:{1001}:items`。但 hash tag 不能滥用，过多 key 落同一 slot 会形成热点。面试里可以强调：key 设计不仅是命名规范，还决定隔离、容量、迁移、批量清理和 Cluster 可用性。"
    ],
    followups: [
      ["key 越短越好吗？", "不是。过短难排查，过长浪费内存。要在可读性和内存成本之间平衡。"],
      ["哪些 key 必须设置 TTL？", "临时缓存、验证码、会话、查询结果、限流计数、活动临时数据通常都要设置 TTL。"],
      ["hash tag 什么时候用？", "多个相关 key 必须同槽执行多 key 命令或 Lua 时使用，但要避免把大量流量集中到一个 slot。"],
      ["旧 key 怎么治理？", "通过版本号、灰度双写、访问监控和定期扫描清理，避免长期沉淀无主 key。"]
    ]
  },
  {
    file: "content/questions/redis/redis-lua.md",
    slug: "redis-lua",
    visual: {
      type: "flow",
      title: "Redis Lua：原子脚本执行边界",
      summary: "Lua 脚本把多条 Redis 命令打包成一次原子执行，但必须控制耗时、key 规范和 Cluster 同槽。",
      nodes: [
        ["传入 KEYS/ARGV", "key 和参数分离，避免脚本写死"],
        ["EVAL 执行脚本", "Redis 单线程连续执行脚本"],
        ["多命令原子完成", "检查、修改、过期设置合成一步"],
        ["EVALSHA 复用", "脚本缓存后用 SHA1 调用"],
        ["控制执行耗时", "长脚本会阻塞 Redis 处理其他命令"],
        ["Cluster 同槽限制", "脚本内多个 key 必须落在同一 slot"]
      ],
      prompt: "画一张流程图：传入 KEYS/ARGV -> EVAL 执行脚本 -> 多命令原子完成 -> EVALSHA 复用 -> 控制执行耗时 -> Cluster 同槽限制。突出 Lua 的原子性和边界。",
      takeaway: "Lua 能合并原子步骤，但不能写成长事务。"
    },
    detail: [
      "Redis Lua 脚本的核心价值是把多条 Redis 命令放到服务端一次性执行，避免客户端多次往返，并保证脚本执行期间不会被其他命令插入。常见场景包括分布式锁校验删除、库存扣减前判断、限流计数加过期时间、多个 key 条件更新。它的原子性来自 Redis 单线程执行命令，而不是数据库事务回滚。",
      "脚本参数要按规范传入。key 放在 `KEYS`，普通参数放在 `ARGV`，不要在脚本里拼死 key 名。首次可以用 `EVAL` 执行脚本，生产中常把脚本加载后用 `EVALSHA` 调用，减少重复传输。释放分布式锁的典型脚本是先比较 value 是否等于 token，再删除 key，比较和删除在服务端一次完成，避免竞态。",
      "Lua 的风险是阻塞。脚本执行期间 Redis 不能处理其他命令，如果脚本里遍历大集合、做复杂计算或访问大量 key，会导致全实例延迟抖动。脚本还要保证确定性和可维护性，出错时 Redis 不会像关系数据库那样回滚已经执行的写入命令，所以脚本逻辑要尽量短、小、可测试。",
      "Cluster 场景尤其要注意 key 同 slot。脚本里访问多个 key 时，这些 key 必须落在同一个 hash slot，否则客户端或 Redis 会拒绝执行。需要多 key 原子逻辑时，通常用 hash tag 设计 key。面试回答可以收束为：Lua 适合把小而关键的检查和修改合并成原子步骤，不适合写复杂业务流程或长耗时任务。"
    ],
    followups: [
      ["Lua 原子性等于事务回滚吗？", "不等于。脚本执行期间不会被插入其他命令，但脚本中部分写入后报错，并不等同数据库事务自动回滚。"],
      ["为什么要用 KEYS 和 ARGV？", "便于 Redis Cluster 识别 key，也让脚本可复用、可维护，避免把业务 key 写死在脚本里。"],
      ["Lua 脚本会不会阻塞 Redis？", "会。脚本运行期间 Redis 事件循环被占用，所以脚本必须短小，不能遍历大 key 或做长耗时计算。"],
      ["Cluster 下 Lua 有什么限制？", "脚本访问的多个 key 必须在同一个 slot，通常通过 hash tag 保证。"]
    ]
  },
  {
    file: "content/questions/redis/redis-persistence.md",
    slug: "redis-rdb-aof",
    visual: {
      type: "compare",
      title: "Redis RDB 与 AOF：恢复和数据安全对比",
      summary: "RDB 是快照，恢复快但可能丢最近数据；AOF 是写命令日志，数据更安全但文件和刷盘成本更高。",
      nodes: [
        ["RDB 快照", "按时间点生成紧凑二进制快照"],
        ["RDB 恢复快", "适合备份和全量恢复"],
        ["AOF 日志", "记录写命令并按策略刷盘"],
        ["appendfsync", "always、everysec、no 控制安全和性能"],
        ["AOF 重写", "压缩历史命令，降低文件体积"],
        ["混合持久化", "用 RDB 基底加 AOF 增量兼顾恢复速度"]
      ],
      prompt: "画一张对比图：RDB 快照 -> RDB 恢复快 -> AOF 日志 -> appendfsync -> AOF 重写 -> 混合持久化。突出 RPO/RTO 取舍。",
      takeaway: "RDB 像拍照，AOF 像记账。"
    },
    detail: [
      "RDB 和 AOF 都是 Redis 持久化机制，但目标不同。RDB 是在某个时间点生成内存数据快照，文件紧凑、恢复速度快，适合备份、全量复制和灾难恢复；缺点是两次快照之间的数据可能丢失。AOF 是把写命令追加到日志文件，恢复时重放命令，数据安全性通常更好，但文件更大，刷盘和重写也会带来成本。",
      "RDB 生成快照时通常会 fork 子进程，利用写时复制生成文件。这个过程可能带来内存峰值和 fork 延迟，实例数据越大，风险越明显。AOF 的关键参数是 `appendfsync`：always 最安全但性能成本高，everysec 常用，最多可能丢约 1 秒数据，no 依赖操作系统刷盘，性能好但风险更大。",
      "AOF 文件会随写入增长，所以需要 rewrite。AOF rewrite 不是简单压缩文本，而是根据当前内存状态生成更短的等价写入序列。新版本 Redis 还支持混合持久化，用 RDB 作为基底，再接 AOF 增量，兼顾恢复速度和数据安全。面试里可以从 RPO 和 RTO 解释选择：能丢多少数据，看 RPO；多久恢复，看 RTO。",
      "生产落地要做恢复演练。很多人只会开持久化参数，却没有验证备份文件是否可用、恢复耗时多久、磁盘满了怎么办、AOF 损坏如何处理。还要监控 fork 耗时、AOF rewrite、磁盘 IO、文件大小、复制延迟和最近一次持久化状态。回答时可以说：缓存场景可以弱化持久化，状态型 Redis 必须按业务容忍度配置和演练。"
    ],
    followups: [
      ["RDB 会丢数据吗？", "会。两次快照之间的数据如果还没生成新 RDB，宕机后可能丢失。"],
      ["AOF everysec 是不是绝对不丢？", "不是。everysec 通常最多丢约 1 秒数据，但极端情况下还受系统和磁盘状态影响。"],
      ["AOF rewrite 会阻塞 Redis 吗？", "主要由子进程完成，但 fork、写时复制和磁盘 IO 仍可能造成抖动，需要监控。"],
      ["怎么选择 RDB 和 AOF？", "看 RPO/RTO。恢复速度优先用 RDB，数据安全优先开 AOF，很多生产会启用混合持久化。"]
    ]
  },
  {
    file: "content/questions/redis/redis-pipeline.md",
    slug: "redis-pipeline",
    visual: {
      type: "flow",
      title: "Redis Pipeline：批量发送与风险控制",
      summary: "Pipeline 通过批量发送命令减少 RTT，但不是事务，也要控制批量大小和输出缓冲。",
      nodes: [
        ["收集多条命令", "客户端暂存一批独立 Redis 命令"],
        ["一次性发送", "减少多次网络往返 RTT"],
        ["Redis 顺序执行", "服务端仍按命令顺序处理"],
        ["批量读取响应", "客户端再集中读取结果"],
        ["控制批量大小", "避免输出缓冲和网络包过大"],
        ["处理部分失败", "逐条检查响应并设计重试"]
      ],
      prompt: "画一张流程图：收集多条命令 -> 一次性发送 -> Redis 顺序执行 -> 批量读取响应 -> 控制批量大小 -> 处理部分失败。突出 Pipeline 不是事务。",
      takeaway: "Pipeline 省 RTT，不保原子。"
    },
    detail: [
      "Redis Pipeline 解决的是网络往返成本。普通模式下一条命令发到 Redis，客户端等响应，再发下一条；如果有一千条命令，RTT 成本会被放大。Pipeline 把多条命令连续写到连接里，Redis 按顺序执行，客户端再批量读取响应。它能显著提升批量写入、批量预热、批量计数更新这类场景的吞吐。",
      "Pipeline 不是事务，也不保证所有命令一起成功。Redis 会按顺序执行收到的命令，但某一条命令报错不代表前面的命令回滚，后面的命令也可能继续执行。客户端必须逐条检查响应，必要时设计幂等和补偿。需要条件判断和原子更新时，应该考虑 Lua 或事务，而不是把 Pipeline 当成原子批处理。",
      "Pipeline 的风险是批量过大。一次发送太多命令会占用客户端内存、网络缓冲和 Redis 输出缓冲区，响应过大还会拖慢连接，甚至触发 client-output-buffer-limit。Cluster 场景下，不同 slot 的命令可能要拆到不同节点连接上，成熟客户端会做拆分，但业务仍要关注批量大小、重试和顺序依赖。",
      "面试回答要讲适用边界：适合大量互不依赖的小命令批量执行，不适合强原子、多命令有条件依赖、响应巨大或单 key 大对象读取。验证效果看吞吐、RTT、Redis CPU、网络出流量、客户端内存和输出缓冲。和 MGET/MSET 对比时，如果是同类批量 key，原生命令更简单；如果是多种命令混合，Pipeline 更灵活。"
    ],
    followups: [
      ["Pipeline 和事务有什么区别？", "Pipeline 只是批量发送减少 RTT，不保证原子；事务用 MULTI/EXEC 排队执行，但也不是数据库事务回滚。"],
      ["Pipeline 批量越大越好吗？", "不是。批量过大会撑大客户端内存、网络缓冲和 Redis 输出缓冲，通常要压测确定批大小。"],
      ["Cluster 下 Pipeline 怎么办？", "客户端通常按 slot 拆到不同节点连接执行，但跨节点顺序和失败处理要特别注意。"],
      ["什么时候不用 Pipeline？", "命令之间有强依赖、需要原子条件判断、单次响应很大或失败补偿复杂时不适合直接用 Pipeline。"]
    ]
  },
  {
    file: "content/questions/redis/redis-quicklist-listpack.md",
    slug: "redis-quicklist-listpack",
    visual: {
      type: "structure",
      title: "quicklist 与 listpack：Redis 紧凑编码",
      summary: "quicklist 用链表串起多个 listpack，兼顾插入删除和紧凑存储。",
      nodes: [
        ["listpack", "紧凑连续内存存储小元素"],
        ["quicklist 节点", "每个节点内部保存一个 listpack"],
        ["双向链表组织", "多个节点前后连接便于两端操作"],
        ["节省小对象内存", "减少指针和对象头开销"],
        ["控制节点大小", "配置影响压缩率和修改成本"],
        ["观察编码", "用 OBJECT ENCODING 和 MEMORY USAGE 验证"]
      ],
      prompt: "画一张结构图：listpack -> quicklist 节点 -> 双向链表组织 -> 节省小对象内存 -> 控制节点大小 -> 观察编码。突出 quicklist 是链表加紧凑块。",
      takeaway: "quicklist 是链表骨架，listpack 是紧凑内容块。"
    },
    detail: [
      "quicklist 和 listpack 是 Redis 为了节省内存和控制操作成本做的内部编码。早期 Redis 用 ziplist 存小对象，但 ziplist 在连锁更新和安全性上有问题，新版本逐步用 listpack 替代。listpack 是一段连续紧凑内存，适合保存小元素，减少每个元素单独分配对象带来的指针和元数据开销。",
      "quicklist 可以理解为双向链表加多个紧凑块。每个 quicklist 节点内部不是只放一个元素，而是放一个 listpack；多个节点再用链表串起来。这样既不像普通链表那样每个元素都有指针开销，也不像一个巨大连续数组那样插入删除成本过高。Redis List 的底层就经历过从 ziplist/linkedlist 到 quicklist 的演进。",
      "面试里不要只说“省内存”，要补代价。listpack 连续内存适合小元素，但节点太大时修改和搬移成本会上升；节点太小时压缩率下降，指针开销变多。Redis 提供相关配置控制每个 quicklist 节点大小和压缩深度，具体参数在不同版本里可能有差异，所以回答时要强调“编码会随版本和数据规模变化”。",
      "线上验证可以用 `OBJECT ENCODING key` 看编码，用 `MEMORY USAGE key` 看内存，用慢日志和延迟监控观察大 List 操作。quicklist/listpack 这类题的价值不在于背源码字段，而是理解 Redis 为什么会在空间和时间之间折中：小对象紧凑存储，大对象避免连续内存过大，两端操作仍要保持可控。"
    ],
    followups: [
      ["listpack 和 ziplist 有什么关系？", "listpack 是新版本中用于替代 ziplist 的紧凑编码，设计上减少 ziplist 的一些历史问题。"],
      ["quicklist 为什么不是普通链表？", "普通链表每个元素都有指针和分配开销，quicklist 用 listpack 批量存元素，更省内存。"],
      ["紧凑编码有没有代价？", "有。连续内存块修改可能搬移数据，节点大小配置会影响压缩率、修改成本和延迟。"],
      ["怎么观察实际编码？", "用 `OBJECT ENCODING key` 看编码，用 `MEMORY USAGE key` 估算内存，再结合慢日志判断操作成本。"]
    ]
  }
];

const batch36 = [
  {
    file: "content/questions/redis/redis-rate-limit-lua.md",
    slug: "redis-rate-limit-lua",
    visual: {
      type: "flow",
      title: "Redis + Lua 限流：检查到放行流程",
      summary: "Redis + Lua 限流把计数、清理、判断和过期设置合成原子步骤，但要控制热点 key 和脚本耗时。",
      nodes: [
        ["接收请求标识", "按用户、IP、接口或租户生成限流 key"],
        ["Lua 原子检查", "计数、清理、判断在服务端一次完成"],
        ["固定窗口计数", "INCR 加 EXPIRE，简单但边界突刺"],
        ["滑动窗口统计", "ZSET 记录时间戳并清理窗口外请求"],
        ["返回限流结果", "放行、拒绝或返回剩余额度"],
        ["降级和监控", "关注热点 key、脚本耗时、拒绝率和错误率"]
      ],
      prompt: "画一张流程图：接收请求标识 -> Lua 原子检查 -> 固定窗口计数 -> 滑动窗口统计 -> 返回限流结果 -> 降级和监控。突出原子性、热点 key 和脚本耗时。",
      takeaway: "Redis Lua 限流强在原子判断，风险在热点和长脚本。"
    },
    detail: [
      "Redis + Lua 限流的核心是把“读取当前次数、判断是否超限、更新计数、设置过期时间”放到服务端一次完成，避免客户端多命令之间出现竞态。最简单的是固定窗口：对 `rate:{user}:{minute}` 执行 `INCR`，第一次计数时设置 `EXPIRE`，超过阈值就拒绝。固定窗口实现简单，但窗口边界可能出现两倍流量突刺。",
      "更平滑的做法是滑动窗口。可以用 ZSET 把请求时间戳作为 score，每次请求先删除窗口外的旧记录，再统计窗口内数量，未超限就写入当前时间戳并设置过期。这个流程如果拆成多条命令会有并发问题，用 Lua 包起来更稳。也可以实现令牌桶或漏桶，但复杂度和脚本耗时会更高。",
      "生产里不能只讲算法。限流 key 的维度很关键，按用户、IP、接口、租户、设备还是组合维度，决定了误伤和绕过风险。高流量接口会形成热点 key，ZSET 滑窗还会占用更多内存。Lua 脚本不能遍历大集合或做复杂循环，否则会阻塞 Redis。限流还要有降级策略：Redis 异常时是默认放行、默认拒绝，还是回退到本地限流，要按业务风险决定。",
      "验证时看限流拒绝率、Redis 命令耗时、脚本耗时、热点 key、内存增长、接口 P99 和误伤投诉。面试回答可以用固定窗口起手，再主动补滑动窗口、令牌桶、热点 key、Lua 原子性和 Redis 故障策略。这样答案会比“INCR + EXPIRE”更完整。"
    ],
    followups: [
      ["为什么限流要用 Lua？", "为了把判断、计数、清理和过期设置做成服务端原子步骤，避免多客户端并发穿透阈值。"],
      ["固定窗口有什么问题？", "窗口边界会突刺，例如上一分钟末尾和下一分钟开头各打满一次，短时间内可能放过两倍请求。"],
      ["滑动窗口有什么代价？", "通常用 ZSET 保存时间戳，精度更高，但内存和清理成本比简单计数更高。"],
      ["Redis 挂了限流怎么办？", "要提前定义 fail-open 还是 fail-close。登录、支付、风控和普通查询的策略可能不同。"]
    ]
  },
  {
    file: "content/questions/redis/redis-scan-vs-keys.md",
    slug: "redis-scan-vs-keys",
    visual: {
      type: "compare",
      title: "SCAN 与 KEYS：全量匹配风险对比",
      summary: "KEYS 一次性阻塞扫描全部 key，SCAN 用 cursor 渐进遍历但不保证快照一致。",
      nodes: [
        ["KEYS 全量阻塞", "一次扫描整个 keyspace，生产风险高"],
        ["SCAN cursor", "每次返回游标和一批 key"],
        ["COUNT 只是提示", "不是严格返回条数"],
        ["可能重复返回", "遍历期间 key 变化会导致重复或遗漏"],
        ["Cluster 分节点扫", "每个主节点都有自己的 keyspace"],
        ["生产限速处理", "分批、去重、节流和低峰执行"]
      ],
      prompt: "画一张对比图：KEYS 全量阻塞 -> SCAN cursor -> COUNT 只是提示 -> 可能重复返回 -> Cluster 分节点扫 -> 生产限速处理。突出 SCAN 更安全但不是快照。",
      takeaway: "KEYS 是一次扫全场，SCAN 是拿游标慢慢走。"
    },
    detail: [
      "KEYS 和 SCAN 都能按模式找 key，但生产语义差别很大。`KEYS pattern` 会一次性遍历整个 keyspace，数据量大时会阻塞 Redis 事件循环，导致其他请求延迟飙升。所以 KEYS 适合本地调试、小实例或明确可控的数据量，不适合在线生产实例随手执行。",
      "SCAN 是渐进式遍历。客户端传入 cursor，Redis 返回下一批 key 和新的 cursor，直到 cursor 回到 0 表示本轮遍历结束。`MATCH` 可以匹配模式，`COUNT` 可以提示每批数量，`TYPE` 可以限制类型。但 COUNT 只是提示，不是严格条数；SCAN 也不是快照遍历，遍历期间 key 新增或删除，可能出现重复返回或遗漏。",
      "生产使用 SCAN 要带工程处理。第一，客户端要按 cursor 循环，不能只扫一次；第二，结果要能去重或保证操作幂等；第三，要限速，避免扫描本身造成 CPU 和网络压力；第四，大量删除 key 时不要直接 DEL，优先分批 UNLINK；第五，Cluster 模式要对每个主节点分别扫描，因为每个节点只保存自己槽位的数据。",
      "面试回答可以这样组织：KEYS 简单但阻塞，SCAN 渐进但不保证一致；SCAN 适合线上排查和批处理，但要接受重复、遗漏和最终一致；真正大规模治理最好依赖 key 设计、前缀规范、元数据索引和离线任务，而不是在线全库扫描。"
    ],
    followups: [
      ["SCAN 会不会漏 key？", "遍历期间 keyspace 变化时可能重复或遗漏，所以处理逻辑要幂等，不能把它当严格快照。"],
      ["COUNT 是每次返回数量吗？", "不是严格数量，只是给 Redis 的工作量提示，实际返回可能多也可能少。"],
      ["Cluster 下 SCAN 怎么扫？", "要连接每个主节点分别扫描，因为每个主节点只管理自己槽位的 key。"],
      ["线上删除一批 key 怎么做？", "用 SCAN 分批找 key，限速执行，删除大 key 时优先 UNLINK，并监控延迟和 CPU。"]
    ]
  },
  {
    file: "content/questions/redis/redis-sentinel-cluster.md",
    slug: "redis-sentinel-cluster",
    visual: {
      type: "compare",
      title: "Redis 主从、哨兵、Cluster：能力边界对比",
      summary: "主从解决复制和读扩展，哨兵解决主从高可用，Cluster 解决分片扩容和集群路由。",
      nodes: [
        ["主从复制", "主写从读，提供副本和读扩展"],
        ["哨兵监控", "判断主观下线和客观下线"],
        ["哨兵故障转移", "选新主并通知客户端"],
        ["Cluster 分片", "16384 slot 分散到多个主节点"],
        ["Cluster 重定向", "客户端处理 MOVED 和 ASK"],
        ["按需求选择", "容量、可用性、运维复杂度一起评估"]
      ],
      prompt: "画一张对比图：主从复制 -> 哨兵监控 -> 哨兵故障转移 -> Cluster 分片 -> Cluster 重定向 -> 按需求选择。突出三者解决的问题不同。",
      takeaway: "主从管副本，哨兵管高可用，Cluster 管分片。"
    },
    detail: [
      "Redis 主从、哨兵和 Cluster 是三个层次。主从复制让一个主节点把数据复制到从节点，常用于读扩展、备份和故障恢复基础；但单纯主从不会自动完成主从切换。主节点宕机后，如果没有外部协调，业务仍可能连接旧主或需要人工切换。",
      "哨兵是在主从架构上的高可用组件。多个 Sentinel 进程监控主从节点，先出现主观下线，再通过多个 Sentinel 达成客观下线，然后选择合适从节点提升为新主，并通知客户端更新主节点地址。哨兵适合单分片 Redis 的高可用，但不负责把数据分散到多个主节点，也不能解决单实例容量上限。",
      "Cluster 解决的是分片和横向扩容。它把 key 映射到 16384 个 slot，再把 slot 分配给多个主节点，每个主节点可以有从节点。客户端要支持 Cluster 协议，处理 slot 路由、MOVED、ASK 和跨槽限制。Cluster 自带故障转移能力，不需要哨兵参与，但业务要接受异步复制窗口和多 key 跨槽约束。",
      "选择时看目标：只想有副本和读扩展，用主从；要单主故障自动切换，用主从加哨兵；要突破单机容量和 QPS 上限，用 Cluster。还要考虑客户端支持、运维复杂度、数据一致性、迁移成本和命令限制。面试里把这三者的定位说清楚，比单纯列“主从、哨兵、集群”更有价值。"
    ],
    followups: [
      ["哨兵和 Cluster 都能故障转移，有什么区别？", "哨兵服务于单分片主从高可用，Cluster 服务于多主分片集群并自带故障转移。"],
      ["Cluster 还需要哨兵吗？", "通常不需要。Cluster 节点自己通过 gossip 和投票完成故障转移。"],
      ["主从能保证不丢数据吗？", "不绝对。Redis 主从复制通常异步，主节点宕机前未复制的数据可能丢失。"],
      ["什么时候不建议上 Cluster？", "数据量和 QPS 没到瓶颈、团队运维能力不足、业务大量跨 key 操作时，上 Cluster 可能复杂度大于收益。"]
    ]
  },
  {
    file: "content/questions/redis/redis-single-thread-fast.md",
    slug: "redis-single-thread-fast",
    visual: {
      type: "structure",
      title: "Redis 单线程快的原因与瓶颈",
      summary: "Redis 快来自内存操作、高效结构和 I/O 多路复用，但慢命令、大 key、fork 和磁盘也会拖慢它。",
      nodes: [
        ["内存读写", "大多数操作在内存完成"],
        ["高效数据结构", "针对常见结构做紧凑编码和优化"],
        ["I/O 多路复用", "单线程事件循环处理大量连接"],
        ["避免锁竞争", "命令串行执行减少复杂并发控制"],
        ["局部慢源", "大 key、慢命令、Lua、fork、AOF fsync"],
        ["观测延迟", "slowlog、latency doctor、commandstats"]
      ],
      prompt: "画一张结构图：内存读写 -> 高效数据结构 -> I/O 多路复用 -> 避免锁竞争 -> 局部慢源 -> 观测延迟。突出快的原因和慢的来源。",
      takeaway: "Redis 单线程快，不代表任何命令都快。"
    },
    detail: [
      "Redis 常说的单线程，主要指命令执行路径以单线程事件循环为核心。它之所以快，首先因为大多数操作都在内存里完成，不需要频繁等待磁盘；其次 Redis 为 String、Hash、List、Set、ZSet 等结构做了大量编码优化；再次，它用 I/O 多路复用处理很多连接，避免一个连接一个线程的调度成本。",
      "单线程还有一个好处是减少锁竞争。命令串行执行，很多内部结构不需要复杂锁保护，实现更简单，延迟也更可控。但这也是边界：只要某条命令执行时间长，后面的请求都会排队。大 key 读取、全量遍历、复杂 Lua、慢的集合交并集、AOF fsync、RDB fork 和网络大响应都可能让 Redis 抖动。",
      "Redis 6 之后引入 I/O threading，但要准确表达：多线程主要用于网络读写和协议解析等 I/O 环节，命令执行仍然保持核心串行模型。这能缓解网络 I/O 压力，但不能让一个慢命令不阻塞其他命令。所以调优时不能只说“开多线程”，还要治理命令和数据结构。",
      "排查 Redis 变慢要看 `SLOWLOG GET`、`LATENCY DOCTOR`、`INFO commandstats`、CPU、网络、内存、fork 耗时和客户端输出缓冲。面试回答可以先讲快的原因，再主动补慢的来源，这样不会给人“Redis 单线程所以永远很快”的错误印象。"
    ],
    followups: [
      ["Redis 真的是完全单线程吗？", "不是。核心命令执行主要单线程，但后台持久化、异步删除、网络 I/O 等在新版本里可能有其他线程参与。"],
      ["为什么单线程还能处理高并发？", "靠内存操作、高效数据结构和 I/O 多路复用，避免大量线程上下文切换和锁竞争。"],
      ["什么命令会拖慢 Redis？", "大 key 读写、KEYS、复杂集合运算、长 Lua、全量删除和大响应都可能造成阻塞。"],
      ["Redis 6 I/O 多线程能解决慢命令吗？", "不能完全解决。它主要优化网络 I/O，命令执行慢仍然会影响事件循环。"]
    ]
  },
  {
    file: "content/questions/redis/redis-slowlog.md",
    slug: "redis-slowlog",
    visual: {
      type: "flow",
      title: "Redis SlowLog：慢命令排查闭环",
      summary: "SlowLog 记录命令执行耗时，不包含网络传输和客户端排队，要和 latency、命令统计一起看。",
      nodes: [
        ["配置阈值", "slowlog-log-slower-than 控制记录门槛"],
        ["限制长度", "slowlog-max-len 控制保留条数"],
        ["查看慢日志", "SLOWLOG GET/LEN/RESET"],
        ["识别慢命令", "看命令、参数、耗时和发生时间"],
        ["关联其他指标", "latency、commandstats、big key、网络"],
        ["修复验证", "改命令、拆 key、分页并复看慢日志"]
      ],
      prompt: "画一张流程图：配置阈值 -> 限制长度 -> 查看慢日志 -> 识别慢命令 -> 关联其他指标 -> 修复验证。突出 SlowLog 不包含网络耗时。",
      takeaway: "SlowLog 看服务端命令耗时，不等于用户端总耗时。"
    },
    detail: [
      "Redis SlowLog 用来记录执行耗时超过阈值的命令。关键配置是 `slowlog-log-slower-than`，单位是微秒，控制超过多长时间才记录；`slowlog-max-len` 控制最多保留多少条。常用命令有 `SLOWLOG GET`、`SLOWLOG LEN` 和 `SLOWLOG RESET`。它适合定位大 key、慢集合操作、全量扫描和长 Lua 等问题。",
      "要注意 SlowLog 记录的是 Redis 服务端执行命令的耗时，不包含客户端等待连接、网络传输、请求排队和响应读取时间。也就是说，用户看到接口慢，但 SlowLog 没记录，不代表 Redis 完全没问题；可能是网络、连接池、客户端输出缓冲、排队或热点连接造成的。反过来，SlowLog 里出现慢命令，说明服务端确实有命令执行成本，需要重点分析。",
      "排查时不能只看一条慢日志。要把慢命令和参数、key 大小、执行时间点、Redis CPU、`INFO commandstats`、`LATENCY DOCTOR`、big key、AOF/RDB 后台任务联系起来。例如 `HGETALL` 慢可能是 Hash 太大，`ZRANGE` 慢可能是范围过大，Lua 慢可能是脚本逻辑复杂。定位后要改成分页、拆 key、减少大响应或调整数据结构。",
      "生产配置要谨慎。阈值太高看不到问题，太低会产生大量记录但 SlowLog 本身是内存环形记录，不会持久保存历史。面试回答可以按“配置阈值、获取日志、识别命令、结合指标、改造验证”来讲，并补一句：SlowLog 是排查 Redis 慢的一块拼图，不是完整链路追踪。"
    ],
    followups: [
      ["SlowLog 记录网络耗时吗？", "不记录。它记录 Redis 执行命令本身的耗时，不包含网络传输和客户端等待。"],
      ["slowlog-log-slower-than 怎么设置？", "要结合业务延迟目标和实例压力设置，常见做法是灰度调低观察，再避免过多无意义记录。"],
      ["看到慢命令后怎么处理？", "先看命令和参数，再查 key 大小、数据结构、调用方和执行频率，最后做分页、拆 key 或命令替换。"],
      ["SlowLog 没记录但接口慢怎么办？", "继续看连接池、网络、客户端排队、输出缓冲、服务端 CPU 和链路追踪。"]
    ]
  },
  {
    file: "content/questions/redis/redis-stream-consumer-group.md",
    slug: "redis-stream-consumer-group",
    visual: {
      type: "flow",
      title: "Redis Stream 消费组：投递确认和转移",
      summary: "消费组通过 XREADGROUP 分摊消息，用 PEL 记录未确认消息，并通过 XACK/XAUTOCLAIM 处理失败转移。",
      nodes: [
        ["XGROUP CREATE", "创建消费组和起始消费位置"],
        ["XREADGROUP 读取", "消费者从组内领取消息"],
        ["进入 PEL", "已投递未确认消息进入待确认列表"],
        ["业务幂等处理", "消费者处理消息并防重复"],
        ["XACK 确认", "处理成功后从 PEL 移除"],
        ["XAUTOCLAIM 转移", "宕机或超时消息转给其他消费者"]
      ],
      prompt: "画一张流程图：XGROUP CREATE -> XREADGROUP 读取 -> 进入 PEL -> 业务幂等处理 -> XACK 确认 -> XAUTOCLAIM 转移。突出确认和失败转移。",
      takeaway: "Stream 消费组可靠性的核心是 PEL、XACK 和幂等。"
    },
    detail: [
      "Redis Stream 消费组让多个消费者协作处理同一个 Stream。先用 `XGROUP CREATE` 创建消费组，再用 `XREADGROUP GROUP group consumer` 读取消息。消息被投递给某个消费者后，会进入 PEL，也就是 Pending Entries List，表示它已经被投递但还没有确认。处理成功后，消费者用 `XACK` 确认，消息才会从 PEL 中移除。",
      "PEL 是理解消费组的关键。消费者宕机、处理超时或程序异常时，消息不会自动消失，而是留在 PEL。可以用 `XPENDING` 查看待确认消息，用 `XAUTOCLAIM` 或 `XCLAIM` 把长时间未确认的消息转给其他消费者继续处理。这让 Stream 具备一定失败恢复能力，但也意味着消息可能重复投递，业务必须做幂等。",
      "Stream 消费组不是完整 MQ 的全部能力。它适合轻量异步任务、事件流和 Redis 体系内的可靠队列，但大规模分区、长期保留、复杂重平衡、死信治理和跨机房复制，仍可能需要 Kafka、RocketMQ 等专业系统。Stream 的保留策略、内存占用、AOF/RDB 持久化和 Redis 高可用都会影响消息可靠性。",
      "面试回答可以按“写入、分组读取、进入 PEL、业务处理、XACK 确认、超时转移”讲。排查时看 Stream 长度、PEL 数量、最老 pending 时间、消费者在线状态、处理耗时和重复消费量。只说 Stream 有消费组还不够，要把失败转移和幂等补上。"
    ],
    followups: [
      ["PEL 是什么？", "PEL 记录已投递给消费者但还没 XACK 的消息，是失败转移和积压排查的核心。"],
      ["消费者宕机后消息怎么办？", "消息留在 PEL，可通过 XPENDING 查看，再用 XAUTOCLAIM 或 XCLAIM 转给其他消费者处理。"],
      ["Stream 会重复消费吗？", "可能。失败转移、超时重试和客户端异常都会导致重复处理，所以业务必须幂等。"],
      ["Stream 适合替代 Kafka 吗？", "只适合轻量场景。大规模高吞吐和长期保留更适合专业 MQ。"]
    ]
  },
  {
    file: "content/questions/redis/redis-stream.md",
    slug: "redis-stream",
    visual: {
      type: "structure",
      title: "Redis Stream：消息流核心结构",
      summary: "Stream 用 XADD 追加消息，用 ID 排序，用消费者组、PEL 和 XACK 支持协作消费。",
      nodes: [
        ["XADD 追加", "写入带 ID 的消息记录"],
        ["消息 ID", "时间戳加序列号，支持范围读取"],
        ["XREAD 读取", "普通消费者按 ID 读取消息"],
        ["消费组", "多个消费者分摊同一组消息"],
        ["PEL 待确认", "记录已投递未确认消息"],
        ["保留策略", "MAXLEN 控制长度和内存"]
      ],
      prompt: "画一张结构图：XADD 追加 -> 消息 ID -> XREAD 读取 -> 消费组 -> PEL 待确认 -> 保留策略。突出 Stream 是可追溯消息流。",
      takeaway: "Stream 是 Redis 里的轻量消息日志。"
    },
    detail: [
      "Redis Stream 是 Redis 5 引入的消息流结构，可以理解为一条按 ID 追加的消息日志。生产者用 `XADD` 写入消息，Redis 会生成形如 `timestamp-seq` 的消息 ID，也可以由客户端指定。消费者可以用 `XREAD` 从某个 ID 之后读取，也可以用消费者组让多个消费者协作处理。",
      "Stream 比 Pub/Sub 更可靠，因为消息会保留在结构中，消费者短暂离线后可以继续从指定位置读取。消费组模式下，消息投递后进入 PEL，处理成功后用 `XACK` 确认。未确认消息可以被查看和转移，这让 Stream 能做轻量队列、异步任务和事件流。",
      "但 Stream 仍要控制容量。消息保存在 Redis 内存体系里，虽然可以持久化到 AOF/RDB，但内存成本、复制成本和恢复时间都要考虑。常用 `MAXLEN` 控制长度，可以近似裁剪历史消息。业务还要考虑死信、重试、幂等和消息体大小，不要把 Stream 当无限日志仓库。",
      "面试里可以对比 Pub/Sub 和 Kafka。Pub/Sub 是在线广播，没有确认和重放；Stream 有消息 ID、保留和消费者组；Kafka 则在大规模分区、磁盘日志、长期保留和生态上更强。回答 Stream 时，把 XADD、XREAD、XGROUP、XACK、PEL、MAXLEN 这些关键词串起来，基本就比较稳。"
    ],
    followups: [
      ["Stream 和 Pub/Sub 最大区别是什么？", "Stream 会保存消息并支持读取历史，Pub/Sub 只给当前在线订阅者广播。"],
      ["Stream 消息 ID 有什么用？", "ID 决定消息顺序和读取位置，支持范围查询和从某个位置继续消费。"],
      ["MAXLEN 有什么风险？", "裁剪历史消息可能让慢消费者读不到旧消息，所以要结合消费延迟和保留需求设置。"],
      ["Stream 为什么还需要幂等？", "消费者异常、未确认转移和重试都可能导致重复投递，业务侧必须能重复处理。"]
    ]
  },
  {
    file: "content/questions/redis/redis-transaction.md",
    slug: "redis-transaction",
    visual: {
      type: "sequence",
      title: "Redis 事务：排队执行和乐观锁",
      summary: "Redis 事务用 MULTI/EXEC 排队执行命令，WATCH 提供乐观锁，但不等同数据库事务回滚。",
      nodes: [
        ["MULTI 开启", "后续命令进入事务队列"],
        ["命令排队", "返回 QUEUED，不立即执行"],
        ["EXEC 执行", "按顺序执行队列命令"],
        ["DISCARD 放弃", "丢弃队列中的命令"],
        ["WATCH 监控", "被监控 key 变化则 EXEC 失败"],
        ["不自动回滚", "执行期错误不会回滚已执行命令"]
      ],
      prompt: "画一张时序图：MULTI 开启 -> 命令排队 -> EXEC 执行 -> DISCARD 放弃 -> WATCH 监控 -> 不自动回滚。突出 Redis 事务不是数据库事务。",
      takeaway: "Redis 事务会排队执行，但不负责自动回滚。"
    },
    detail: [
      "Redis 事务由 `MULTI`、`EXEC`、`DISCARD` 和 `WATCH` 组成。客户端发送 `MULTI` 后，后续命令不会立即执行，而是进入队列并返回 QUEUED；发送 `EXEC` 时，Redis 按顺序执行队列中的命令；发送 `DISCARD` 可以放弃队列。这个机制保证事务队列执行期间不会插入其他客户端命令，但它不是关系数据库那种 ACID 事务。",
      "最容易混淆的是回滚。Redis 事务里，如果命令入队阶段就有语法错误，EXEC 可能拒绝执行；但如果命令执行阶段发生类型错误，例如对 String 执行 List 命令，其他命令仍可能已经执行，Redis 不会自动回滚。这一点必须主动说明，否则面试官会继续追问数据库事务区别。",
      "`WATCH` 提供乐观锁能力。客户端先 WATCH 某些 key，再读取和计算，最后 MULTI/EXEC。如果被 WATCH 的 key 在 EXEC 前被其他客户端修改，EXEC 会失败，客户端需要重试。它适合简单并发条件更新，但复杂条件原子逻辑通常更推荐 Lua，因为 Lua 能把读取判断和写入放到服务端一次执行。",
      "面试回答可以说：Redis 事务解决的是命令排队和执行期间不被插队，不解决隔离读、自动回滚和复杂一致性。项目里涉及库存扣减、锁释放、限流这类条件更新时，要比较 MULTI/EXEC、WATCH 和 Lua 的适用性，并保证业务幂等和失败重试。"
    ],
    followups: [
      ["Redis 事务支持回滚吗？", "不支持数据库式自动回滚。执行期某条命令失败，其他命令可能仍然执行。"],
      ["WATCH 是什么？", "WATCH 是乐观锁，监控 key 在 EXEC 前是否被修改，被修改则事务执行失败。"],
      ["Redis 事务和 Lua 怎么选？", "简单排队执行可用事务；需要读取、判断、写入合成原子逻辑时，Lua 通常更合适。"],
      ["事务期间其他客户端能执行命令吗？", "命令入队期间其他客户端仍可执行；EXEC 执行队列时不会被其他命令插入。"]
    ]
  },
  {
    file: "content/questions/redis/redis-unlink-vs-del.md",
    slug: "redis-unlink-vs-del",
    visual: {
      type: "compare",
      title: "UNLINK 与 DEL：同步删除和异步释放",
      summary: "DEL 同步删除并释放对象，UNLINK 先摘除 key 再由后台线程异步释放内存。",
      nodes: [
        ["DEL 同步释放", "删除 key 并在主线程释放内存"],
        ["大 key 阻塞风险", "释放大对象可能卡住事件循环"],
        ["UNLINK 摘除 key", "先从 keyspace 删除引用"],
        ["后台异步释放", "lazy free 线程回收对象内存"],
        ["内存延迟下降", "RSS 和 used_memory 不一定立即同步下降"],
        ["分批低峰治理", "大 key 清理要节流、监控和回滚"]
      ],
      prompt: "画一张对比图：DEL 同步释放 -> 大 key 阻塞风险 -> UNLINK 摘除 key -> 后台异步释放 -> 内存延迟下降 -> 分批低峰治理。突出删除可见性和释放成本分离。",
      takeaway: "DEL 立刻干活，UNLINK 先摘牌再后台清理。"
    },
    detail: [
      "DEL 和 UNLINK 都能让 key 对客户端不可见，但释放内存的方式不同。`DEL key` 会在主线程删除 key 并释放对象内存，如果对象很小问题不大；如果是大 Hash、大 List、大 Set 或大 ZSet，同步释放可能占用 Redis 事件循环，导致其他请求延迟上升。",
      "`UNLINK key` 会先把 key 从 keyspace 中摘除，让后续访问看不到它，再把对象内存释放交给后台 lazy free 线程处理。这样主线程停顿更短，适合删除大 key 或批量清理。不过 UNLINK 不代表内存立刻下降，后台线程仍需要时间释放，RSS 也可能受内存分配器影响延迟下降。",
      "Redis 还有相关 lazyfree 配置，例如用户删除是否异步、过期删除是否异步等。生产清理大 key 时，不要一次性扫出大量 key 后全部 UNLINK，也要分批、限速、低峰执行，并监控 CPU、内存、延迟、lazy free backlog 和业务错误。否则异步释放也可能造成后台压力和内存水位波动。",
      "面试回答可以说：小 key 用 DEL 没问题，大 key 和批量清理优先考虑 UNLINK 或拆分删除。真正治理大 key 的根本不是删除命令，而是数据结构拆分、分页读取、成员上限和生命周期管理。删除只是最后的清理动作。"
    ],
    followups: [
      ["UNLINK 后 key 还能读到吗？", "不能。UNLINK 会先从 keyspace 摘除 key，只是内存释放放到后台做。"],
      ["UNLINK 后内存为什么没立刻降？", "后台释放需要时间，RSS 还受内存分配器影响，不一定马上归还操作系统。"],
      ["是不是所有删除都用 UNLINK？", "小 key 用 DEL 就可以。大 key 或批量清理更适合 UNLINK，但也要分批限速。"],
      ["怎么安全清理大 key？", "先扫描和评估大小，低峰分批 UNLINK，监控延迟、CPU、内存和业务错误，再复盘 key 设计。"]
    ]
  },
  {
    file: "content/questions/redis/redlock.md",
    slug: "redis-redlock",
    visual: {
      type: "structure",
      title: "RedLock：多数派加锁与争议边界",
      summary: "RedLock 通过多个独立 Redis 实例多数派加锁提高可用性，但仍要面对时钟、网络分区和 fencing token 问题。",
      nodes: [
        ["多个独立实例", "向 N 个 Redis 实例尝试加锁"],
        ["多数派成功", "超过半数实例 SET NX PX 成功"],
        ["计算有效期", "扣除请求耗时和时钟漂移余量"],
        ["失败释放", "未达多数派要释放已获得的锁"],
        ["争议边界", "网络分区、暂停和时钟漂移影响安全性"],
        ["fencing token", "资源侧用单调 token 拒绝旧持有者"]
      ],
      prompt: "画一张结构图：多个独立实例 -> 多数派成功 -> 计算有效期 -> 失败释放 -> 争议边界 -> fencing token。突出 RedLock 不是强一致银弹。",
      takeaway: "RedLock 提高锁可用性，但强一致还要靠资源侧校验。"
    },
    detail: [
      "RedLock 是 Redis 作者提出的一种分布式锁算法，目标是在多个相互独立的 Redis 实例上加锁，避免单实例故障导致锁不可用或误判。典型流程是客户端依次向 N 个独立 Redis 实例执行 `SET key token NX PX ttl`，如果在有效时间内拿到超过半数实例的锁，就认为加锁成功；如果失败，要释放已经拿到的锁。",
      "RedLock 的关键不只是多数派，还要计算锁的有效期。客户端加锁过程本身会消耗时间，如果拿锁耗时太长，即使多数派成功，剩余有效期也可能不够业务执行。算法会用 TTL 减去请求耗时和时钟漂移余量，得到真正可用的锁时间。释放时仍然要用 token + Lua 校验删除，避免误删别人锁。",
      "争议点在于它是否足以支撑强一致资源保护。网络分区、进程暂停、GC 停顿、时钟漂移和 Redis 实例独立性不足，都可能让客户端误以为自己仍持有锁。Martin Kleppmann 对 RedLock 的批评重点是：如果锁用来保护强一致资源，仅靠租约锁还不够，资源侧应该使用 fencing token 这类单调递增凭证，拒绝过期持有者的旧写入。",
      "所以面试里不要把 RedLock 说成绝对可靠。更稳的回答是：RedLock 比单 Redis 锁更强调多数派和容错，但它仍是基于时间租约的锁，适合一定容错的互斥场景；如果是资金、库存、订单状态这类强一致写入，要在数据库或资源服务侧加版本、唯一约束、乐观锁或 fencing token，必要时使用 etcd/ZooKeeper。"
    ],
    followups: [
      ["RedLock 和普通 Redis 锁区别是什么？", "普通锁通常依赖单 Redis 实例，RedLock 尝试在多个独立实例上获得多数派锁。"],
      ["RedLock 为什么有争议？", "因为网络分区、暂停和时钟漂移下，仅靠时间租约不一定能保护强一致资源。"],
      ["什么是 fencing token？", "资源侧要求每次写入携带单调递增 token，并拒绝旧 token，防止过期锁持有者继续写。"],
      ["强一致场景该怎么选？", "优先让数据库或资源服务做版本校验、唯一约束或 fencing token，必要时使用 etcd/ZooKeeper 等一致性组件。"]
    ]
  }
];

const batch37 = [
  {
    file: "content/questions/redis/zset-ranking.md",
    slug: "redis-zset-ranking",
    visual: {
      type: "flow",
      title: "Redis ZSet 排行榜：写入、查询与治理",
      summary: "ZSet 用 member 表示对象、score 表示分数，排行榜要处理并列、分页、周期榜和大榜单裁剪。",
      nodes: [
        ["ZADD 写分数", "新增或更新用户、商品、帖子分数"],
        ["ZINCRBY 加分", "按行为增量更新 score"],
        ["ZREVRANGE 查榜", "按分数倒序分页返回榜单"],
        ["ZRANK 查名次", "查询个人排名和周围区间"],
        ["周期 key 滚动", "日榜、周榜、总榜分 key 管理"],
        ["裁剪和监控", "控制榜单大小、延迟、内存和热 key"]
      ],
      prompt: "画一张流程图：ZADD 写分数 -> ZINCRBY 加分 -> ZREVRANGE 查榜 -> ZRANK 查名次 -> 周期 key 滚动 -> 裁剪和监控。突出排行榜读写路径和治理点。",
      takeaway: "ZSet 排行榜简单在命令，难在分页、并列和大榜治理。"
    },
    detail: [
      "Redis ZSet 做排行榜的核心是 member 和 score。member 通常是用户 ID、商品 ID 或帖子 ID，score 是积分、热度、时间权重或综合分。写入用 `ZADD`，增量加分用 `ZINCRBY`，查榜常用 `ZREVRANGE key start stop WITHSCORES`，查个人排名用 `ZRANK` 或 `ZREVRANK`。这几条命令能覆盖大部分基础排行榜。",
      "真正项目里要处理几个细节。第一是并列分数，ZSet 分数相同会按成员字典序排序，如果业务要同分同名次，需要在应用层计算；如果要稳定排序，可以把时间、ID 或权重编码进 score，但要注意浮点精度。第二是分页，深分页会让范围查询和网络返回变大，排行榜通常只展示 TOP N，用户个人名次和附近排名单独查。",
      "第三是周期榜治理。日榜、周榜、月榜和总榜最好拆 key，例如 `rank:daily:2026-05-04`，过期清理历史短榜，总榜长期保留。大榜单要定期裁剪，如只保留前 10 万名，避免 ZSet 无限增长。热门榜单本身也可能成为热 key，需要本地缓存、只读副本、定时快照或分片榜再归并。",
      "面试回答可以按“写入分数、查询榜单、查询个人、处理并列、周期滚动、容量治理”讲。验证时看 ZSet 内存、命令耗时、榜单 key 访问频率、P99、网络返回大小和裁剪任务效果。只会说 ZADD/ZRANGE 是基础，能讲并列、分页、精度和大榜治理才像做过项目。"
    ],
    followups: [
      ["ZSet 同分怎么排序？", "Redis 会按 member 字典序处理，同分同名次或业务自定义排序通常要应用层补逻辑。"],
      ["排行榜深分页怎么处理？", "通常限制 TOP N 展示，个人排名和附近排名单独查，避免大量范围返回。"],
      ["日榜和总榜怎么设计 key？", "日榜、周榜、月榜按周期拆 key 并设置过期，总榜长期维护并定期裁剪。"],
      ["score 用浮点数有什么坑？", "复杂组合分可能受精度影响，最好明确分数范围和编码方式，不要无限叠加小数。"]
    ]
  },
  {
    file: "content/questions/spring/autowired-resource.md",
    slug: "autowired-resource",
    visual: {
      type: "compare",
      title: "@Autowired 与 @Resource：注入规则对比",
      summary: "@Autowired 默认按类型装配，@Resource 默认按名称优先；工程上更推荐构造器注入表达必需依赖。",
      nodes: [
        ["@Autowired", "Spring 提供，默认按类型查找 Bean"],
        ["@Qualifier", "多个候选时指定名称或限定符"],
        ["@Resource", "JSR 注解，默认按名称优先"],
        ["候选歧义", "多个同类型 Bean 要显式消除歧义"],
        ["构造器注入", "依赖必需、便于测试、支持不可变"],
        ["字段注入风险", "隐藏依赖，不利于单测和重构"]
      ],
      prompt: "画一张对比图：@Autowired -> @Qualifier -> @Resource -> 候选歧义 -> 构造器注入 -> 字段注入风险。突出注入规则和工程推荐。",
      takeaway: "注入不是谁更高级，而是依赖语义要清楚。"
    },
    detail: [
      "`@Autowired` 是 Spring 自己的注入注解，默认按类型查找 Bean。如果容器里只有一个匹配类型，直接注入；如果有多个同类型 Bean，就需要结合 `@Qualifier`、字段名、`@Primary` 等方式消除歧义。`@Resource` 来自 JSR 规范，常见语义是按名称优先，找不到再按类型匹配，新版本里包名可能从 `javax.annotation` 迁到 `jakarta.annotation`。",
      "面试时不要只背“一个按类型，一个按名称”。真正要讲的是依赖语义。按类型适合表达我需要某类能力，具体实现由容器决定；按名称适合明确依赖某个 Bean。多个实现并存时，必须显式说明注入谁，否则启动期就可能报错，或者后续新增 Bean 后出现歧义。",
      "工程上更推荐构造器注入。构造器注入能把必需依赖在对象创建时表达清楚，字段可以设为 final，更方便单元测试和不可变设计。字段注入写起来快，但依赖隐藏在类内部，脱离 Spring 容器不好构造对象，也不利于发现循环依赖。可选依赖可以用 setter、`ObjectProvider` 或 `required=false` 表达。",
      "回答收束可以说：`@Autowired` 和 `@Resource` 的区别是装配规则和来源不同，但项目里更重要的是依赖边界清楚、候选歧义可控、注入方式便于测试。面试官追问时，把 `@Qualifier`、`@Primary`、构造器注入和字段注入风险补上，答案就完整了。"
    ],
    followups: [
      ["多个同类型 Bean 怎么办？", "用 `@Qualifier` 指定名称，或用 `@Primary` 标记默认实现，也可以直接按名称使用 `@Resource`。"],
      ["为什么推荐构造器注入？", "必需依赖更明确，支持 final 字段，便于单测，也能更早暴露循环依赖。"],
      ["字段注入有什么问题？", "隐藏依赖、难以脱离容器测试、对象构造不完整，也不利于重构。"],
      ["@Resource 包名变化要注意什么？", "Spring Boot 3/Jakarta 生态下常见 `jakarta.annotation.Resource`，旧项目可能还是 `javax.annotation.Resource`。"]
    ]
  },
  {
    file: "content/questions/spring/bean-scope.md",
    slug: "spring-bean-scope",
    visual: {
      type: "structure",
      title: "Spring Bean 作用域：生命周期边界",
      summary: "Bean 作用域决定实例复用范围和生命周期管理方式，常见 singleton、prototype、request、session 和 application。",
      nodes: [
        ["singleton", "容器内单例，默认作用域"],
        ["prototype", "每次获取创建新对象"],
        ["request", "一次 HTTP 请求内共享"],
        ["session", "一个 HTTP Session 内共享"],
        ["application", "ServletContext 级别共享"],
        ["scoped proxy", "单例依赖短作用域 Bean 时使用代理"]
      ],
      prompt: "画一张结构图：singleton -> prototype -> request -> session -> application -> scoped proxy。突出实例复用范围和生命周期差异。",
      takeaway: "作用域回答要讲复用范围，也要讲谁负责销毁。"
    },
    detail: [
      "Spring Bean 作用域决定一个 Bean 实例在什么范围内被复用。默认是 singleton，也就是一个 ApplicationContext 中通常只有一个实例，适合无状态服务、DAO、配置类等。prototype 表示每次从容器获取都会创建新对象，适合有临时状态的对象，但 Spring 只负责创建和依赖注入，不完整管理其销毁阶段。",
      "Web 场景还有 request、session、application 等作用域。request 表示一次 HTTP 请求内复用同一个实例，session 表示一个用户会话内复用，application 表示 ServletContext 级别共享。它们依赖 WebApplicationContext，普通非 Web 容器里不能随便使用。某些场景还有 websocket scope。",
      "常见坑是单例 Bean 注入 prototype Bean。单例只在创建时注入一次 prototype 实例，后续不会每次方法调用都重新创建。如果确实需要每次拿新实例，可以用 `ObjectProvider`、`Provider`、lookup method 或 scoped proxy。短作用域 Bean 注入长作用域 Bean 时，代理也很常见，用来把真实对象解析推迟到当前请求或会话上下文。",
      "回答时要补线程安全。singleton 本身不是线程安全保证，只是实例复用范围。如果单例 Bean 保存可变成员变量，在多线程请求下仍可能出问题。面试里按“作用域定义、生命周期管理、Web 作用域、单例注入原型坑、线程安全边界”组织，会比只列名字更稳。"
    ],
    followups: [
      ["singleton 是全 JVM 单例吗？", "不是。它通常是单个 Spring 容器内单例，不是整个 JVM 或所有应用共享。"],
      ["prototype Bean 谁负责销毁？", "Spring 负责创建和注入，但不会完整管理销毁回调，资源释放通常要业务自己处理。"],
      ["单例注入 prototype 为什么不会每次新建？", "依赖注入发生在单例创建时，只注入一次。要每次获取新对象，需要 ObjectProvider、lookup method 或代理。"],
      ["singleton Bean 一定线程安全吗？", "不一定。无状态通常安全，有可变成员状态就要自己保证并发安全。"]
    ]
  },
  {
    file: "content/questions/spring/beanfactory-applicationcontext.md",
    slug: "beanfactory-applicationcontext",
    visual: {
      type: "compare",
      title: "BeanFactory 与 ApplicationContext：容器能力对比",
      summary: "BeanFactory 是基础 Bean 容器，ApplicationContext 在此基础上提供事件、国际化、资源、环境和 Web 集成。",
      nodes: [
        ["BeanFactory", "基础 IoC 容器，提供 Bean 获取和管理"],
        ["延迟创建倾向", "按需创建 Bean 的基础能力"],
        ["ApplicationContext", "更完整的应用上下文"],
        ["预实例化单例", "启动 refresh 时创建大多数单例 Bean"],
        ["扩展能力", "事件、国际化、资源、Environment"],
        ["实际开发首选", "Boot 和 Web 项目通常使用 ApplicationContext"]
      ],
      prompt: "画一张对比图：BeanFactory -> 延迟创建倾向 -> ApplicationContext -> 预实例化单例 -> 扩展能力 -> 实际开发首选。突出基础容器和应用上下文的差异。",
      takeaway: "BeanFactory 管 Bean，ApplicationContext 管应用上下文。"
    },
    detail: [
      "BeanFactory 是 Spring IoC 的基础接口，核心能力是保存 BeanDefinition、创建 Bean、管理依赖并按名称或类型返回 Bean。ApplicationContext 继承并扩展了 BeanFactory，是更完整的应用上下文，除了 Bean 管理，还提供国际化消息、事件发布、资源加载、Environment、应用启动生命周期和 Web 集成。",
      "两者的一个常见区别是初始化时机。基础 BeanFactory 更偏按需创建，ApplicationContext 在 refresh 阶段通常会预实例化非懒加载单例 Bean，因此很多配置错误能在启动期暴露。它还会自动识别并注册 BeanPostProcessor、BeanFactoryPostProcessor、事件监听器等扩展点，让 AOP、事务、自动装配等能力更容易工作。",
      "实际开发中，几乎总是在使用 ApplicationContext。Spring Boot 启动后创建的是各种 ApplicationContext 实现，例如 Web 应用中的 ServletWebServerApplicationContext。我们很少直接操作底层 BeanFactory，但理解 BeanFactory 有助于理解 Bean 创建、后处理器、FactoryBean 和循环依赖。",
      "面试回答可以一句话收束：BeanFactory 是 IoC 容器基础，ApplicationContext 是面向完整应用的容器实现。讲完概念后，补启动预实例化、事件、国际化、资源、Environment、WebApplicationContext 和实际开发为什么首选 ApplicationContext，答案就不会显得空。"
    ],
    followups: [
      ["ApplicationContext 为什么更常用？", "它集成事件、资源、国际化、环境、生命周期和 Web 能力，适合完整应用开发。"],
      ["BeanFactory 是不是过时了？", "不是。它是底层基础接口，ApplicationContext 也是基于它扩展出来的。"],
      ["预实例化单例有什么好处？", "能在启动期提前发现依赖缺失、配置错误和 Bean 创建失败，避免运行时才暴露。"],
      ["BeanPostProcessor 谁来管理？", "ApplicationContext refresh 过程中会注册并应用这些扩展点，支持 AOP、事务等能力。"]
    ]
  },
  {
    file: "content/questions/spring/beanpostprocessor.md",
    slug: "beanpostprocessor",
    visual: {
      type: "flow",
      title: "BeanPostProcessor：初始化前后的扩展点",
      summary: "BeanPostProcessor 在 Bean 初始化前后介入，是 AOP、代理增强和框架扩展的重要入口。",
      nodes: [
        ["实例化 Bean", "构造对象"],
        ["属性填充", "注入依赖和配置值"],
        ["初始化前处理", "postProcessBeforeInitialization"],
        ["初始化方法", "afterPropertiesSet 或 init-method"],
        ["初始化后处理", "postProcessAfterInitialization"],
        ["可能生成代理", "AOP 等能力常在初始化后返回代理对象"]
      ],
      prompt: "画一张流程图：实例化 Bean -> 属性填充 -> 初始化前处理 -> 初始化方法 -> 初始化后处理 -> 可能生成代理。突出 BeanPostProcessor 的生命周期位置。",
      takeaway: "BeanPostProcessor 不是创建 Bean，而是在初始化前后加工 Bean。"
    },
    detail: [
      "BeanPostProcessor 是 Spring Bean 生命周期里的扩展点，发生在 Bean 已经实例化、属性也填充之后，围绕初始化方法前后执行。它有两个核心方法：`postProcessBeforeInitialization` 和 `postProcessAfterInitialization`。前者在初始化回调前执行，后者在初始化回调后执行。",
      "很多 Spring 能力都依赖 BeanPostProcessor。例如 AOP 自动代理创建器会在初始化后判断当前 Bean 是否需要被代理，如果需要就返回代理对象；`@Autowired`、`@PostConstruct`、配置属性绑定等也和不同类型的后处理器有关。理解它的位置，才能理解为什么拿到的 Bean 可能已经不是原始对象，而是代理。",
      "BeanPostProcessor 和 BeanFactoryPostProcessor 要区分。BeanFactoryPostProcessor 处理的是 BeanDefinition 等容器元数据，发生得更早；BeanPostProcessor 处理的是 Bean 实例，发生在对象创建过程里。还有 InstantiationAwareBeanPostProcessor 可以更早介入实例化和属性填充阶段，属于更底层的扩展。",
      "使用时要注意顺序和成本。多个 BeanPostProcessor 可以通过 Ordered 控制顺序；后处理器会作用于大量 Bean，不适合做重 IO 或复杂业务逻辑。面试回答按“生命周期位置、两个方法、AOP 代理、和 BeanFactoryPostProcessor 区别、顺序和性能边界”讲，就比较完整。"
    ],
    followups: [
      ["BeanPostProcessor 在什么时候执行？", "在 Bean 属性填充之后，初始化方法前后执行。"],
      ["AOP 代理和它有什么关系？", "自动代理创建器本身就是后处理器，常在初始化后返回代理对象。"],
      ["它和 BeanFactoryPostProcessor 区别是什么？", "BeanFactoryPostProcessor 处理 BeanDefinition，发生更早；BeanPostProcessor 处理 Bean 实例。"],
      ["能在后处理器里写业务逻辑吗？", "不建议。它会影响很多 Bean，重逻辑和 IO 会拖慢启动并增加隐蔽副作用。"]
    ]
  },
  {
    file: "content/questions/spring/circular-dependency.md",
    slug: "spring-circular-dependency",
    visual: {
      type: "flow",
      title: "Spring 循环依赖：三级缓存处理路径",
      summary: "Spring 只能解决部分单例 setter/字段注入循环依赖，构造器循环依赖和设计耦合仍要主动规避。",
      nodes: [
        ["A 创建中", "实例化 A 但属性还没填完"],
        ["暴露早期工厂", "把 ObjectFactory 放入三级缓存"],
        ["A 依赖 B", "填充属性时需要创建 B"],
        ["B 依赖 A", "从缓存拿到 A 的早期引用"],
        ["处理代理一致性", "AOP 场景可能暴露早期代理"],
        ["边界限制", "构造器循环依赖通常无法解决"]
      ],
      prompt: "画一张流程图：A 创建中 -> 暴露早期工厂 -> A 依赖 B -> B 依赖 A -> 处理代理一致性 -> 边界限制。突出三级缓存和构造器限制。",
      takeaway: "能解决循环依赖，不代表应该设计循环依赖。"
    },
    detail: [
      "Spring 解决的是部分单例 Bean 的 setter 或字段注入循环依赖。假设 A 依赖 B，B 又依赖 A，Spring 创建 A 时会先实例化 A，再把能获取 A 早期引用的 ObjectFactory 放进三级缓存。之后填充 A 属性时发现需要 B，于是创建 B；B 填充属性时又需要 A，就可以从缓存里拿到 A 的早期引用。",
      "三级缓存通常理解为 singletonObjects、earlySingletonObjects 和 singletonFactories。一级缓存放完整单例，二级缓存放早期暴露对象，三级缓存放对象工厂。三级缓存的意义之一是处理 AOP 代理一致性：如果某个 Bean 最终需要代理，早期暴露时也要尽量拿到一致的代理引用，避免一个地方拿原始对象，一个地方拿代理对象。",
      "边界必须主动讲。构造器循环依赖通常无法解决，因为构造 A 必须先有 B，构造 B 又必须先有 A，连早期半成品对象都没有机会暴露。prototype 作用域的循环依赖也不能像单例那样处理。Spring Boot 新版本还倾向于默认禁止循环依赖，需要显式配置才允许，这也反映了框架不鼓励这种设计。",
      "工程上，循环依赖往往说明职责边界不清。更好的方案是抽出第三个协调服务、引入事件、拆分读写职责，或者把双向调用改成单向依赖。面试回答可以说：Spring 有机制兜底部分历史代码，但设计上应该避免循环依赖，尤其不要依赖它来掩盖领域模型混乱。"
    ],
    followups: [
      ["三级缓存分别是什么？", "一级放完整单例，二级放早期引用，三级放能生成早期引用的 ObjectFactory。"],
      ["构造器循环依赖为什么不行？", "构造时必须先拿到完整依赖，没有机会先暴露半成品对象。"],
      ["AOP 为什么让循环依赖更复杂？", "因为最终 Bean 可能是代理对象，早期暴露也要考虑代理一致性。"],
      ["项目里应该怎么处理循环依赖？", "优先重构职责，抽协调服务、事件或接口，避免两个服务互相直接调用。"]
    ]
  },
  {
    file: "content/questions/spring/conditional-annotation.md",
    slug: "spring-conditional-annotation",
    visual: {
      type: "structure",
      title: "@Conditional：条件装配判断链",
      summary: "@Conditional 通过 Condition 接口在 Bean 注册阶段判断是否加载配置或 Bean，是自动配置的基础。",
      nodes: [
        ["读取注解元数据", "AnnotatedTypeMetadata 提供类和方法注解信息"],
        ["创建 Condition", "实现 matches 方法"],
        ["查看上下文", "ConditionContext 提供环境、BeanFactory、类加载器"],
        ["判断是否匹配", "按类存在、属性、Bean、Profile 等条件判断"],
        ["决定注册 Bean", "匹配才注册配置类或 BeanDefinition"],
        ["自动配置使用", "@ConditionalOnClass/OnMissingBean/OnProperty"]
      ],
      prompt: "画一张结构图：读取注解元数据 -> 创建 Condition -> 查看上下文 -> 判断是否匹配 -> 决定注册 Bean -> 自动配置使用。突出条件装配发生在注册阶段。",
      takeaway: "@Conditional 的本质是有条件地注册 Bean。"
    },
    detail: [
      "`@Conditional` 用来控制某个配置类或 Bean 是否应该注册到容器。它的核心是 Condition 接口，里面的 `matches` 方法返回 true 时条件成立，相关 BeanDefinition 才会继续注册。判断时可以通过 ConditionContext 拿到 Environment、BeanFactory、类加载器和资源加载器，通过 AnnotatedTypeMetadata 读取注解元数据。",
      "Spring Boot 自动配置大量依赖条件注解。常见的 `@ConditionalOnClass` 表示某个类存在才启用配置，`@ConditionalOnMissingBean` 表示容器里没有用户自定义 Bean 时才提供默认 Bean，`@ConditionalOnProperty` 根据配置开关决定是否启用。它们让 starter 能做到“引入依赖后按环境自动生效，但用户仍可覆盖”。",
      "面试里要讲清楚发生时机。条件判断主要发生在配置解析和 BeanDefinition 注册阶段，不是每次调用 Bean 方法时动态判断。配置条件如果不满足，Bean 可能根本不会进入容器。排查自动配置为什么没生效，可以看启动 debug 日志、ConditionEvaluationReport 或 Actuator 条件报告。",
      "使用条件装配要注意边界。条件太复杂会让启动行为难理解；`@ConditionalOnMissingBean` 要注意 Bean 名称、类型和注册顺序；属性条件要明确默认值和开关语义。回答可以收束为：`@Conditional` 是 Spring 把“是否装配”变成可声明规则的机制，也是 Spring Boot 自动配置可插拔的基础。"
    ],
    followups: [
      ["@Conditional 在什么时候判断？", "主要在配置解析和 BeanDefinition 注册阶段判断，条件不满足时 Bean 不会注册。"],
      ["ConditionContext 能拿到什么？", "能拿 Environment、BeanFactory、ClassLoader、ResourceLoader 等上下文信息。"],
      ["Spring Boot 哪些条件注解常见？", "`@ConditionalOnClass`、`@ConditionalOnMissingBean`、`@ConditionalOnProperty`、`@ConditionalOnBean` 等。"],
      ["怎么排查自动配置没生效？", "看 debug 启动日志、ConditionEvaluationReport、Actuator conditions 和相关配置属性。"]
    ]
  },
  {
    file: "content/questions/spring/configuration-priority.md",
    slug: "spring-boot-configuration-priority",
    visual: {
      type: "flow",
      title: "Spring Boot 配置优先级：覆盖和排查",
      summary: "Spring Boot 配置按来源加载并互相覆盖，排查时要看 ConfigData、profile、环境变量、系统属性和命令行参数。",
      nodes: [
        ["默认配置文件", "application.yml/properties 提供基础值"],
        ["Profile 配置", "application-dev.yml 覆盖同名 key"],
        ["外部配置", "jar 外配置和 ConfigData 优先级更高"],
        ["环境变量", "适合容器部署，注意命名转换"],
        ["系统和命令行", "JVM -D 与启动参数常用于临时覆盖"],
        ["Actuator 排查", "/actuator/env 查看属性来源"]
      ],
      prompt: "画一张流程图：默认配置文件 -> Profile 配置 -> 外部配置 -> 环境变量 -> 系统和命令行 -> Actuator 排查。突出同名 key 覆盖和来源定位。",
      takeaway: "配置优先级不是背表，而是能找出值从哪里来。"
    },
    detail: [
      "Spring Boot 配置优先级要理解成多个 PropertySource 的覆盖关系。同一个 key 可能来自 application.yml、profile 配置、环境变量、JVM 系统属性、命令行参数、配置中心或测试注解，最终生效的是优先级更高的来源。面试里不用死背完整长表，但要能讲清同名 key 为什么会被覆盖，以及怎么排查来源。",
      "常见顺序可以从基础到覆盖理解：项目内 `application.yml` 提供默认值，`application-dev.yml` 等 profile 配置覆盖环境差异，jar 外部配置通常更适合部署覆盖，环境变量适合容器和云平台，`-D` 系统属性和命令行参数常用于临时覆盖。Spring Boot 2.4 之后 ConfigData 机制改变了配置文件加载方式，配置中心也常接入这一套。",
      "环境变量还有命名转换问题，例如 `SERVER_PORT` 可以绑定到 `server.port`，数组、横线和大小写转换都要注意。profile 激活也有新旧写法差异，比如 `spring.profiles.active` 和 `spring.config.activate.on-profile`。如果配置中心支持动态刷新，还要说明刷新范围，不是所有配置变更都能无感生效。",
      "排查时最有用的是 `/actuator/env`、启动日志和配置绑定错误信息。Actuator 可以看到属性值来自哪个 PropertySource，但生产要注意敏感信息脱敏和端点保护。回答可以收束为：配置优先级的关键不是背顺序，而是知道如何定位一个配置最终值来自哪里、为什么覆盖、如何安全修改和回滚。"
    ],
    followups: [
      ["命令行参数和配置文件谁优先？", "通常命令行参数优先级更高，适合临时覆盖，但生产要避免随意漂移。"],
      ["环境变量怎么映射到配置 key？", "通常用大写和下划线，例如 SERVER_PORT 映射 server.port，复杂结构要注意绑定规则。"],
      ["怎么确认配置来自哪里？", "用 `/actuator/env`、启动日志和配置绑定报告查看属性来源和最终值。"],
      ["配置中心刷新所有 Bean 都生效吗？", "不一定。要看刷新机制、Bean 作用域和配置绑定方式，有些配置仍需要重启。"]
    ]
  },
  {
    file: "content/questions/spring/controller-restcontroller.md",
    slug: "controller-restcontroller",
    visual: {
      type: "compare",
      title: "@Controller 与 @RestController：返回模型对比",
      summary: "@Controller 常用于页面和视图，@RestController 等价于 @Controller 加 @ResponseBody，默认返回响应体。",
      nodes: [
        ["@Controller", "返回视图名或配合 ResponseBody 返回数据"],
        ["视图解析", "字符串可能被当作模板视图名"],
        ["@ResponseBody", "把返回值写入 HTTP 响应体"],
        ["@RestController", "类级别默认所有方法返回响应体"],
        ["消息转换器", "JSON/XML 序列化依赖 HttpMessageConverter"],
        ["接口实践", "REST API 常配 ResponseEntity 和统一异常"]
      ],
      prompt: "画一张对比图：@Controller -> 视图解析 -> @ResponseBody -> @RestController -> 消息转换器 -> 接口实践。突出返回视图和返回响应体的区别。",
      takeaway: "@RestController 是接口默认写响应体，不是更高级的 Controller。"
    },
    detail: [
      "`@Controller` 是 Spring MVC 的控制器注解，通常用于返回页面或视图。方法返回字符串时，如果没有 `@ResponseBody`，Spring MVC 可能把它当作视图名交给视图解析器。`@RestController` 可以理解为 `@Controller` 加 `@ResponseBody`，类中方法默认把返回值写入 HTTP 响应体，常用于 REST API。",
      "返回 JSON 的关键不是注解本身，而是 HttpMessageConverter。`@ResponseBody` 或 `@RestController` 返回对象时，Spring 会根据 Content-Type、Accept 和已注册转换器，把对象序列化成 JSON、XML 或其他格式。配置不当时可能出现 406、415、序列化字段异常或日期格式不一致。",
      "实际项目里，前后端分离接口通常用 `@RestController`，页面渲染或模板项目用 `@Controller`。如果同一个类既返回页面又返回 JSON，要小心注解位置，避免把视图名当成普通字符串响应。接口返回还常配合 `ResponseEntity` 控制状态码、header 和 body，异常则通过全局异常处理统一格式。",
      "面试回答可以一句话定调：区别在返回值处理方式，`@Controller` 默认走视图解析，`@RestController` 默认走响应体写出。然后补消息转换器、视图解析、ResponseEntity 和统一异常处理，就比只说“RestController 返回 JSON”更完整。"
    ],
    followups: [
      ["@RestController 一定返回 JSON 吗？", "不一定。它返回响应体，具体格式由 HttpMessageConverter 和内容协商决定，常见是 JSON。"],
      ["@Controller 返回字符串会怎样？", "默认可能被当作视图名解析；加 `@ResponseBody` 才会作为响应体字符串返回。"],
      ["什么时候用 ResponseEntity？", "需要显式控制 HTTP 状态码、Header、缓存策略或响应体时使用。"],
      ["前后端分离为什么常用 @RestController？", "因为接口通常直接返回 JSON 数据，不需要服务端视图解析。"]
    ]
  },
  {
    file: "content/questions/spring/factorybean.md",
    slug: "factorybean",
    visual: {
      type: "structure",
      title: "FactoryBean：工厂本身和产品 Bean",
      summary: "FactoryBean 让一个 Bean 负责创建另一个复杂对象，常用于代理、连接工厂和框架集成。",
      nodes: [
        ["FactoryBean 本身", "实现 getObject、getObjectType、isSingleton"],
        ["getObject", "返回真正暴露给容器的产品对象"],
        ["getObjectType", "告诉容器产品类型便于按类型查找"],
        ["isSingleton", "声明产品对象是否单例"],
        ["&beanName", "加 & 获取工厂本身而不是产品"],
        ["典型场景", "MyBatis Mapper、代理工厂、复杂客户端"]
      ],
      prompt: "画一张结构图：FactoryBean 本身 -> getObject -> getObjectType -> isSingleton -> &beanName -> 典型场景。突出工厂 Bean 和产品 Bean 的区别。",
      takeaway: "FactoryBean 是生产 Bean 的 Bean。"
    },
    detail: [
      "FactoryBean 是 Spring 里一个特殊接口，用来让某个 Bean 负责创建另一个复杂对象。普通 Bean 注册后，容器返回的就是这个对象本身；FactoryBean 注册后，默认通过 beanName 获取到的是 `getObject()` 生产出来的产品对象，而不是工厂对象本身。要获取工厂本身，需要使用 `&beanName`。",
      "FactoryBean 有三个关键方法：`getObject()` 返回产品对象，`getObjectType()` 返回产品类型，便于容器做类型推断和自动装配，`isSingleton()` 表示产品对象是否单例。它适合创建普通构造方式不方便的对象，例如代理对象、RPC 客户端、MyBatis Mapper、复杂连接工厂或第三方 SDK 客户端。",
      "FactoryBean 和 BeanFactory 名字像，但完全不是一回事。BeanFactory 是 Spring 容器基础接口，负责管理所有 Bean；FactoryBean 是一个普通 Bean 实现的扩展接口，只负责生产某个特定对象。面试里如果把两者混淆，会显得对 Spring 容器层次不清楚。",
      "FactoryBean 的边界是不要滥用。简单对象用 `@Bean` 方法或组件扫描就够了，只有创建过程复杂、需要框架隐藏代理细节或要把动态对象交给容器管理时，才适合 FactoryBean。回答可以用 MyBatis Mapper 举例：接口本身没有实现类，框架通过工厂创建代理对象并交给 Spring 注入。"
    ],
    followups: [
      ["FactoryBean 和 BeanFactory 有什么区别？", "BeanFactory 是容器接口，FactoryBean 是一个能生产对象的特殊 Bean。"],
      ["为什么 `&beanName` 能拿到工厂？", "默认 beanName 返回 FactoryBean 的产品对象，加 & 才表示获取 FactoryBean 本身。"],
      ["getObjectType 有什么用？", "让容器提前知道产品类型，支持按类型查找、自动装配和条件判断。"],
      ["FactoryBean 适合什么场景？", "适合代理对象、复杂客户端、Mapper 接口、连接工厂等普通构造不方便的对象。"]
    ]
  }
];

const batch38 = [
  {
    file: "content/questions/spring/filter-interceptor-aop.md",
    slug: "filter-interceptor-aop",
    visual: {
      type: "compare",
      title: "Filter、Interceptor、AOP：拦截位置对比",
      summary: "Filter 在 Servlet 容器层，Interceptor 在 Spring MVC Handler 链路，AOP 在 Spring Bean 方法调用边界。",
      nodes: [
        ["Filter 层", "进入 DispatcherServlet 前后，适合编码、鉴权粗过滤、跨域"],
        ["Servlet 容器", "由 Web 容器管理，可拦静态资源和非 Spring 请求"],
        ["Interceptor 层", "HandlerMapping 找到处理器后进入 Spring MVC 回调"],
        ["Controller 前后", "preHandle、postHandle、afterCompletion 处理请求链"],
        ["AOP 代理层", "拦截 Spring Bean 方法，适合事务、日志、权限切面"],
        ["按边界选择", "看是否需要 HTTP 原始信息、MVC 上下文或方法语义"]
      ],
      prompt: "画一张对比图：Filter 层 -> Servlet 容器 -> Interceptor 层 -> Controller 前后 -> AOP 代理层 -> 按边界选择。突出三者所在层次、管理者和适用场景差异。",
      takeaway: "三者不是谁替代谁，而是拦截边界不同。"
    },
    detail: [
      "Filter、Interceptor、AOP 的核心区别不是“都能拦截”，而是拦截发生的位置不同。Filter 属于 Servlet 规范，运行在 Web 容器层，请求进入 DispatcherServlet 之前就可能经过 Filter；Interceptor 属于 Spring MVC，只有请求被映射到 Handler 后才进入拦截器链；AOP 属于 Spring Bean 方法增强，关注的是对象方法调用，而不是 HTTP 请求本身。",
      "Filter 更靠近网络入口，适合处理编码、CORS、粗粒度鉴权、日志 traceId、请求包装和安全过滤。它能覆盖静态资源、非 MVC 请求和进入 Spring 前的流量，但拿不到完整的 HandlerMethod 语义。Interceptor 更靠近 MVC 调度，能拿到 handler，适合登录态检查、接口权限、租户上下文、请求耗时和业务级审计。它有 preHandle、postHandle、afterCompletion 三个回调，可以表达放行、响应后处理和最终清理。",
      "AOP 更适合横切业务方法，例如事务、方法级权限、幂等注解、审计日志、限流注解和埋点。它依赖 Spring 代理，只有经过代理对象的方法调用才会增强，自调用、private/final 方法、非 Spring Bean 都可能不生效。回答时要主动说明：AOP 不关心 URL 是否命中，它关心的是哪个 Bean 的哪个方法被代理调用。",
      "选择时可以按边界判断：需要在请求进入 Spring 前处理，用 Filter；需要基于 Handler、路径、用户上下文处理，用 Interceptor；需要基于业务方法、注解、事务语义处理，用 AOP。异常链路也不同：Filter 要在 finally 里清理上下文，Interceptor 的 afterCompletion 在 Handler 执行完成后更适合收尾，AOP 则通过 around/afterThrowing 观察方法异常。",
      "面试图解适合画成请求从浏览器进入服务的纵向链路：Web 容器先执行 Filter，DispatcherServlet 找 Handler 后执行 Interceptor，Controller 调 Service 时进入 AOP 代理。这样回答比简单背“Filter 依赖 Servlet、Interceptor 依赖 Spring、AOP 依赖代理”更能体现工程边界。"
    ],
    followups: [
      ["静态资源会经过 Interceptor 吗？", "不一定。取决于资源处理和拦截路径配置。Filter 更靠前，通常更容易覆盖静态资源和非 MVC 请求。"],
      ["preHandle 返回 false 会怎样？", "Controller 不会继续执行，通常要在 preHandle 内自己写响应或交给上层统一处理，否则客户端可能拿到空响应。"],
      ["AOP 为什么会自调用失效？", "同类内部 this.method 调用没有经过 Spring 代理对象，所以切面、事务、异步等增强都不会触发。"],
      ["三者都能做鉴权时怎么选？", "入口粗过滤和安全防线放 Filter，基于 Handler 的接口权限放 Interceptor，方法级权限或注解语义放 AOP。"]
    ]
  },
  {
    file: "content/questions/spring/interceptor-filter-order.md",
    slug: "filter-interceptor-order",
    visual: {
      type: "sequence",
      title: "Filter 与 Interceptor：请求执行顺序",
      summary: "请求先进入 Filter 链，再到 DispatcherServlet 和 Interceptor，返回时按相反方向收尾。",
      nodes: [
        ["进入 Filter1", "按 order 或注册顺序执行 doFilter 前置逻辑"],
        ["进入 Filter2", "多个 Filter 像洋葱一样嵌套"],
        ["DispatcherServlet", "完成 HandlerMapping 和 HandlerAdapter 调度"],
        ["preHandle", "多个 Interceptor 按注册顺序前置执行"],
        ["Controller 执行", "HandlerAdapter 调用控制器方法"],
        ["返回和清理", "postHandle、afterCompletion、Filter 后置依次收尾"]
      ],
      prompt: "画一张时序图：进入 Filter1 -> 进入 Filter2 -> DispatcherServlet -> preHandle -> Controller 执行 -> 返回和清理。标出返回阶段 Filter 后置、postHandle、afterCompletion 的顺序。",
      takeaway: "请求进来先 Filter 后 Interceptor，返回时外层 Filter 最后收尾。"
    },
    detail: [
      "多个 Filter 和 Interceptor 的顺序可以用“洋葱模型”理解。请求进入应用时，先经过 Servlet Filter 链，Filter1 前置逻辑执行后调用 chain.doFilter，进入 Filter2，再继续进入 DispatcherServlet。Controller 执行完返回时，会从内到外依次回到 Filter2 后置逻辑、Filter1 后置逻辑。所以 Filter 的前置按顺序进入，后置按反向退出。",
      "Interceptor 的位置在 DispatcherServlet 之内。DispatcherServlet 通过 HandlerMapping 找到 HandlerExecutionChain 后，会按注册顺序执行多个 Interceptor 的 preHandle。只有所有 preHandle 都返回 true，Controller 才会执行。Controller 正常返回 ModelAndView 后，postHandle 按反向顺序执行；请求完成后，afterCompletion 也按反向顺序执行，用来释放 ThreadLocal、记录耗时和清理上下文。",
      "异常和短路是这道题的追问重点。如果某个 preHandle 返回 false，后续 Interceptor 和 Controller 不会执行，已经成功执行过 preHandle 的 Interceptor 可能进入 afterCompletion 收尾。Controller 抛异常时，postHandle 通常不会按正常路径执行，但 afterCompletion 仍然是重要的清理入口。Filter 如果要保证上下文清理，必须用 try/finally 包住 chain.doFilter。",
      "顺序配置也要分层看。Filter 可通过 FilterRegistrationBean、@Order 或容器注册顺序控制；Interceptor 通过 WebMvcConfigurer.addInterceptors 的注册顺序控制，也可以配 includePathPatterns 和 excludePathPatterns。AOP 发生在 Controller 或 Service 方法调用边界，若 Controller 方法本身被代理，才会出现在方法执行附近；多数业务 Service AOP 则发生在 Controller 调用 Service 之后。",
      "面试回答可以先画顺序，再补短路和异常。完整链路是：Filter 前置 -> DispatcherServlet -> Interceptor preHandle -> Controller -> Interceptor postHandle -> 视图或响应处理 -> Interceptor afterCompletion -> Filter 后置。能把 false、异常、finally、ThreadLocal 清理讲出来，说明你不是只背调用顺序。"
    ],
    followups: [
      ["postHandle 一定会执行吗？", "不一定。Controller 抛异常或 preHandle 短路时，postHandle 可能不执行，因此清理资源不要依赖它。"],
      ["afterCompletion 适合做什么？", "适合记录最终耗时、清理 ThreadLocal、释放上下文，因为它更接近请求完成的收尾阶段。"],
      ["Filter 的后置逻辑怎么保证执行？", "用 try/finally 包住 chain.doFilter，避免下游异常导致上下文无法清理。"],
      ["Filter 和 Interceptor 顺序能混排吗？", "不能跨层混排。Filter 永远在 Servlet 容器层，Interceptor 在 DispatcherServlet 调度之后。"]
    ]
  },
  {
    file: "content/questions/spring/spring-actuator.md",
    slug: "spring-boot-actuator",
    visual: {
      type: "structure",
      title: "Spring Boot Actuator：端点、指标与安全边界",
      summary: "Actuator 是生产观测入口，必须同时讲健康检查、Micrometer 指标、端点暴露和敏感信息保护。",
      nodes: [
        ["Health 端点", "readiness/liveness 判断服务是否可接流量"],
        ["Metrics 指标", "Micrometer 暴露 JVM、HTTP、线程池和业务指标"],
        ["Prometheus 抓取", "/actuator/prometheus 对接监控系统"],
        ["Env 和 Config", "排查属性来源，但包含敏感信息风险"],
        ["暴露控制", "management.endpoints.web.exposure.include 精准开放"],
        ["安全隔离", "鉴权、内网、脱敏、禁止公开敏感端点"]
      ],
      prompt: "画一张结构图：Health 端点 -> Metrics 指标 -> Prometheus 抓取 -> Env 和 Config -> 暴露控制 -> 安全隔离。突出 Actuator 既是观测入口也是安全风险点。",
      takeaway: "Actuator 能帮你看见应用，也可能泄露应用。"
    },
    detail: [
      "Spring Boot Actuator 提供一组生产运维端点，用来观察应用是否健康、指标是否异常、配置是否生效、线程和日志是否需要排查。它不是业务功能，而是应用的仪表盘。常见端点包括 health、metrics、prometheus、info、env、beans、loggers、threaddump 等，面试里要把“能看什么”和“为什么不能乱暴露”一起讲。",
      "健康检查要区分 liveness 和 readiness。liveness 关注进程是否还活着，readiness 关注是否可以接收流量。Kubernetes 或负载均衡常用 readiness 决定是否把请求打进来。如果 health 检查里塞了复杂业务逻辑，反而可能因为下游短暂抖动把健康实例踢掉，所以健康检查要轻量、分组、可解释。",
      "指标部分的核心是 Micrometer。Actuator 会把 JVM 内存、GC、线程、HTTP 请求、连接池等指标交给 Micrometer，再对接 Prometheus、Grafana 或其他监控系统。项目里还可以注册业务指标，例如订单成功率、队列积压、线程池拒绝次数。面试回答如果只说“看健康检查”，就少了生产可观测性的重点。",
      "安全边界必须主动强调。生产环境通常只暴露必要端点，例如 health、info、metrics、prometheus；env、beans、heapdump、threaddump、logfile 等可能泄露环境变量、Bean 信息、线程栈和敏感配置。配置上要通过 `management.endpoints.web.exposure.include` 精准开放，通过 Spring Security、内网网关、IP 白名单和脱敏策略保护端点。",
      "排查时可以用 Actuator 做证据入口：health 看依赖状态，metrics 看 HTTP P95、错误率、JVM、线程池，env 看属性来源，conditions 看自动配置命中，loggers 临时调整日志级别。回答收束时可以说：Actuator 的价值是让服务从黑盒变成可观测对象，但必须按最小暴露原则接入监控和安全。"
    ],
    followups: [
      ["health 能不能直接查数据库和下游？", "可以但要谨慎。应分组、限时、轻量，避免下游短暂抖动导致实例被错误摘流量。"],
      ["Actuator 怎么接 Prometheus？", "引入 micrometer-registry-prometheus，开放 prometheus 端点，由 Prometheus 周期抓取指标。"],
      ["生产环境哪些端点危险？", "env、beans、heapdump、threaddump、logfile、configprops 等都可能泄露敏感信息，要限制或关闭。"],
      ["怎么排查自动配置没生效？", "可以看 conditions 或启动 --debug 的 ConditionEvaluationReport，再结合 env 查看属性来源。"]
    ]
  },
  {
    file: "content/questions/spring/spring-aop.md",
    slug: "spring-aop",
    visual: {
      type: "flow",
      title: "Spring AOP：代理增强调用链",
      summary: "Spring AOP 通过代理对象在方法调用前后织入通知，适合横切关注点但受代理边界限制。",
      nodes: [
        ["业务调用代理", "调用方拿到的是 Spring 生成的代理对象"],
        ["匹配切点", "Pointcut 判断类、方法、注解或包路径"],
        ["执行前置通知", "鉴权、日志、参数校验等前置逻辑"],
        ["调用目标方法", "代理委托真实 Bean 方法执行"],
        ["异常或返回通知", "afterReturning、afterThrowing、around 收尾"],
        ["代理边界限制", "自调用、final/private、非 Spring Bean 可能失效"]
      ],
      prompt: "画一张流程图：业务调用代理 -> 匹配切点 -> 执行前置通知 -> 调用目标方法 -> 异常或返回通知 -> 代理边界限制。突出代理对象和目标对象的区别。",
      takeaway: "AOP 的关键不是切面语法，而是调用必须经过代理。"
    },
    detail: [
      "Spring AOP 是 Spring 对面向切面编程的实现，主要解决日志、事务、权限、审计、监控、幂等等横切关注点重复散落的问题。它的本质是在 Spring Bean 外面包一层代理对象，调用方调用代理，代理再根据切点决定是否执行通知，最后委托目标方法执行。",
      "核心概念可以串成链路：Pointcut 定义哪些方法要增强，Advice 定义增强逻辑，Advisor 把切点和通知组合起来，ProxyFactory 或自动代理创建器生成代理对象。运行时调用进入代理后，around、before、afterReturning、afterThrowing 等通知会按顺序执行。事务注解本质上也可以理解成事务拦截器围绕业务方法打开、提交或回滚事务。",
      "代理方式通常分 JDK 动态代理和 CGLIB。JDK 动态代理基于接口，CGLIB 基于子类。现代 Spring Boot 默认策略会按条件选择，但面试重点不是背默认值，而是知道 final 类、final 方法、private 方法、自调用、对象没交给 Spring 管理都会让代理增强失效或无法生效。",
      "AOP 不适合替代所有业务逻辑。切面越多，调用路径越隐蔽，排查越困难；切面里做重逻辑还可能引入性能和事务边界问题。项目里适合把稳定、横切、与业务主流程解耦的逻辑放进 AOP，例如操作日志、权限注解、幂等注解和指标埋点，不适合把核心业务分支藏在切面里。",
      "回答时可以用“调用必须经过代理”作为主线。先说它解决横切关注点，再讲代理、切点、通知和目标方法，最后补失效场景和排查方式。排查时看 Bean 实际类型、是否代理对象、切点是否命中、调用是否自调用、日志里是否进入通知。这样就从概念题变成了可定位的工程问题。"
    ],
    followups: [
      ["JDK 动态代理和 CGLIB 怎么选？", "有接口时可用 JDK 动态代理，CGLIB 通过子类增强；关键是知道 final/private 等限制和代理对象边界。"],
      ["事务为什么也会自调用失效？", "事务增强也是代理拦截器，同类内部 this 调用绕过代理，因此不会打开新的事务拦截链。"],
      ["切面顺序怎么控制？", "可以用 @Order 或 Ordered 控制多个切面的优先级，事务、安全、日志等切面要避免顺序冲突。"],
      ["AOP 适合放业务逻辑吗？", "不适合放核心业务分支。它更适合稳定的横切逻辑，否则调用路径会变隐蔽，排查成本升高。"]
    ]
  },
  {
    file: "content/questions/spring/spring-application-event-transaction.md",
    slug: "spring-application-event-transaction",
    visual: {
      type: "sequence",
      title: "事务事件：发布时机和监听阶段",
      summary: "普通事件会立即同步执行，事务事件可以绑定提交前、提交后、回滚后和完成后阶段。",
      nodes: [
        ["业务事务开始", "Service 方法进入 @Transactional 边界"],
        ["发布领域事件", "ApplicationEventPublisher 发布事件对象"],
        ["普通监听立即执行", "@EventListener 默认同步调用"],
        ["注册事务同步", "@TransactionalEventListener 绑定事务阶段"],
        ["事务提交或回滚", "提交成功、回滚失败或完成阶段确定"],
        ["阶段监听执行", "AFTER_COMMIT 发 MQ、清缓存或通知下游"]
      ],
      prompt: "画一张时序图：业务事务开始 -> 发布领域事件 -> 普通监听立即执行 -> 注册事务同步 -> 事务提交或回滚 -> 阶段监听执行。突出普通监听和事务阶段监听的区别。",
      takeaway: "事务事件问的是时机：别在提交前做不可逆副作用。"
    },
    detail: [
      "事务内发布 Spring 事件最容易踩的坑，是把“代码已经执行”误认为“数据库已经提交”。普通 `@EventListener` 默认在 publishEvent 时同步执行，如果它去发 MQ、发短信、清缓存或调用外部系统，可能发生在主事务提交之前。一旦后面事务回滚，外部副作用已经发生，系统就会出现订单没提交但消息已发送、缓存已删除或通知已发出的不一致。",
      "`@TransactionalEventListener` 用来把监听器绑定到事务阶段。常见 phase 包括 BEFORE_COMMIT、AFTER_COMMIT、AFTER_ROLLBACK、AFTER_COMPLETION。AFTER_COMMIT 最常用于事务成功后发送 MQ、清理缓存、触发异步任务；AFTER_ROLLBACK 适合补偿或记录失败；AFTER_COMPLETION 不关心成功失败，只做最终清理。它依赖当前线程存在事务同步上下文，没有事务时是否执行还要看 fallbackExecution。",
      "异步事件要单独说明边界。给监听器加 `@Async` 后，监听逻辑会进入线程池，事务上下文、MDC、安全上下文不会自动传播，异常也不会像同步调用一样直接抛回发布者。异步监听适合降低主链路耗时，但必须配置线程池、异常处理、重试策略和监控指标，否则失败会悄悄丢在日志里。",
      "事务事件不是可靠消息系统。它能解决“提交后再做副作用”的时机问题，但不能天然保证下游一定收到。如果是订单支付、库存扣减、资金流水这类强可靠场景，更稳的是 Outbox、本地消息表或事务消息：先把待发送消息和业务数据放进同一个数据库事务，再由后台可靠投递 MQ，支持重试、幂等和对账。",
      "面试回答可以按“普通监听立即执行、事务监听绑定阶段、异步监听有线程池边界、强可靠用 Outbox”展开。图解时画出事务开始、发布事件、提交成功、AFTER_COMMIT 执行的时间线，再标注回滚时 AFTER_COMMIT 不执行。这样能把事件解耦、一致性和失败补偿一起讲清楚。"
    ],
    followups: [
      ["@EventListener 默认是同步还是异步？", "默认同步，在发布事件的线程里执行。需要异步时要开启异步并给监听器或执行器做配置。"],
      ["AFTER_COMMIT 适合做什么？", "适合提交成功后发送 MQ、清缓存、发通知等副作用，但仍要考虑监听器失败后的重试和补偿。"],
      ["没有事务时 TransactionalEventListener 会执行吗？", "默认不执行，除非设置 fallbackExecution=true，但这样就失去事务阶段语义，要谨慎使用。"],
      ["事务事件能替代 MQ 吗？", "不能。它解决本进程内事件时机和解耦，不解决跨服务可靠投递、堆积、重放和消费确认。"]
    ]
  },
  {
    file: "content/questions/spring/spring-async.md",
    slug: "spring-async",
    visual: {
      type: "flow",
      title: "@Async：代理、线程池与上下文边界",
      summary: "@Async 依赖代理调用和 AsyncTaskExecutor，异步线程不会自动继承事务、安全和 MDC 上下文。",
      nodes: [
        ["开启异步支持", "@EnableAsync 注册异步后处理器"],
        ["调用代理对象", "外部 Bean 调用才会进入代理增强"],
        ["提交线程池", "AsyncTaskExecutor 接收任务并排队执行"],
        ["异步方法执行", "在新线程处理业务逻辑"],
        ["返回 Future", "Future、CompletableFuture 承载异步结果"],
        ["上下文和异常", "事务、MDC、安全上下文和 void 异常要单独处理"]
      ],
      prompt: "画一张流程图：开启异步支持 -> 调用代理对象 -> 提交线程池 -> 异步方法执行 -> 返回 Future -> 上下文和异常。突出不生效原因和生产线程池治理。",
      takeaway: "@Async 不是开新线程这么简单，核心是代理和线程池边界。"
    },
    detail: [
      "`@Async` 让方法在异步线程中执行，但它不是 Java 语法魔法，而是 Spring AOP 代理增强。要生效，项目需要启用 `@EnableAsync`，异步方法所在对象要由 Spring 管理，调用方要通过代理对象调用。最常见的失效场景是同类内部自调用：this.asyncMethod() 只是普通 Java 调用，不会经过代理，也就不会提交到异步线程池。",
      "方法可代理性也要注意。异步方法通常应为 public，类和方法不能因为 final、private 等原因无法增强，对象不能自己 new 出来。实际排查时可以看日志中的线程名，确认方法是否真的运行在异步线程；也可以用单元测试或断点观察调用对象是不是代理对象。只看到注解不代表已经异步执行。",
      "生产环境必须配置线程池。默认执行器不一定符合业务需求，队列过大可能积压任务，线程数过大可能拖垮机器，拒绝策略不明确可能丢任务或阻塞调用方。更稳的做法是为不同业务配置不同 ThreadPoolTaskExecutor，明确 corePoolSize、maxPoolSize、queueCapacity、threadNamePrefix、RejectedExecutionHandler，并把活跃线程数、队列长度、拒绝次数接入监控。",
      "上下文传播是高频追问。异步方法运行在另一个线程，调用方事务上下文不会自动传过去，SecurityContext、MDC、TraceId、TenantContext 等 ThreadLocal 也不会天然继承。需要用 TaskDecorator、上下文复制组件或显式传参处理。异步方法里的数据库操作应重新定义事务边界，不要假设它仍在调用方事务里。",
      "异常处理也不同。返回 Future 或 CompletableFuture 时，异常会体现在 future 结果里；void 异步方法异常不会直接抛给调用方，需要配置 AsyncUncaughtExceptionHandler 或在方法内记录和告警。面试回答可以用“代理生效条件、线程池治理、上下文传播、异常处理”四段组织，最后强调异步是削峰和解耦手段，不是无成本提速。"
    ],
    followups: [
      ["怎么确认 @Async 真的生效？", "看执行线程名、代理对象、方法耗时返回时机，也可以写测试确认调用线程和执行线程不同。"],
      ["异步方法能共用调用方事务吗？", "不能天然共用。它在新线程执行，需要重新设计事务边界或显式传递必要数据。"],
      ["void 异步方法异常怎么办？", "配置 AsyncUncaughtExceptionHandler 或在方法内部捕获记录，并配合告警和补偿任务。"],
      ["线程池队列怎么配置？", "按任务耗时、吞吐和可接受延迟配置。队列不能无限大，拒绝策略和监控必须明确。"]
    ]
  },
  {
    file: "content/questions/spring/spring-bean-lifecycle.md",
    slug: "spring-bean-lifecycle",
    visual: {
      type: "flow",
      title: "Spring Bean 生命周期：创建到销毁",
      summary: "Bean 生命周期包括实例化、属性填充、Aware、后处理器、初始化、代理生成和销毁回调。",
      nodes: [
        ["实例化 Bean", "构造器或工厂方法创建原始对象"],
        ["属性填充", "注入依赖并处理循环依赖相关引用"],
        ["Aware 回调", "注入 BeanName、BeanFactory、ApplicationContext"],
        ["初始化前处理", "BeanPostProcessor beforeInitialization"],
        ["初始化方法", "@PostConstruct、InitializingBean、initMethod"],
        ["初始化后和销毁", "afterInitialization 可能生成代理，关闭时执行 destroy"]
      ],
      prompt: "画一张流程图：实例化 Bean -> 属性填充 -> Aware 回调 -> 初始化前处理 -> 初始化方法 -> 初始化后和销毁。标注 BeanPostProcessor 和 AOP 代理生成位置。",
      takeaway: "Bean 生命周期的关键是后处理器把普通对象变成框架增强对象。"
    },
    detail: [
      "Spring Bean 生命周期可以从容器创建单例 Bean 的过程理解。第一步是根据 BeanDefinition 实例化对象，可能通过构造器、静态工厂方法或实例工厂方法创建原始对象。第二步是属性填充，也就是依赖注入，这一步会处理字段、setter、构造器依赖以及部分循环依赖场景。",
      "接着是各种 Aware 回调。比如 BeanNameAware 能让 Bean 知道自己的名字，BeanFactoryAware 能拿到 BeanFactory，ApplicationContextAware 能拿到应用上下文。Aware 不是业务代码必须使用的常规手段，它更像框架扩展口，让 Bean 感知容器能力。普通业务对象如果大量依赖 Aware，通常说明和框架耦合过重。",
      "初始化阶段要讲清 BeanPostProcessor 的位置。初始化前会执行 postProcessBeforeInitialization，然后执行 `@PostConstruct`、InitializingBean.afterPropertiesSet、initMethod 等初始化方法，之后执行 postProcessAfterInitialization。很多框架能力，包括 AOP 代理、事务代理、异步代理，都和后处理器有关。最终暴露给容器的 Bean 可能已经不是原始对象，而是代理对象。",
      "生命周期后半段还包括单例预实例化完成后的 SmartInitializingSingleton、应用启动阶段的 ApplicationRunner/CommandLineRunner，以及容器关闭时的销毁回调。销毁可以通过 `@PreDestroy`、DisposableBean、destroyMethod 等方式执行。prototype Bean 的销毁通常不由容器完整托管，这是容易被追问的边界。",
      "回答时可以画一条从 BeanDefinition 到最终代理对象的链路：实例化、填充属性、Aware、初始化前、初始化方法、初始化后、使用、销毁。排查问题时看创建日志、BeanPostProcessor 顺序、循环依赖异常、初始化异常和代理类型。这样能把生命周期和 AOP、事务、自动配置联系起来，而不是孤立背步骤。"
    ],
    followups: [
      ["BeanPostProcessor 在哪里执行？", "初始化前后各执行一次，afterInitialization 阶段经常用于返回代理对象。"],
      ["@PostConstruct 和 InitializingBean 谁先？", "通常 @PostConstruct 由后处理器在初始化方法前处理，然后执行 InitializingBean 和自定义 initMethod。"],
      ["prototype Bean 会自动销毁吗？", "容器负责创建和注入，但通常不完整管理销毁回调，需要业务方自己处理资源释放。"],
      ["AOP 代理在生命周期哪个阶段形成？", "通常在初始化后处理器阶段返回代理对象，最终注入给其他 Bean 的可能是代理。"]
    ]
  },
  {
    file: "content/questions/spring/spring-boot-autoconfiguration.md",
    slug: "spring-boot-autoconfiguration",
    visual: {
      type: "flow",
      title: "Spring Boot 自动配置：导入、条件和覆盖",
      summary: "Boot 3 通过 AutoConfiguration.imports 导入自动配置类，再由条件注解决定默认 Bean 是否注册。",
      nodes: [
        ["引入 starter", "依赖把功能库和 autoconfigure 带进项目"],
        ["导入自动配置", "Boot 3 读取 AutoConfiguration.imports"],
        ["解析配置类", "@AutoConfiguration 声明默认装配逻辑"],
        ["条件注解判断", "OnClass、OnProperty、OnMissingBean 控制生效"],
        ["注册默认 Bean", "只在条件满足且用户未覆盖时创建"],
        ["诊断和覆盖", "--debug、conditions、用户自定义 Bean 覆盖默认值"]
      ],
      prompt: "画一张流程图：引入 starter -> 导入自动配置 -> 解析配置类 -> 条件注解判断 -> 注册默认 Bean -> 诊断和覆盖。突出 Boot 3 的 AutoConfiguration.imports 和 OnMissingBean。",
      takeaway: "自动配置不是自动魔法，而是条件化注册默认 Bean。"
    },
    detail: [
      "Spring Boot 自动配置的目标是让常见组件在引入依赖后自动拥有合理默认配置，同时保留业务覆盖能力。它不是扫描到什么就无条件创建什么，而是通过一批自动配置类、条件注解和属性绑定，在合适条件下注册默认 Bean。面试回答要把“导入自动配置类”和“条件决定是否生效”讲清楚。",
      "Spring Boot 3 语境下，自动配置类主要通过 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` 声明导入，旧版本常见的 spring.factories 仍是历史知识点，但不要一刀切说所有版本都只靠 spring.factories。自动配置类常用 `@AutoConfiguration`，内部定义 `@Bean` 方法和配置属性绑定。",
      "条件注解是自动配置的灵魂。`@ConditionalOnClass` 表示类路径存在某个类时才启用，`@ConditionalOnMissingBean` 表示用户没有自定义 Bean 时才提供默认 Bean，`@ConditionalOnProperty` 表示配置开关满足时才创建。这样 starter 才能做到“引入即可用、用户可覆盖、配置可关闭”。",
      "排查自动配置没生效，要看 ConditionEvaluationReport。启动参数 `--debug`、Actuator 的 conditions 端点、启动日志和 IDE 依赖树都很有用。常见问题包括依赖没引入、类路径条件不满足、属性开关没开、用户已经定义了同类型 Bean、多个自动配置顺序冲突、配置属性绑定失败。",
      "回答可以用数据源自动配置举例：引入 JDBC starter 后，类路径有 DataSource，配置里有连接属性，容器里没有用户自定义 DataSource，于是 Boot 创建默认 DataSource；如果用户自己声明 DataSource，则 OnMissingBean 让默认配置退让。这个例子能把 starter、imports、条件、默认 Bean 和覆盖关系全部串起来。"
    ],
    followups: [
      ["Boot 3 自动配置入口是什么？", "主要是 AutoConfiguration.imports，位于 META-INF/spring 目录下，列出自动配置类全限定名。"],
      ["@ConditionalOnMissingBean 有什么意义？", "它让默认 Bean 在用户自定义 Bean 存在时退让，保证自动配置可覆盖。"],
      ["怎么排查自动配置没生效？", "看 --debug、ConditionEvaluationReport、Actuator conditions、依赖树和配置属性绑定错误。"],
      ["starter 和 autoconfigure 有什么区别？", "starter 通常负责依赖聚合，autoconfigure 放自动配置逻辑，拆开更利于复用和版本管理。"]
    ]
  },
  {
    file: "content/questions/spring/spring-boot-starter-custom.md",
    slug: "spring-boot-starter-custom",
    visual: {
      type: "structure",
      title: "自定义 Starter：依赖聚合到自动配置",
      summary: "自定义 Starter 应拆分 starter 与 autoconfigure，提供属性绑定、条件装配、元数据和测试覆盖。",
      nodes: [
        ["starter 模块", "只聚合业务方需要引入的依赖"],
        ["autoconfigure 模块", "放 @AutoConfiguration 和默认 Bean 逻辑"],
        ["配置属性类", "@ConfigurationProperties 定义前缀和默认值"],
        ["条件化装配", "OnClass、OnProperty、OnMissingBean 控制创建"],
        ["Boot 3 注册文件", "AutoConfiguration.imports 暴露自动配置类"],
        ["元数据和测试", "configuration metadata、ApplicationContextRunner 验证"]
      ],
      prompt: "画一张结构图：starter 模块 -> autoconfigure 模块 -> 配置属性类 -> 条件化装配 -> Boot 3 注册文件 -> 元数据和测试。突出 starter 设计的包结构和覆盖机制。",
      takeaway: "好 Starter 的标准是开箱即用、按需开启、业务可覆盖。"
    },
    detail: [
      "自定义 Spring Boot Starter 的目标，是把一组基础能力封装成业务项目引入后即可使用的组件，例如统一日志、RPC 客户端、鉴权 SDK、限流组件、审计组件。好的 starter 不只是把依赖打包进去，还要提供自动配置、属性绑定、条件装配、默认值、元数据提示和测试样例，让业务使用者少写样板代码但仍能覆盖默认行为。",
      "结构上建议拆分 starter 和 autoconfigure。starter 模块通常只负责依赖聚合，让业务方引入一个依赖即可；autoconfigure 模块放 `@AutoConfiguration`、`@Bean`、`@ConfigurationProperties` 和条件注解。这样业务方也可以单独复用 autoconfigure，依赖边界更清晰，也避免 starter 模块塞入大量业务逻辑。",
      "Spring Boot 3 要用 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` 注册自动配置类。自动配置类内部要通过 `@ConditionalOnClass` 判断核心类是否存在，通过 `@ConditionalOnProperty` 支持开关，通过 `@ConditionalOnMissingBean` 尊重业务自定义 Bean。配置项用 `@ConfigurationProperties` 统一前缀、默认值、校验和文档。",
      "工程质量体现在可维护性。要提供 `spring-configuration-metadata.json` 或注解处理器生成配置元数据，方便 IDE 提示；要用 ApplicationContextRunner 测试不同 classpath、不同配置、用户自定义 Bean 存在时的装配结果；要避免传递过重依赖、版本冲突和无条件启动后台线程。starter 还应明确兼容的 Boot 版本范围。",
      "面试回答可以用“依赖聚合、自动配置、属性绑定、条件装配、可覆盖、可测试”六个点组织。错误设计是无条件创建 Bean、覆盖业务配置、配置项散乱、没有开关、没有测试、引入大而全依赖。好设计则让业务接入简单，出问题时又能通过 conditions、配置元数据和日志快速定位。"
    ],
    followups: [
      ["starter 模块里应该写业务逻辑吗？", "通常不写大量逻辑。starter 负责依赖聚合，自动配置逻辑放 autoconfigure 模块更清晰。"],
      ["Boot 3 怎么让自动配置生效？", "在 AutoConfiguration.imports 中写入自动配置类全限定名，并在类上使用 @AutoConfiguration。"],
      ["为什么要用 OnMissingBean？", "避免默认 Bean 压掉业务自定义实现，让 starter 保持可覆盖和低侵入。"],
      ["怎么测试自定义 starter？", "用 ApplicationContextRunner 组合不同配置和用户 Bean，验证条件装配、默认值和覆盖行为。"]
    ]
  },
  {
    file: "content/questions/spring/spring-boot-startup-flow.md",
    slug: "spring-boot-startup-flow",
    visual: {
      type: "flow",
      title: "Spring Boot 启动流程：从 run 到 Ready",
      summary: "Boot 启动经历环境准备、上下文创建、refresh、Bean 生命周期、Web 容器启动和 Runner 执行。",
      nodes: [
        ["调用 run 方法", "创建 SpringApplication 并触发启动监听器"],
        ["准备 Environment", "加载配置、profile、命令行参数和外部属性"],
        ["创建上下文", "选择 Servlet、Reactive 或普通 ApplicationContext"],
        ["执行 refresh", "加载 BeanDefinition，执行工厂后处理器和 Bean 创建"],
        ["启动 Web 容器", "内嵌 Tomcat、Jetty 或 Netty 开始接收请求"],
        ["Runner 和 Ready", "执行 ApplicationRunner/CommandLineRunner 并发布就绪事件"]
      ],
      prompt: "画一张流程图：调用 run 方法 -> 准备 Environment -> 创建上下文 -> 执行 refresh -> 启动 Web 容器 -> Runner 和 Ready。突出启动阶段和常见扩展点。",
      takeaway: "Boot 启动不是 main 一行代码，而是环境、上下文、Bean、容器和就绪事件的组合。"
    },
    detail: [
      "Spring Boot 启动流程可以按 run 方法之后的几个阶段理解。第一阶段是创建并运行 SpringApplication，触发启动监听器，解析主类、应用类型和启动参数。第二阶段是准备 Environment，加载 application.yml、profile、环境变量、命令行参数、ConfigData 和外部配置，确定最终属性来源。",
      "接着会创建 ApplicationContext。Web 应用通常创建 ServletWebServerApplicationContext，响应式应用会创建 ReactiveWebServerApplicationContext，非 Web 应用则是普通上下文。上下文创建后会加载 BeanDefinition，包括组件扫描、配置类解析、自动配置导入和条件装配判断。这里和自动配置、条件注解、配置绑定密切相关。",
      "核心阶段是 refresh。refresh 内部会准备 BeanFactory，执行 BeanFactoryPostProcessor，注册 BeanPostProcessor，实例化非懒加载单例 Bean，完成依赖注入、Aware、初始化回调、AOP 代理生成等生命周期步骤。很多启动失败都发生在这个阶段，例如配置绑定失败、循环依赖、Bean 创建异常、端口占用、自动配置条件冲突。",
      "Web 应用还会启动内嵌容器，如 Tomcat、Jetty、Undertow 或响应式 Netty。容器启动成功后，应用才真正具备接收请求的能力。随后执行 ApplicationRunner、CommandLineRunner，发布 ApplicationStartedEvent、ApplicationReadyEvent 等事件。生产上 readiness 通常应在应用真正就绪后才放开流量。",
      "面试回答不要只说 `SpringApplication.run`。可以按“准备环境、创建上下文、加载 Bean、启动容器、执行 Runner、发布就绪事件”来讲，并补排查入口：启动日志、--debug、ConditionEvaluationReport、Actuator health、端口监听、Bean 创建栈。这样就能把启动流程和自动配置、Bean 生命周期、Web 容器联系起来。"
    ],
    followups: [
      ["BeanFactoryPostProcessor 什么时候执行？", "在 Bean 实例化之前执行，用来修改 BeanDefinition 或容器级元数据。"],
      ["BeanPostProcessor 什么时候执行？", "在 Bean 初始化前后执行，AOP 代理等增强通常和它有关。"],
      ["ApplicationRunner 什么时候执行？", "上下文刷新完成、应用启动后执行，常用于启动后初始化，但要避免阻塞就绪。"],
      ["启动慢怎么排查？", "看启动日志、应用启动耗时分析、Bean 创建耗时、自动配置报告、外部依赖连接和 Runner 逻辑。"]
    ]
  }
];

const batch39 = [
  {
    file: "content/questions/spring/spring-cache-annotation.md",
    slug: "spring-cache-annotation",
    visual: {
      type: "flow",
      title: "Spring Cache：读写、失效与一致性",
      summary: "Spring Cache 用注解抽象缓存操作，但 key 设计、事务后失效、TTL 和缓存穿透仍要由方案负责。",
      nodes: [
        ["@Cacheable 读缓存", "命中直接返回，未命中才执行方法并写入缓存"],
        ["Key 生成规则", "包含租户、参数、版本等影响结果的字段"],
        ["condition 和 unless", "调用前后判断是否缓存，避免缓存空洞或异常值"],
        ["@CachePut 更新", "方法总会执行，适合同步刷新缓存"],
        ["@CacheEvict 删除", "更新或删除数据后清理缓存"],
        ["事务和 TTL", "提交后失效、过期策略由 Redis/Caffeine 等实现控制"]
      ],
      prompt: "画一张流程图：@Cacheable 读缓存 -> Key 生成规则 -> condition 和 unless -> @CachePut 更新 -> @CacheEvict 删除 -> 事务和 TTL。突出缓存注解和一致性边界。",
      takeaway: "Cache 注解省的是样板代码，不省 key、一致性和失效设计。"
    },
    detail: [
      "Spring Cache 把缓存读写抽象成注解，常见有 `@Cacheable`、`@CachePut`、`@CacheEvict`。`@Cacheable` 的语义是先根据 cacheName 和 key 查缓存，命中时直接返回，不执行目标方法；未命中时执行方法，并把返回值写入缓存。`@CachePut` 通常用于更新后同步刷新缓存，它总会执行方法；`@CacheEvict` 用于删除缓存，常放在更新或删除数据后。",
      "真正落地的重点是 key 设计。key 必须包含所有影响结果的因素，例如用户、租户、地区、语言、分页参数、查询条件、数据版本。key 太粗会串数据，key 太细会降低命中率。Spring 默认 key 生成器适合简单场景，复杂业务最好显式指定 SpEL key 或自定义 KeyGenerator，并统一命名规范。",
      "`condition` 和 `unless` 也常被追问。condition 在方法执行前判断是否走缓存逻辑，unless 在方法执行后判断是否不缓存结果。比如空结果、异常兜底值、临时状态数据不一定应该缓存。`sync=true` 可以在部分 Cache 实现中缓解并发击穿，但不要把它当成分布式互斥锁，跨节点场景仍要结合 Redis 锁、逻辑过期或单飞机制。",
      "一致性边界要主动说明。缓存注解本质上通过代理增强方法调用，自调用会失效；数据库事务未提交前清缓存可能产生短暂不一致，因此关键更新更适合在事务提交后清理缓存，或者用事件/消息做补偿。TTL 通常不在注解本身统一表达，而由具体 CacheManager、RedisCacheConfiguration、Caffeine 配置决定。",
      "面试回答可以按“读缓存、写缓存、删缓存、key、条件、事务、实现差异”展开。Redis 更适合分布式共享缓存，Caffeine 更适合本地高性能缓存；两者的 TTL、容量、序列化、穿透保护和失效范围不同。排查时看是否走代理、key 是否一致、缓存命中率、Redis 命令、事务提交顺序和缓存值版本。"
    ],
    followups: [
      ["@Cacheable 方法一定会执行吗？", "不一定。缓存命中时目标方法不会执行，未命中时才执行并回填。"],
      ["TTL 在注解里配置吗？", "通常由具体缓存实现和 CacheManager 配置控制，比如 RedisCacheConfiguration 或 Caffeine 策略。"],
      ["为什么自调用会导致缓存不生效？", "缓存注解依赖 Spring 代理，同类内部 this 调用绕过代理，所以不会进入缓存拦截器。"],
      ["更新数据库后先删缓存还是先改库？", "常见做法是先改库，事务提交后删缓存，并配合重试、消息补偿或延迟双删处理异常窗口。"]
    ]
  },
  {
    file: "content/questions/spring/spring-configuration-properties.md",
    slug: "spring-configuration-properties",
    visual: {
      type: "structure",
      title: "@ConfigurationProperties：配置绑定与校验",
      summary: "ConfigurationProperties 适合一组结构化配置，支持宽松绑定、嵌套对象、集合、校验和元数据提示。",
      nodes: [
        ["定义 prefix", "按业务域聚合配置项"],
        ["宽松绑定", "kebab、camel、下划线和环境变量转换"],
        ["嵌套和集合", "绑定对象、列表、Map 等结构"],
        ["类型转换", "Duration、DataSize、枚举等类型安全绑定"],
        ["Validated 校验", "启动期发现缺失或非法配置"],
        ["元数据提示", "生成配置提示并提升 starter 可用性"]
      ],
      prompt: "画一张结构图：定义 prefix -> 宽松绑定 -> 嵌套和集合 -> 类型转换 -> Validated 校验 -> 元数据提示。突出和 @Value 的维护性差异。",
      takeaway: "@ConfigurationProperties 适合成组配置，@Value 适合少量离散值。"
    },
    detail: [
      "`@ConfigurationProperties` 适合把一组同前缀的配置绑定成类型安全的 Java 对象，例如第三方客户端、线程池、限流、缓存、支付渠道等配置。它比零散 `@Value` 更适合中大型项目，因为配置项可以集中管理、支持嵌套结构、类型转换、校验和 IDE 提示，维护成本更低。",
      "绑定规则支持 relaxed binding。比如 `my.service-timeout`、`my.serviceTimeout`、环境变量 `MY_SERVICE_TIMEOUT` 都可能绑定到同一个属性。复杂配置可以绑定嵌套对象、List、Map、Duration、DataSize、枚举等。这样业务代码拿到的是结构化对象，而不是一堆字符串再手动解析。",
      "校验是重要加分点。配合 `@Validated`、`@NotBlank`、`@Min`、`@DurationMin` 等约束，可以在启动阶段发现必填配置缺失、范围非法或格式错误，而不是等请求进来才出问题。对 starter 来说，还应生成 configuration metadata，让使用方在 IDE 中看到配置说明、默认值和提示。",
      "构造器绑定和 Java record 也常被问到。较新的 Boot 版本支持更自然的不可变配置对象，适合表达配置一旦启动就不应变化。动态刷新则要谨慎，是否能刷新取决于配置中心、绑定方式、Bean 生命周期和作用域，不是所有 `@ConfigurationProperties` 改了都能自动让业务逻辑无感生效。",
      "面试回答可以对比 `@Value`：少量简单值可以用 `@Value`，但成组配置、第三方组件配置、starter 对外配置更适合 `@ConfigurationProperties`。排查配置问题时看属性来源、绑定错误日志、Actuator env/configprops、profile 覆盖和环境变量命名。这样能把配置绑定、校验和生产排查连起来。"
    ],
    followups: [
      ["和 @Value 最大区别是什么？", "@Value 适合少量离散值，ConfigurationProperties 适合成组、类型安全、可校验的结构化配置。"],
      ["宽松绑定是什么意思？", "不同命名形式可以绑定到同一属性，如 kebab-case、camelCase、下划线环境变量等。"],
      ["配置校验失败会怎样？", "通常启动失败并输出绑定或校验错误，这比运行时才发现配置错误更安全。"],
      ["动态刷新一定生效吗？", "不一定。取决于配置中心、刷新机制、Bean 作用域和代码读取配置的方式。"]
    ]
  },
  {
    file: "content/questions/spring/spring-event.md",
    slug: "spring-event",
    visual: {
      type: "sequence",
      title: "Spring 事件：发布、监听与边界",
      summary: "Spring 事件适合进程内解耦，默认同步执行，可结合异步或事务事件处理不同阶段。",
      nodes: [
        ["发布业务事件", "ApplicationEventPublisher 发布对象或事件"],
        ["查找监听器", "ApplicationEventMulticaster 匹配 @EventListener"],
        ["默认同步执行", "监听器在发布线程内被调用"],
        ["可切换异步", "@Async 或自定义 multicaster executor"],
        ["异常传播边界", "同步异常可能影响发布方，异步异常需单独处理"],
        ["可靠性边界", "进程内解耦不能替代 MQ 的持久化和重放"]
      ],
      prompt: "画一张时序图：发布业务事件 -> 查找监听器 -> 默认同步执行 -> 可切换异步 -> 异常传播边界 -> 可靠性边界。突出 Spring 事件和 MQ 的区别。",
      takeaway: "Spring 事件是进程内解耦，不是可靠消息队列。"
    },
    detail: [
      "Spring 事件机制提供的是应用进程内的发布订阅模型。发布方通过 ApplicationEventPublisher 发布事件，监听方用 `@EventListener` 或实现 ApplicationListener 接收事件。它适合把主流程和一些旁路动作解耦，例如记录审计日志、刷新本地缓存、发布领域内通知、启动后初始化等。",
      "默认情况下，Spring 事件通常是同步执行的。也就是说发布事件的方法调用还没返回，监听器就已经在同一个线程里执行了。同步模式好处是简单、事务和上下文清楚；坏处是监听器耗时或异常可能拖慢甚至影响主流程。要异步执行，可以给监听器加 `@Async`，或者配置 ApplicationEventMulticaster 的 executor。",
      "异常边界必须讲清。同步监听器抛异常，可能直接影响发布方；异步监听器抛异常，通常不会直接回到发布方，需要单独日志、告警和补偿。事务边界也要区分：普通事件不等事务提交，事务相关副作用更适合 `@TransactionalEventListener`，按 AFTER_COMMIT、AFTER_ROLLBACK 等阶段执行。",
      "Spring 事件不能替代 MQ。它没有跨服务投递、持久化、消费确认、堆积、重放和死信机制。订单支付、库存扣减、跨服务通知等强可靠场景，应考虑 MQ、Outbox、本地消息表或事务消息。Spring 事件更适合单应用内低成本解耦，尤其是同一个 JVM 内的模块协作。",
      "面试回答可以按“发布方、事件对象、监听器、同步默认、异步可选、事务事件、可靠性边界”组织。排查时看监听器是否被注册、泛型类型是否匹配、是否开启异步、线程池是否健康、异常是否被吞、事务提交时机是否正确。这样答案不会把事件机制讲成简单观察者模式。"
    ],
    followups: [
      ["Spring 事件默认同步还是异步？", "通常默认同步，在发布线程内执行；异步需要额外配置执行器或使用 @Async。"],
      ["监听器异常会影响主流程吗？", "同步监听器异常可能影响发布方，异步监听器异常要单独处理和告警。"],
      ["什么时候用事务事件？", "副作用必须等数据库提交结果确定后再执行时，用 @TransactionalEventListener 绑定事务阶段。"],
      ["Spring 事件和 MQ 怎么选？", "进程内解耦用 Spring 事件，跨服务可靠投递、重放、堆积和确认用 MQ。"]
    ]
  },
  {
    file: "content/questions/spring/spring-import-selector.md",
    slug: "spring-import-selector",
    visual: {
      type: "structure",
      title: "@Import：三类导入路径",
      summary: "@Import 可以导入普通配置类、ImportSelector 返回的类名，也可以通过 ImportBeanDefinitionRegistrar 直接注册 BeanDefinition。",
      nodes: [
        ["导入配置类", "@Import 普通 @Configuration 或组件类"],
        ["ImportSelector", "selectImports 返回要导入的类名"],
        ["DeferredImportSelector", "延迟选择，自动配置常见扩展点"],
        ["Registrar", "ImportBeanDefinitionRegistrar 编程式注册定义"],
        ["Enable 模式", "@EnableXxx 封装 Import 细节"],
        ["条件配合", "结合 @Conditional 控制导入和注册"]
      ],
      prompt: "画一张结构图：导入配置类 -> ImportSelector -> DeferredImportSelector -> Registrar -> Enable 模式 -> 条件配合。突出三种 Import 用法和自动配置关系。",
      takeaway: "@Import 是把外部配置和 BeanDefinition 带进容器的入口。"
    },
    detail: [
      "`@Import` 的作用是把额外的配置类或 Bean 注册逻辑引入当前 Spring 容器。最简单的用法是直接导入一个配置类或组件类，相当于告诉容器解析这个类里的 BeanDefinition。它常用于显式组装模块，而不是完全依赖组件扫描。",
      "第二类用法是 ImportSelector。它的 selectImports 方法返回一组类名，Spring 再去导入这些类。很多 `@EnableXxx` 注解会把 `@Import` 封装起来，让使用者只看到一个开关注解，内部通过 ImportSelector 选择要启用的配置类。DeferredImportSelector 是延迟导入选择器，自动配置体系和它有很深的关系。",
      "第三类是 ImportBeanDefinitionRegistrar。它不是返回类名，而是拿到 BeanDefinitionRegistry 后，编程式注册 BeanDefinition。这个能力更底层，适合根据注解属性、接口扫描结果或外部元数据动态注册 Bean。例如 Mapper 扫描、RPC 客户端代理、Feign 类似客户端注册都可以用这种思路理解。",
      "`@Import` 经常和条件装配配合。导入进来的配置类可以再用 `@ConditionalOnClass`、`@ConditionalOnProperty`、`@ConditionalOnMissingBean` 控制是否创建 Bean。这样模块开关、自动配置和用户覆盖就能组合起来。不要把 `@Import` 理解成简单 include，它实际影响的是配置解析和 BeanDefinition 注册阶段。",
      "回答可以按三层递进：直接导入配置类最简单，ImportSelector 适合按条件返回配置类，Registrar 适合编程式注册 BeanDefinition。再补 Enable 模式和自动配置，就能把 `@Import`、starter、条件注解、BeanDefinitionRegistry 串成一条完整容器扩展链。"
    ],
    followups: [
      ["@Import 普通类和组件扫描有什么区别？", "组件扫描按包路径自动发现，@Import 是显式把指定类或选择器引入容器。"],
      ["ImportSelector 返回什么？", "返回要导入的配置类或组件类全限定名，Spring 再继续解析这些类。"],
      ["Registrar 适合什么场景？", "适合动态、批量、编程式注册 BeanDefinition，如接口代理、Mapper、客户端 SDK。"],
      ["@EnableXxx 和 @Import 什么关系？", "很多 Enable 注解内部就是 @Import，把复杂导入逻辑封装成一个开关注解。"]
    ]
  },
  {
    file: "content/questions/spring/spring-mvc-argument-resolver.md",
    slug: "spring-mvc-argument-resolver",
    visual: {
      type: "flow",
      title: "MVC 参数解析器：从请求到方法参数",
      summary: "HandlerMethodArgumentResolver 链负责判断参数是否支持，并把请求数据、上下文或请求体解析为 Controller 参数。",
      nodes: [
        ["匹配 HandlerMethod", "DispatcherServlet 找到 Controller 方法"],
        ["遍历参数列表", "逐个处理方法形参"],
        ["supportsParameter", "判断某个解析器是否支持该参数"],
        ["resolveArgument", "从请求、路径、Header、Body 或上下文取值"],
        ["绑定和转换", "WebDataBinder、ConversionService 做类型转换"],
        ["失败进入异常", "缺参、类型错误或 Body 解析失败返回 400 等"]
      ],
      prompt: "画一张流程图：匹配 HandlerMethod -> 遍历参数列表 -> supportsParameter -> resolveArgument -> 绑定和转换 -> 失败进入异常。突出自定义解析器注入当前用户的场景。",
      takeaway: "Controller 参数不是凭空来的，是解析器链一个个解析出来的。"
    },
    detail: [
      "Spring MVC 参数解析器的核心接口是 HandlerMethodArgumentResolver。DispatcherServlet 找到 Controller 方法后，HandlerAdapter 会为方法的每个参数寻找合适的解析器。解析器先用 supportsParameter 判断自己能不能处理这个参数，再用 resolveArgument 从请求中取数据并转换成目标对象。",
      "常见注解背后都有解析逻辑。`@RequestParam` 从 query/form 参数取值，`@PathVariable` 从路径变量取值，`@RequestHeader` 从请求头取值，`@CookieValue` 从 Cookie 取值，`@RequestBody` 会结合 HttpMessageConverter 读取请求体。无注解对象参数可能走数据绑定，把多个请求参数绑定成一个对象。",
      "自定义参数解析器常用于注入当前用户、租户、数据权限、灰度标记、客户端信息等上下文。例如 Controller 方法直接写 `CurrentUser user`，解析器从 token 或 SecurityContext 中取出用户信息。这样能减少重复代码，但 supportsParameter 必须限制准确，否则可能误伤其他参数，甚至带来安全漏洞。",
      "参数解析和消息转换要区分。参数解析器负责决定某个方法参数怎么来；请求体 JSON 到 Java 对象的转换通常由 HttpMessageConverter 完成；类型转换、格式化和校验还会涉及 ConversionService、WebDataBinder、Validator。缺少参数、类型转换失败、Body 解析失败常会变成 400，媒体类型不支持可能是 415。",
      "面试回答可以画 MVC 后半段链路：HandlerMapping 找 Controller，HandlerAdapter 准备调用，参数解析器逐个解析参数，绑定转换后执行方法，异常交给异常解析器。排查时看解析器注册顺序、supportsParameter 条件、是否调用 addArgumentResolvers、异常类型和请求 Content-Type。"
    ],
    followups: [
      ["自定义解析器怎么注册？", "通常实现 WebMvcConfigurer 的 addArgumentResolvers，把自定义 HandlerMethodArgumentResolver 加入列表。"],
      ["supportsParameter 为什么重要？", "它决定解析器是否接管参数，条件太宽会误伤其他参数，甚至造成权限或数据错误。"],
      ["@RequestBody 是参数解析器还是消息转换器？", "两者配合。参数解析器识别 @RequestBody，具体 JSON 和对象转换由 HttpMessageConverter 完成。"],
      ["参数解析失败通常是什么状态码？", "缺参、类型转换、绑定失败多为 400；媒体类型不支持常见 415，响应不可接受可能是 406。"]
    ]
  },
  {
    file: "content/questions/spring/spring-mvc-flow.md",
    slug: "spring-mvc-flow",
    visual: {
      type: "sequence",
      title: "Spring MVC 请求流程：入口到响应",
      summary: "一次 MVC 请求经过 DispatcherServlet、HandlerMapping、Interceptor、HandlerAdapter、参数解析、返回值处理和异常解析。",
      nodes: [
        ["请求进入", "Filter 后进入 DispatcherServlet"],
        ["查找 Handler", "HandlerMapping 返回 HandlerExecutionChain"],
        ["执行拦截器", "preHandle、postHandle、afterCompletion"],
        ["调用 Adapter", "HandlerAdapter 准备参数并调用 Controller"],
        ["处理返回值", "视图解析或 ResponseBody 写响应"],
        ["异常和完成", "HandlerExceptionResolver 处理异常并最终清理"]
      ],
      prompt: "画一张时序图：请求进入 -> 查找 Handler -> 执行拦截器 -> 调用 Adapter -> 处理返回值 -> 异常和完成。突出 REST 返回和视图解析分支。",
      takeaway: "MVC 的核心是 DispatcherServlet 调度，而不是 Controller 单独工作。"
    },
    detail: [
      "Spring MVC 一次请求的主线从 DispatcherServlet 开始。请求先经过 Filter 链，然后进入 DispatcherServlet。DispatcherServlet 通过 HandlerMapping 查找能处理当前请求的 Handler，返回 HandlerExecutionChain，其中包含 Controller 方法和匹配的 Interceptor。",
      "接着执行 Interceptor 的 preHandle。全部放行后，DispatcherServlet 选择合适的 HandlerAdapter 调用 Controller。对注解式 Controller 来说，HandlerAdapter 会准备方法参数：参数解析器处理 `@RequestParam`、`@PathVariable`、`@RequestBody` 等，消息转换器读取请求体，数据绑定和校验处理对象参数。",
      "Controller 执行后，返回值处理器决定响应怎么写。如果是 `@ResponseBody` 或 `@RestController`，通常通过 HttpMessageConverter 写 JSON；如果返回视图名，则交给 ViewResolver 做视图解析。正常路径下 postHandle 会在 Controller 返回后执行，afterCompletion 在请求完成后执行。",
      "异常路径也要讲。Controller、参数绑定、消息转换、业务逻辑都可能抛异常，Spring MVC 会交给 HandlerExceptionResolver 链处理，例如 `@ExceptionHandler`、`@ControllerAdvice`、ResponseStatusExceptionResolver 等。异常被处理后，仍要确保 afterCompletion 和 Filter finally 完成上下文清理。",
      "回答可以画成一条调度链：Filter -> DispatcherServlet -> HandlerMapping -> Interceptor -> HandlerAdapter -> 参数解析 -> Controller -> 返回值处理 -> 异常解析 -> 响应。这样能自然引出参数解析器、消息转换器、拦截器、异常处理和视图解析，面试官追问哪个点都能接得住。"
    ],
    followups: [
      ["HandlerMapping 和 HandlerAdapter 区别是什么？", "HandlerMapping 负责找谁处理请求，HandlerAdapter 负责以合适方式调用这个处理器。"],
      ["REST 返回和页面返回在哪里分叉？", "返回值处理阶段分叉：ResponseBody 走消息转换器写响应，视图名走 ViewResolver。"],
      ["全局异常处理在哪个阶段生效？", "异常抛出后由 HandlerExceptionResolver 链处理，@ControllerAdvice 属于其中常见方式。"],
      ["Interceptor 三个回调怎么对应流程？", "preHandle 在 Controller 前，postHandle 在正常返回后，afterCompletion 在请求完成后清理。"]
    ]
  },
  {
    file: "content/questions/spring/spring-mvc-message-converter.md",
    slug: "spring-mvc-message-converter",
    visual: {
      type: "flow",
      title: "HttpMessageConverter：读 Body 与写响应",
      summary: "消息转换器根据 Content-Type、Accept、目标类型和返回值类型在 HTTP Body 与 Java 对象之间转换。",
      nodes: [
        ["读取请求体", "@RequestBody 触发读取 Body"],
        ["匹配 Content-Type", "选择能读 application/json 等媒体类型的转换器"],
        ["反序列化对象", "Jackson 等组件把 JSON 转成 Java 对象"],
        ["执行 Controller", "业务方法拿到解析后的参数"],
        ["匹配 Accept", "根据客户端可接受类型和返回值选择转换器"],
        ["写出响应体", "@ResponseBody 或 RestController 输出 JSON 等内容"]
      ],
      prompt: "画一张流程图：读取请求体 -> 匹配 Content-Type -> 反序列化对象 -> 执行 Controller -> 匹配 Accept -> 写出响应体。标出 415、406 和 JSON 序列化异常。",
      takeaway: "Content-Type 决定怎么读，Accept 影响怎么写。"
    },
    detail: [
      "HttpMessageConverter 负责 HTTP 请求体、响应体和 Java 对象之间的转换。`@RequestBody` 参数需要读取请求 Body 时，会根据 Content-Type、目标参数类型和已注册转换器选择能读的 converter；`@ResponseBody` 或 `@RestController` 写响应时，会根据返回值类型、Accept 头和 converter 能力选择能写的 converter。",
      "最常见实现是 MappingJackson2HttpMessageConverter，它负责 JSON 和 Java 对象之间的序列化、反序列化。除此之外还有 StringHttpMessageConverter、ByteArrayHttpMessageConverter、ResourceHttpMessageConverter 等。不同 converter 支持的媒体类型和 Java 类型不同，顺序也会影响选择结果。",
      "状态码边界很适合追问。请求 Content-Type 不被支持，可能返回 415 Unsupported Media Type；客户端 Accept 要求的响应类型服务端无法写，可能返回 406 Not Acceptable；JSON 格式错误、字段类型不匹配、反序列化失败，通常是 400；序列化过程中遇到循环引用、日期格式、懒加载代理，也可能导致响应失败。",
      "消息转换器和参数解析器要区分。参数解析器决定某个 Controller 参数怎么获取，`@RequestBody` 对应的参数解析器会调用 HttpMessageConverter 读取 Body。返回值处理器也会调用 converter 写响应。自定义 converter 适合处理特殊媒体类型，如 protobuf、加密报文、自定义 CSV，但要慎重处理安全和兼容性。",
      "面试回答可以从“读请求”和“写响应”两条链路讲。读请求看 Content-Type 和目标类型，写响应看 Accept 和返回值类型。排查时看请求头、响应头、converter 注册顺序、Jackson 配置、ObjectMapper 模块、全局异常处理和日志。这样就能解释为什么有时同一个对象在一个接口能返回，另一个接口却报 406 或序列化异常。"
    ],
    followups: [
      ["415 和 406 分别代表什么？", "415 是请求媒体类型服务端不支持，406 是客户端要求的响应类型服务端无法提供。"],
      ["@RequestBody 和 converter 什么关系？", "@RequestBody 参数解析器会调用 HttpMessageConverter，把请求体转换成 Java 对象。"],
      ["怎么自定义 JSON 序列化规则？", "通常配置 ObjectMapper、Jackson 模块、序列化注解或消息转换器，而不是在 Controller 手写转换。"],
      ["消息转换器会影响 @RequestParam 吗？", "通常不会。@RequestParam 多走参数绑定和类型转换，Body JSON 才主要依赖消息转换器。"]
    ]
  },
  {
    file: "content/questions/spring/spring-profiles.md",
    slug: "spring-profiles",
    visual: {
      type: "structure",
      title: "Spring Profile：环境激活与配置覆盖",
      summary: "Profile 用来按环境启用 Bean 和配置文件，但要注意多 profile 合并、默认 profile 和配置优先级。",
      nodes: [
        ["定义环境差异", "dev、test、prod 或 region、tenant 等维度"],
        ["激活 profile", "spring.profiles.active、环境变量、启动参数"],
        ["Profile 配置文件", "application-dev.yml 覆盖基础配置"],
        ["条件化 Bean", "@Profile 控制 Bean 是否注册"],
        ["多 profile 合并", "顺序和覆盖决定最终属性值"],
        ["排查来源", "Actuator env、启动日志和配置报告"]
      ],
      prompt: "画一张结构图：定义环境差异 -> 激活 profile -> Profile 配置文件 -> 条件化 Bean -> 多 profile 合并 -> 排查来源。突出配置覆盖和 Bean 注册差异。",
      takeaway: "Profile 管环境差异，但最终值要看激活顺序和属性来源。"
    },
    detail: [
      "Spring Profile 用来表达不同环境或运行模式下的配置差异。常见的 dev、test、prod 可以切换数据库、缓存、日志级别、第三方地址；也可以按 region、tenant、mock、cloud 等维度组织。Profile 既能影响配置文件加载，也能通过 `@Profile` 控制某些 Bean 是否注册。",
      "激活方式有多种：`spring.profiles.active`、命令行参数、环境变量 `SPRING_PROFILES_ACTIVE`、测试注解等。Spring Boot 2.4 之后还常见 `spring.config.activate.on-profile`，用于声明某段配置在特定 profile 下生效。多个 profile 同时激活时，属性会合并和覆盖，顺序会影响最终值。",
      "`@Profile` 控制的是 BeanDefinition 是否进入容器。例如本地环境注册 mock 短信客户端，生产环境注册真实短信客户端。它适合少量环境差异 Bean，但不要滥用成复杂业务分支。复杂开关更适合配置属性、条件注解或功能开关系统，因为 profile 主要是启动期环境选择。",
      "配置覆盖是高频坑。基础 application.yml、profile 文件、外部配置、环境变量、命令行参数、配置中心都可能提供同一个 key。最终生效值不只看 profile，还看 PropertySource 优先级。排查时用启动日志、Actuator env、配置绑定报告和容器环境变量对照，不要只盯文件内容。",
      "回答可以说：Profile 解决环境差异，不解决所有动态开关。适合启动时确定的差异，如数据源地址、第三方 endpoint、mock/real Bean；不适合频繁运行时切流、灰度和 AB 实验。生产上还要避免 profile 名称混乱、默认 profile 漏配、敏感配置进代码仓库。"
    ],
    followups: [
      ["@Profile 控制什么？", "控制配置类或 Bean 在指定 profile 激活时才注册到容器。"],
      ["多个 profile 同时激活会怎样？", "配置会合并，同名属性按加载和优先级覆盖，顺序不清会导致最终值出乎意料。"],
      ["spring.config.activate.on-profile 有什么用？", "用于声明某段配置只在特定 profile 下激活，是 Boot 新配置机制里的常见写法。"],
      ["Profile 能做灰度开关吗？", "不适合频繁运行时灰度。Profile 偏启动期环境选择，灰度应使用功能开关或配置中心能力。"]
    ]
  },
  {
    file: "content/questions/spring/spring-scheduled-pitfalls.md",
    slug: "spring-scheduled-pitfalls",
    visual: {
      type: "flow",
      title: "@Scheduled：单机任务到生产治理",
      summary: "Scheduled 简单易用，但要处理线程池、异常、多实例重复、任务重入、时区、补偿和可观测性。",
      nodes: [
        ["定义触发方式", "fixedRate、fixedDelay、cron 语义不同"],
        ["配置线程池", "默认单线程容易阻塞后续任务"],
        ["处理异常", "异常要记录、告警，避免任务悄悄停止或反复失败"],
        ["防止重复执行", "多实例部署要分布式锁或调度平台"],
        ["幂等和补偿", "任务重试、漏跑、超时后要可恢复"],
        ["监控和时区", "记录耗时、成功率、延迟、时区和下一次执行时间"]
      ],
      prompt: "画一张流程图：定义触发方式 -> 配置线程池 -> 处理异常 -> 防止重复执行 -> 幂等和补偿 -> 监控和时区。突出单机定时任务的生产坑。",
      takeaway: "Scheduled 适合轻量单体任务，生产多实例要治理重复和补偿。"
    },
    detail: [
      "`@Scheduled` 使用简单，但生产坑很多。它适合轻量、低频、单应用内的定时任务，例如定期刷新本地缓存、清理临时文件、拉取少量配置。真正涉及订单补偿、账务对账、大批量数据处理、多实例部署时，就要补线程池、幂等、分布式锁、失败重试和监控。",
      "触发方式先要分清。fixedRate 表示按固定频率触发，可能在上一次任务未结束时造成排队或并发风险；fixedDelay 表示上一次执行结束后延迟一段时间再执行；cron 表达日历时间，但要注意时区、夏令时和表达式误配。任务耗时如果接近或超过周期，就必须考虑重入和积压。",
      "线程池是第二个坑。默认调度线程可能较少，某个慢任务会影响其他任务。可以配置 TaskScheduler 或 SchedulingConfigurer，按任务类型拆线程池，设置线程名、池大小、异常处理和拒绝策略。任务内部不要无限阻塞外部依赖，调用下游要有超时和熔断。",
      "多实例部署是高频追问。应用扩容后，每个实例都会执行同一个 `@Scheduled`，如果任务不是天然幂等，就会重复扣款、重复发券、重复推送。解决方案可以是分布式锁、数据库任务表抢占、Quartz、XXL-JOB、ElasticJob、K8s CronJob 或消息驱动调度。无论哪种，都要保证任务幂等和可补偿。",
      "面试回答要把可观测性讲出来：记录每次任务开始、结束、耗时、处理条数、失败原因、下一次执行时间，接入成功率、延迟、连续失败次数告警。任务失败后要能重跑，漏跑后要能按时间窗口补偿，重复执行后靠唯一键或状态机挡住。这样才是生产级定时任务回答。"
    ],
    followups: [
      ["fixedRate 和 fixedDelay 区别是什么？", "fixedRate 按固定频率触发，fixedDelay 等上次执行结束后再延迟触发。"],
      ["多实例重复执行怎么处理？", "用分布式锁、任务表抢占或调度平台，并且业务处理必须幂等。"],
      ["定时任务异常会怎样？", "要看调度器和异常处理配置。生产上必须捕获记录、告警、重试或进入补偿流程。"],
      ["什么时候不用 @Scheduled？", "任务重、分布式、多租户、需要可视化和补偿时，更适合专业调度平台或消息驱动方案。"]
    ]
  },
  {
    file: "content/questions/spring/spring-security-basic.md",
    slug: "spring-security-authentication-authorization",
    visual: {
      type: "sequence",
      title: "Spring Security：认证与授权链路",
      summary: "认证确认你是谁，授权判断你能做什么，过滤器链负责在进入业务前构建上下文并做访问决策。",
      nodes: [
        ["进入过滤器链", "SecurityFilterChain 在 Controller 前拦截请求"],
        ["提取凭证", "用户名密码、Session、JWT 或其他 token"],
        ["认证管理器", "AuthenticationManager 委托 Provider 校验"],
        ["保存上下文", "SecurityContextHolder 或 Repository 保存认证结果"],
        ["授权决策", "URL 规则、方法注解、权限表达式判断"],
        ["返回结果", "未认证 401，权限不足 403，成功放行业务"]
      ],
      prompt: "画一张时序图：进入过滤器链 -> 提取凭证 -> 认证管理器 -> 保存上下文 -> 授权决策 -> 返回结果。突出认证和授权的区别以及 401/403。",
      takeaway: "认证是识别身份，授权是做访问决策。"
    },
    detail: [
      "Spring Security 中认证和授权必须分开讲。认证 authentication 解决“你是谁”，例如用户名密码、短信验证码、Session、JWT、OAuth2 登录都属于认证。授权 authorization 解决“你能做什么”，例如能否访问某个 URL、调用某个方法、操作某条数据。登录成功只代表身份被确认，不代表拥有所有权限。",
      "认证链路发生在 SecurityFilterChain 里。请求进入 Controller 前，安全过滤器会尝试提取凭证，例如表单登录过滤器读取用户名密码，JWT 过滤器读取 Authorization Header。凭证会封装成 Authentication，交给 AuthenticationManager，再委托一个或多个 AuthenticationProvider 校验。Provider 通常会加载用户、校验密码或 token，并返回认证成功的 Authentication。",
      "认证成功后，结果会放入 SecurityContext。传统 Session 场景可能通过 SecurityContextRepository 存到 session；无状态 JWT 场景通常每次请求解析 token 并构建上下文，请求结束后不保存 session。PasswordEncoder、UserDetailsService、AuthenticationProvider、SecurityContextHolder 是面试里常见的关键名词。",
      "授权发生在认证之后。Spring Security 根据配置的 URL 规则、角色权限、方法级注解如 `@PreAuthorize`，以及当前 Authentication 中的 authorities 做访问决策。认证失败通常返回 401，表示没登录或凭证无效；授权失败通常返回 403，表示身份有效但权限不足。这个状态码区别非常适合用来检验理解。",
      "项目里还要考虑角色和权限模型。角色是权限集合，权限是更细的操作点，多租户和数据权限还要结合资源归属判断。前端可以做菜单隐藏，但后端必须做真正授权。回答可以用过滤器链图解收束：请求进来先认证，认证成功写上下文，再授权，最后成功放行或返回 401/403。"
    ],
    followups: [
      ["AuthenticationManager 和 Provider 什么关系？", "AuthenticationManager 是入口，通常委托 AuthenticationProvider 完成具体凭证校验。"],
      ["401 和 403 怎么区分？", "401 是未认证或凭证无效，403 是已认证但权限不足。"],
      ["JWT 场景还需要 SecurityContext 吗？", "需要。每次请求解析 JWT 后仍要构建 Authentication 并放入 SecurityContext 供后续授权使用。"],
      ["权限控制能只放前端吗？", "不能。前端只能控制展示，真正授权必须在后端过滤器、方法或数据访问层完成。"]
    ]
  }
];

const batch40 = [
  {
    file: "content/questions/spring/spring-security-jwt.md",
    slug: "spring-security-jwt",
    visual: {
      type: "sequence",
      title: "Spring Security JWT：登录到鉴权链路",
      summary: "JWT 登录先完成认证并签发令牌，后续请求由过滤器校验令牌、构建 Authentication 并进入授权判断。",
      nodes: [
        ["用户名密码登录", "AuthenticationManager 校验账号、密码和用户状态"],
        ["签发访问令牌", "生成 access token，设置过期时间和签名算法"],
        ["携带 Authorization", "前端后续请求放入 Bearer token"],
        ["JWT 过滤器解析", "校验签名、过期、issuer、用户版本和黑名单"],
        ["写入安全上下文", "构建 Authentication 放入 SecurityContext"],
        ["授权和刷新", "进入 URL/方法授权，配合 refresh token 和密钥轮换"]
      ],
      prompt: "画一张时序图：用户名密码登录 -> 签发访问令牌 -> 携带 Authorization -> JWT 过滤器解析 -> 写入安全上下文 -> 授权和刷新。突出无状态认证、401/403 和 token 生命周期。",
      takeaway: "JWT 是认证载体，SecurityContext 才是后续授权的依据。"
    },
    detail: [
      "Spring Security 集成 JWT 通常分登录签发和请求校验两段。登录时用户提交用户名密码，认证过滤器或登录接口把凭证交给 AuthenticationManager，后者委托 AuthenticationProvider、UserDetailsService、PasswordEncoder 完成用户加载和密码校验。认证成功后服务端生成 JWT，返回给前端，通常包括用户标识、权限版本、过期时间、issuer 等非敏感信息。",
      "后续请求会携带 `Authorization: Bearer <token>`。自定义 JWT 过滤器一般放在用户名密码过滤器之前或合适的认证过滤位置，先解析 token，校验签名、过期时间、算法、issuer、用户状态、token version 或黑名单。校验通过后，构造 Authentication，填入 principal 和 authorities，再放入 SecurityContextHolder，后续授权才能基于当前用户判断。",
      "JWT 常被说成无状态，但要主动讲边界。只校验签名确实可以不查服务端 session，但如果要支持主动退出、踢人、权限即时变更、账号禁用、密钥轮换，就需要黑名单、token version、refresh token 存储、短 access token 加长 refresh token 等机制。否则 token 泄露后，在过期前可能一直可用。",
      "安全细节不能漏。JWT 默认只是签名防篡改，不等于加密，不要把手机号、身份证、密码、权限明细等敏感信息放进 payload。前端存储位置也要权衡：localStorage 易受 XSS，Cookie 要处理 HttpOnly、Secure、SameSite 和 CSRF。密钥要定期轮换，HS256/RS256 选择要看部署和验签场景。",
      "面试回答可以画链路：登录认证成功 -> 签发短期 access token -> 请求带 token -> 过滤器校验 -> 写入 SecurityContext -> 授权判断 -> 失败返回 401 或 403。排查时看过滤器顺序、token 解析日志、时钟偏差、密钥配置、SecurityContext 是否写入、权限是否放进 Authentication。"
    ],
    followups: [
      ["JWT 登录为什么还要写 SecurityContext？", "JWT 只是凭证载体，Spring Security 后续授权依赖 Authentication 和 SecurityContext。"],
      ["退出登录怎么让 JWT 失效？", "短 access token、refresh token 存储、黑名单、用户 tokenVersion 或密钥轮换都可以配合使用。"],
      ["JWT payload 能放敏感信息吗？", "不建议。JWT 默认可被客户端解码，只是签名防篡改，不是加密存储。"],
      ["JWT 鉴权失败返回 401 还是 403？", "token 缺失、过期、无效通常是 401；身份有效但权限不足通常是 403。"]
    ]
  },
  {
    file: "content/questions/spring/spring-transaction-failure.md",
    slug: "spring-transaction-failure",
    visual: {
      type: "flow",
      title: "Spring 事务失效：代理和异常边界",
      summary: "事务失效通常来自没有经过代理、异常没有触发回滚、传播行为不符合预期或事务管理器/数据库不支持。",
      nodes: [
        ["调用是否走代理", "自调用、private/final、非 Spring Bean 都可能绕过代理"],
        ["方法可见性", "事务方法通常应为 public 并由容器管理"],
        ["异常是否抛出", "catch 后吞掉异常不会触发默认回滚"],
        ["回滚规则", "默认 RuntimeException/Error 回滚，checked 需 rollbackFor"],
        ["传播和管理器", "REQUIRES_NEW、NESTED、多个事务管理器要匹配"],
        ["数据库支持", "表引擎、连接、自动提交和隔离级别影响最终效果"]
      ],
      prompt: "画一张排查流程图：调用是否走代理 -> 方法可见性 -> 异常是否抛出 -> 回滚规则 -> 传播和管理器 -> 数据库支持。突出事务失效排查顺序。",
      takeaway: "事务失效先查代理，再查异常和数据库边界。"
    },
    detail: [
      "Spring 事务失效最常见原因是没有经过代理。`@Transactional` 通过事务拦截器增强方法调用，调用方必须拿到 Spring 代理对象。同类内部 `this.method()` 自调用、对象自己 new、方法不是合适的可代理方法、类或方法 final、private 方法等，都可能绕过代理，导致事务注解看起来写了但没有真正生效。",
      "第二类是异常没有触发回滚。Spring 默认对 RuntimeException 和 Error 回滚，对 checked exception 不默认回滚。如果业务抛出自定义受检异常，要配置 rollbackFor。如果方法内部 catch 异常后只记录日志不继续抛出，事务拦截器看到的是正常返回，也不会回滚。手动设置 rollbackOnly 可以兜底，但不要把异常语义弄乱。",
      "第三类是传播行为和事务边界误解。例如外层 REQUIRED 包住内层，内层异常被吞可能导致外层仍提交；REQUIRES_NEW 会挂起外层事务并开启新事务；NESTED 依赖 savepoint，不是所有事务管理器都支持。多数据源项目还要确认用的是正确 TransactionManager，否则注解可能管理了 A 库连接，却以为能回滚 B 库操作。",
      "第四类是数据库层不支持或配置不匹配。比如 MySQL MyISAM 不支持事务，连接自动提交异常，DDL 隐式提交，跨库操作没有分布式事务，隔离级别和锁行为与预期不同。Spring 只是声明事务边界，最终提交和回滚仍由数据库和连接资源完成。",
      "面试回答可以按排查顺序讲：是否被 Spring 管理、是否经过代理、方法是否可代理、异常是否抛出、回滚规则是否正确、传播行为是否符合预期、事务管理器和数据库是否支持。验证时打开事务日志、写最小测试、查看代理类型和数据库提交结果，比只背“自调用失效”更完整。"
    ],
    followups: [
      ["为什么自调用事务会失效？", "同类内部调用绕过代理对象，事务拦截器没有机会开启或加入事务。"],
      ["checked exception 会回滚吗？", "默认不会，需要配置 rollbackFor 或把异常转换为运行时异常。"],
      ["异常 catch 后还能回滚吗？", "默认不会，因为方法正常返回。可以重新抛出或显式 setRollbackOnly。"],
      ["多数据源事务要注意什么？", "确认使用正确的事务管理器，跨库一致性还要考虑分布式事务或补偿方案。"]
    ]
  },
  {
    file: "content/questions/spring/spring-validation.md",
    slug: "spring-validation",
    visual: {
      type: "flow",
      title: "Spring Validation：DTO 到统一错误响应",
      summary: "参数校验通过 Bean Validation 注解、Valid/Validated、分组、嵌套校验和全局异常处理形成接口防线。",
      nodes: [
        ["DTO 声明约束", "NotNull、NotBlank、Size、Pattern 等字段规则"],
        ["触发校验", "@Valid 或 @Validated 放在参数或类上"],
        ["分组和嵌套", "新增/修改分组，嵌套对象和集合也要触发"],
        ["方法级校验", "Validated 类上启用方法参数和返回值校验"],
        ["BindingResult", "可手动接收错误，避免直接抛异常"],
        ["统一异常响应", "ControllerAdvice 返回字段、错误码和可读提示"]
      ],
      prompt: "画一张流程图：DTO 声明约束 -> 触发校验 -> 分组和嵌套 -> 方法级校验 -> BindingResult -> 统一异常响应。突出 400 响应和复杂业务规则边界。",
      takeaway: "校验要前置，但复杂业务规则不能全塞进注解。"
    },
    detail: [
      "Spring 参数校验通常基于 Bean Validation。DTO 字段上使用 `@NotNull`、`@NotBlank`、`@Size`、`@Pattern`、`@Email`、`@Min`、`@Max` 等注解，Controller 参数上加 `@Valid` 或 `@Validated` 触发校验。校验失败后不应直接把框架异常暴露给前端，而要通过全局异常处理统一错误码、字段名和提示信息。",
      "`@Valid` 是标准注解，`@Validated` 是 Spring 提供的增强，常用于分组校验和方法级校验。新增和修改经常要求不同字段必填，可以定义 CreateGroup、UpdateGroup，然后在 Controller 参数上指定分组。方法级校验通常需要在类上加 `@Validated`，让 Spring 对方法参数和返回值做校验。",
      "嵌套校验和集合校验是高频坑。DTO 里包含子对象时，子对象字段不会因为外层加了 `@Valid` 就总是自动校验，通常需要在嵌套字段上也标注 `@Valid`。集合元素校验也要注意泛型位置和框架版本支持。否则前端传入的子对象非法，后端可能仍然进入业务逻辑。",
      "异常类型要能说清。`@RequestBody` JSON 对象校验失败常见 MethodArgumentNotValidException；普通参数或方法级校验可能是 ConstraintViolationException；绑定失败可能是 BindException。全局异常处理要把这些异常统一转换成 400 响应，并返回字段路径、错误消息、错误码和 traceId。",
      "边界也要主动说明。注解校验适合格式、长度、必填、范围这类简单规则；跨字段规则可以用类级自定义 Constraint；需要查数据库、判断状态机、校验库存、权限和业务一致性的复杂规则，应放到业务服务里。面试回答按“DTO 注解、触发校验、分组嵌套、异常处理、业务边界”组织最稳。"
    ],
    followups: [
      ["@Valid 和 @Validated 有什么区别？", "@Valid 是 Bean Validation 标准注解，@Validated 是 Spring 增强，支持分组和方法级校验。"],
      ["嵌套对象为什么没校验？", "通常需要在嵌套字段上也加 @Valid，并确认集合元素校验写法正确。"],
      ["校验失败怎么统一返回？", "用 @ControllerAdvice 捕获校验异常，整理字段、消息、错误码和 traceId 后返回 400。"],
      ["复杂业务规则适合写校验注解吗？", "简单跨字段可以自定义 Constraint，依赖数据库或状态机的规则更适合放业务层。"]
    ]
  },
  {
    file: "content/questions/spring/spring-webclient.md",
    slug: "spring-webclient",
    visual: {
      type: "compare",
      title: "WebClient vs RestTemplate：阻塞和响应式边界",
      summary: "RestTemplate 是同步阻塞客户端，WebClient 基于 Reactor Netty 支持非阻塞、流式、超时重试和组合式调用。",
      nodes: [
        ["RestTemplate 阻塞", "调用线程等待远端响应，模型直观"],
        ["WebClient 非阻塞", "返回 Mono/Flux，事件循环处理 IO"],
        ["连接池和超时", "Reactor Netty 配置连接、读写超时和资源上限"],
        ["retrieve 读取响应", "适合普通状态码处理和 body 转换"],
        ["exchangeToMono", "需要精细处理状态码、Header 和 Body"],
        ["阻塞隔离", "MVC 中可用，但 block 和阻塞 SDK 要隔离"]
      ],
      prompt: "画一张对比图：RestTemplate 阻塞 -> WebClient 非阻塞 -> 连接池和超时 -> retrieve 读取响应 -> exchangeToMono -> 阻塞隔离。突出响应式收益和误用边界。",
      takeaway: "WebClient 的收益来自非阻塞链路，随手 block 会把收益吃掉。"
    },
    detail: [
      "RestTemplate 是传统同步阻塞 HTTP 客户端，调用线程发出请求后会等待远端响应。WebClient 是 Spring WebFlux 体系下的响应式 HTTP 客户端，基于 Reactor，常用 Reactor Netty 作为底层运行时，返回 Mono 或 Flux。它适合高并发 IO、流式响应、组合多个异步调用和响应式链路。",
      "WebClient 不等于自动更快。它的优势来自少量事件循环线程处理大量非阻塞 IO，如果调用链里大量使用 `block()`、调用阻塞数据库驱动、阻塞 SDK 或 CPU 重计算，收益会明显下降，甚至拖垮事件循环。MVC 项目里也可以使用 WebClient，但要明确是在同步边界 block，还是把异步结果继续向上组合。",
      "生产配置不能省。需要设置连接池、连接超时、响应超时、读写超时、最大内存、重试策略、退避、熔断和日志脱敏。默认配置在小流量下能跑，不代表适合线上。对外部依赖要有超时和失败兜底，不能让一个远端慢调用占满连接池或让响应式链路无限等待。",
      "`retrieve()` 和 `exchangeToMono()` 的区别也常被问。retrieve 适合普通场景，链式处理状态码和 body；exchangeToMono 可以拿到 ClientResponse，更精细地按状态码、Header、Body 决定处理方式。错误处理要结合 onStatus、onErrorResume、retryWhen，但重试必须限定幂等请求和最大次数。",
      "面试回答可以按“阻塞模型、非阻塞模型、适用场景、误用边界、生产配置”讲。排查时看事件循环线程是否被阻塞、连接池 pending acquire、超时配置、重试次数、下游状态码、日志中是否泄露 token，以及 TraceId/MDC 是否在响应式上下文中传递。"
    ],
    followups: [
      ["WebClient 一定比 RestTemplate 快吗？", "不一定。只有链路主要是非阻塞 IO 且配置合理时，WebClient 才更容易发挥并发优势。"],
      ["MVC 项目里能用 WebClient 吗？", "能用，但要清楚 block 的位置和成本，避免在事件循环线程或关键路径乱 block。"],
      ["retrieve 和 exchangeToMono 怎么选？", "普通响应体读取用 retrieve，更复杂的状态码、Header、Body 联动处理用 exchangeToMono。"],
      ["WebClient 超时怎么做？", "在 Reactor Netty 和响应式链路上配置连接、响应、读写超时，并配合 retry/backoff 和兜底。"]
    ]
  },
  {
    file: "content/questions/spring/starter.md",
    slug: "spring-boot-starter",
    visual: {
      type: "structure",
      title: "Spring Boot Starter：依赖和自动配置组合",
      summary: "Starter 通常负责依赖聚合，真正的默认 Bean、属性绑定和条件装配在 autoconfigure 中完成。",
      nodes: [
        ["Starter 依赖", "业务方引入一个 starter 获得一组能力"],
        ["传递功能库", "带入核心 SDK、客户端或框架依赖"],
        ["Autoconfigure", "自动配置模块声明默认配置类"],
        ["条件装配", "类存在、配置开启、用户未定义 Bean 才生效"],
        ["属性绑定", "ConfigurationProperties 暴露可调参数"],
        ["开箱和覆盖", "默认可用，同时允许业务自定义 Bean"]
      ],
      prompt: "画一张结构图：Starter 依赖 -> 传递功能库 -> Autoconfigure -> 条件装配 -> 属性绑定 -> 开箱和覆盖。突出 starter 与 autoconfigure 的分工。",
      takeaway: "Starter 是入口包装，自动配置才是开箱即用的核心。"
    },
    detail: [
      "Spring Boot Starter 可以理解成一组依赖和自动配置的组合入口。业务方引入 `spring-boot-starter-web`、`spring-boot-starter-data-redis` 这类依赖后，不需要手动拼大量库版本和基础 Bean，Boot 会通过自动配置给出合理默认值。Starter 的价值是降低接入成本和统一约定。",
      "严格说，starter 通常不直接承载大量配置逻辑。它更多负责依赖聚合，把核心功能库、autoconfigure 模块和必要依赖带进项目。真正创建默认 Bean、绑定配置、判断条件是否满足的逻辑放在 autoconfigure 里。自定义 starter 时也建议拆分 starter 与 autoconfigure，避免模块职责混乱。",
      "自动配置要配合条件注解。`@ConditionalOnClass` 确认类路径存在相关库，`@ConditionalOnProperty` 允许配置开关，`@ConditionalOnMissingBean` 尊重业务自定义实现。这样 starter 才能做到默认可用，但不强行覆盖业务侧配置。配置项通常由 `@ConfigurationProperties` 承载，便于文档、校验和 IDE 提示。",
      "Boot 3 的自动配置注册要注意 `AutoConfiguration.imports`，旧版 spring.factories 是历史语境。面试时可以提到版本差异，避免说法过时。排查 starter 为什么没生效，可以看依赖树、自动配置报告、conditions、配置属性绑定错误和是否已有用户 Bean。",
      "回答可以用“引入 starter -> 获得依赖 -> 导入自动配置 -> 条件判断 -> 创建默认 Bean -> 用户可覆盖”这条链路。不要把 starter 简化成“一个 jar 包”，它更是一套约定：版本管理、默认配置、条件装配、配置元数据和测试样例共同保证开箱即用。"
    ],
    followups: [
      ["starter 和 autoconfigure 谁负责创建 Bean？", "通常 autoconfigure 负责默认 Bean 和条件装配，starter 主要负责依赖聚合。"],
      ["为什么 starter 要允许覆盖？", "业务项目可能有自定义实现，OnMissingBean 能避免默认 Bean 压掉业务配置。"],
      ["Boot 3 自动配置注册文件是什么？", "主要是 META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports。"],
      ["starter 没生效怎么排查？", "看依赖树、conditions、配置属性、用户自定义 Bean、类路径条件和启动日志。"]
    ]
  },
  {
    file: "content/questions/spring/transaction-isolation.md",
    slug: "spring-transaction-isolation",
    visual: {
      type: "structure",
      title: "Spring 事务隔离：声明到数据库实现",
      summary: "Spring 的 isolation 属性会传给数据库连接，真正语义由数据库隔离级别、MVCC 和锁机制决定。",
      nodes: [
        ["Isolation DEFAULT", "使用数据库默认隔离级别"],
        ["READ COMMITTED", "常见于 Oracle/PostgreSQL，避免脏读"],
        ["REPEATABLE READ", "MySQL InnoDB 默认常见级别，结合 MVCC"],
        ["SERIALIZABLE", "隔离最强，并发代价最高"],
        ["数据库实现", "MVCC、Next-Key Lock、快照读和当前读差异"],
        ["性能取舍", "隔离越强不一定越好，要按业务一致性选择"]
      ],
      prompt: "画一张结构图：Isolation DEFAULT -> READ COMMITTED -> REPEATABLE READ -> SERIALIZABLE -> 数据库实现 -> 性能取舍。突出 Spring 声明和数据库实现的关系。",
      takeaway: "隔离级别写在 Spring，真正执行在数据库。"
    },
    detail: [
      "Spring 事务隔离级别通过 `@Transactional(isolation = Isolation.xxx)` 声明，但它本质上是把隔离级别设置到底层数据库连接上，真正语义由数据库实现。`Isolation.DEFAULT` 表示使用数据库默认级别，不是 Spring 自己定义一个默认隔离。MySQL InnoDB 常见默认是 REPEATABLE READ，Oracle 和 PostgreSQL 常见默认是 READ COMMITTED。",
      "各级别要能和并发现象对应。READ_UNCOMMITTED 可能读到未提交数据，READ_COMMITTED 避免脏读，但可能不可重复读，REPEATABLE_READ 避免脏读和不可重复读，SERIALIZABLE 隔离最强但并发代价最高。Spring 的枚举名只是声明，数据库是否支持、如何实现、是否降级处理，都要看具体数据库。",
      "MySQL InnoDB 下还要补 MVCC 和锁。普通快照读通过 Read View 提供一致性视图，当前读如 select for update、update、delete 会涉及锁和 Next-Key Lock。很多幻读问题不能只背 ANSI 隔离级别，要结合 InnoDB 的快照读、当前读、间隙锁和索引条件判断。",
      "隔离级别不是越高越好。强隔离会增加锁等待、死锁概率和吞吐下降。大多数业务用数据库默认级别即可，只有对并发一致性特别敏感的局部场景才考虑提高隔离或显式加锁。更常见的工程做法是唯一约束、乐观锁、状态机、幂等表和 select for update 组合，而不是全局改高隔离。",
      "排查时看事务是否真正开启、连接隔离级别、数据库默认值、SQL 类型、执行计划是否用到索引、锁等待和死锁日志。面试回答用“Spring 声明、数据库实现、MVCC/锁、性能取舍、排查证据”五段组织，能避免把事务隔离讲成纯 Spring 注解题。"
    ],
    followups: [
      ["Isolation.DEFAULT 是什么意思？", "使用底层数据库默认隔离级别，不是 Spring 固定指定某一级别。"],
      ["MySQL RR 一定没有幻读吗？", "要区分快照读和当前读。InnoDB 通过 MVCC 和 Next-Key Lock 处理很多场景，但不能脱离 SQL 和索引讨论。"],
      ["隔离级别越高越安全吗？", "一致性更强但并发成本更高，可能带来锁等待、死锁和吞吐下降。"],
      ["怎么验证隔离级别是否生效？", "通过数据库会话变量、事务日志、并发测试和锁等待表现确认，不能只看注解。"]
    ]
  },
  {
    file: "content/questions/spring/transaction-propagation.md",
    slug: "spring-transaction-propagation",
    visual: {
      type: "compare",
      title: "Spring 事务传播：加入、创建和挂起",
      summary: "传播行为决定方法进入时如何处理已有事务，重点是 REQUIRED、REQUIRES_NEW、NESTED 及异常传播边界。",
      nodes: [
        ["REQUIRED", "有事务就加入，没有就新建，默认最常用"],
        ["REQUIRES_NEW", "挂起外部事务，自己开启独立新事务"],
        ["NESTED", "使用 savepoint 嵌套回滚，依赖事务管理器支持"],
        ["SUPPORTS", "有事务就加入，没有就非事务执行"],
        ["MANDATORY 和 NEVER", "强制必须有事务或必须没有事务"],
        ["异常传播", "内外事务回滚关系取决于传播、异常和捕获方式"]
      ],
      prompt: "画一张对比图：REQUIRED -> REQUIRES_NEW -> NESTED -> SUPPORTS -> MANDATORY 和 NEVER -> 异常传播。突出挂起、新事务和 savepoint。",
      takeaway: "传播行为不是事务强弱，而是进入方法时怎么处理已有事务。"
    },
    detail: [
      "Spring 事务传播行为决定一个事务方法被调用时，遇到当前线程已经存在事务该怎么办。默认 REQUIRED 表示有事务就加入，没有事务就创建一个。它适合大多数业务主流程，因为一组数据库操作可以作为整体提交或回滚。理解传播行为，关键是看“是否已有事务、是否新建、是否挂起、是否保存点”。",
      "REQUIRES_NEW 会挂起外部事务，开启一个完全独立的新事务。内层提交不依赖外层提交，外层后续回滚也不会把已经提交的内层事务撤回。它适合审计日志、操作记录、失败状态落库等必须独立提交的场景，但会多占一个数据库连接，高并发下可能造成连接池压力。",
      "NESTED 使用嵌套事务语义，通常依赖 JDBC savepoint。内层失败可以回滚到保存点，外层仍可继续，但外层最终回滚时内层也会一起回滚。它和 REQUIRES_NEW 最大区别是：NESTED 仍属于外层事务的一部分，REQUIRES_NEW 是独立事务。并且 NESTED 是否可用取决于事务管理器和数据库支持。",
      "其他传播行为也要有印象。SUPPORTS 表示有事务就加入，没有事务就非事务执行；MANDATORY 要求必须已有事务，否则报错；NOT_SUPPORTED 会挂起事务后非事务执行；NEVER 要求不能有事务；REQUIRED_NEW 和 NESTED 是面试最爱追问的两个。",
      "异常传播是实际坑点。内层方法抛异常如果被外层 catch，可能导致事务状态和业务预期不一致；REQUIRES_NEW 内层已提交后，外层回滚不会撤销内层；REQUIRED 内层标记 rollbackOnly 后，外层想提交可能遇到 UnexpectedRollbackException。回答时一定要结合异常是否抛出、是否捕获、回滚规则和传播行为一起分析。"
    ],
    followups: [
      ["REQUIRES_NEW 和 NESTED 最大区别是什么？", "REQUIRES_NEW 是独立新事务并挂起外层，NESTED 是外层事务内的 savepoint。"],
      ["REQUIRES_NEW 有什么代价？", "会额外占用连接和提交事务，高并发下可能增加连接池压力和死锁风险。"],
      ["UnexpectedRollbackException 怎么来的？", "内层把共享事务标记为 rollbackOnly，外层捕获异常后仍尝试提交，就可能出现这个异常。"],
      ["NESTED 一定可用吗？", "不一定。它依赖事务管理器、JDBC savepoint 和数据库能力。"]
    ]
  },
  {
    file: "content/questions/spring/transaction-readonly.md",
    slug: "spring-transaction-readonly",
    visual: {
      type: "structure",
      title: "readOnly 事务：语义、优化和误区",
      summary: "readOnly 是只读意图提示，可影响 ORM、连接和读写路由，但不是所有场景都强制禁止写入。",
      nodes: [
        ["声明只读意图", "@Transactional(readOnly = true) 表达查询事务"],
        ["ORM 优化", "Hibernate 可能调整 flush mode，减少脏检查"],
        ["数据库连接提示", "部分驱动可设置 read only 或 START TRANSACTION READ ONLY"],
        ["读写分离路由", "框架可能据此路由到只读库"],
        ["不是绝对禁写", "是否禁止写取决于数据库、驱动和事务管理器"],
        ["监控和误路由", "关注只读库写入异常、延迟和事务语义"]
      ],
      prompt: "画一张结构图：声明只读意图 -> ORM 优化 -> 数据库连接提示 -> 读写分离路由 -> 不是绝对禁写 -> 监控和误路由。突出 readOnly 的提示语义和边界。",
      takeaway: "readOnly 是优化和路由信号，不是万能写保护。"
    },
    detail: [
      "`@Transactional(readOnly = true)` 表达当前事务主要用于读取。它的价值首先是语义清楚：告诉框架、团队和读写分离组件，这段逻辑不应该修改数据。对纯查询服务来说，加 readOnly 能减少误解，也方便后续做读写路由和监控治理。",
      "ORM 场景下 readOnly 可能带来优化。比如 Hibernate 可以调整 flush mode，减少脏检查和自动 flush 的成本。对于大量查询对象但不修改的场景，这能降低持久化上下文维护开销。但具体效果取决于 ORM、事务管理器和配置，不能简单说所有数据库查询加 readOnly 都一定更快。",
      "数据库层也有差异。某些事务管理器或驱动会把只读标记传给连接，MySQL 可以有 `START TRANSACTION READ ONLY` 这类语义，但是否强制禁止写、何时生效、对临时表或特殊语句如何处理，都要看数据库实现。Spring 的 readOnly 不是跨所有数据库的一把写入禁令。",
      "读写分离是实际项目中的重要用途。很多动态数据源框架会根据 readOnly 或方法命名把查询路由到从库。如果查询方法里夹带写操作，可能在只读库报错；如果需要读自己刚写的数据，路由到从库又可能遇到复制延迟。readOnly 和一致性、延迟、路由策略要一起考虑。",
      "面试回答可以按“语义提示、ORM 优化、连接提示、读写分离、不是强制禁写、排查监控”来讲。排查时看事务日志、连接是否 readOnly、SQL 是否真的写入、路由到主库还是从库、复制延迟和异常栈。这样能把 readOnly 从一个注解属性讲成完整工程约束。"
    ],
    followups: [
      ["readOnly 会强制禁止写吗？", "不一定。它是只读意图提示，是否强制禁止写取决于数据库、驱动和事务管理器。"],
      ["readOnly 对 Hibernate 有什么影响？", "可能调整 flush mode，减少脏检查和自动 flush，降低只读查询的 ORM 开销。"],
      ["读写分离为什么会用 readOnly？", "动态数据源可以把 readOnly 事务路由到从库，但要注意复制延迟和误写。"],
      ["所有查询都要加 readOnly 吗？", "核心查询服务可以加，但要结合团队规范、路由策略和是否存在读后写一致性要求。"]
    ]
  },
  {
    file: "content/questions/spring/transaction-rollback-rules.md",
    slug: "spring-transaction-rollback-rules",
    visual: {
      type: "flow",
      title: "事务回滚规则：异常到 rollbackOnly",
      summary: "Spring 默认运行时异常和 Error 回滚，受检异常需 rollbackFor，异常被吞或异步抛出不会自动影响原事务。",
      nodes: [
        ["方法进入事务", "事务拦截器开启或加入事务"],
        ["抛出运行时异常", "RuntimeException/Error 默认触发回滚"],
        ["抛出受检异常", "checked exception 默认不回滚"],
        ["配置规则", "rollbackFor 和 noRollbackFor 覆盖默认行为"],
        ["异常被捕获", "catch 后正常返回不会自动回滚"],
        ["标记和异步边界", "setRollbackOnly、异步线程异常要单独处理"]
      ],
      prompt: "画一张流程图：方法进入事务 -> 抛出运行时异常 -> 抛出受检异常 -> 配置规则 -> 异常被捕获 -> 标记和异步边界。突出默认规则和失效边界。",
      takeaway: "能不能回滚，取决于异常类型、是否抛出和回滚规则。"
    },
    detail: [
      "Spring 声明式事务的默认回滚规则是：RuntimeException 和 Error 触发回滚，checked exception 默认不触发回滚。这个默认值和 Java 异常体系有关，但项目里不能只背一句话。很多业务异常是自定义受检异常，如果希望它回滚，就要在 `@Transactional(rollbackFor = XxxException.class)` 中明确声明。",
      "`rollbackFor` 和 `noRollbackFor` 可以覆盖默认规则。rollbackFor 表示遇到指定异常也回滚，noRollbackFor 表示遇到指定异常不回滚。配置时要注意异常继承层次，过宽可能让本应提交的业务被回滚，过窄又可能漏掉异常。团队最好统一业务异常体系和事务规则。",
      "异常是否抛出也很关键。如果事务方法内部 catch 异常后只打印日志并正常返回，事务拦截器看到的是成功返回，就会提交。要么重新抛出异常，要么调用 TransactionAspectSupport.currentTransactionStatus().setRollbackOnly() 显式标记回滚。后者适合少数需要吞异常但仍回滚的场景，不要滥用。",
      "异步和跨线程不会自动影响原事务。`@Async` 方法里抛异常，不会让调用方已经进行中的事务自动回滚；事务事件 AFTER_COMMIT 阶段失败，也不会回滚已经提交的主事务。这类副作用要靠重试、补偿、本地消息表或 Outbox 处理。",
      "面试回答可以按“默认规则、checked exception、rollbackFor/noRollbackFor、catch 吞异常、setRollbackOnly、异步边界”组织。排查时看异常类型、异常是否被捕获、事务日志、rollbackOnly 标记、传播行为和数据库提交结果。这样比只说“运行时异常回滚”更像真实项目经验。"
    ],
    followups: [
      ["checked exception 默认回滚吗？", "默认不回滚，需要配置 rollbackFor。"],
      ["catch 异常后事务会回滚吗？", "默认不会，因为方法正常返回。需要重新抛出或显式 setRollbackOnly。"],
      ["noRollbackFor 有什么用？", "用于声明某些异常即使抛出也不回滚，但要谨慎避免提交脏数据。"],
      ["异步方法异常会回滚外层事务吗？", "不会自动回滚。异步线程和调用方事务边界不同，需要单独补偿。"]
    ]
  },
  {
    file: "content/questions/spring/webflux-vs-mvc.md",
    slug: "spring-mvc-webflux",
    visual: {
      type: "compare",
      title: "Spring MVC vs WebFlux：线程模型与选型",
      summary: "MVC 采用传统请求线程模型，WebFlux 采用响应式非阻塞模型；选型取决于链路是否真正非阻塞。",
      nodes: [
        ["MVC Servlet 模型", "一个请求占用工作线程，代码同步直观"],
        ["WebFlux 事件循环", "少量线程处理大量非阻塞 IO"],
        ["Mono 和 Flux", "0/1 个结果和 0/N 个结果的响应式类型"],
        ["背压机制", "Reactive Streams 控制生产和消费速度"],
        ["阻塞调用风险", "JDBC、阻塞 SDK、block 会削弱收益"],
        ["选型取舍", "CRUD 用 MVC 更稳，高并发 IO/流式链路考虑 WebFlux"]
      ],
      prompt: "画一张对比图：MVC Servlet 模型 -> WebFlux 事件循环 -> Mono 和 Flux -> 背压机制 -> 阻塞调用风险 -> 选型取舍。突出不是新技术一定更快。",
      takeaway: "WebFlux 适合非阻塞 IO 链路，不是 MVC 的全面替代。"
    },
    detail: [
      "Spring MVC 基于传统 Servlet 模型，一个请求通常绑定到一个工作线程，代码以同步阻塞方式编写，Controller 返回对象或视图，开发体验直观，生态成熟。绝大多数 CRUD、后台管理、常规业务系统用 MVC 更简单，团队维护成本更低。",
      "WebFlux 是响应式 Web 框架，使用 Mono、Flux 表达异步结果，底层可运行在 Netty 等非阻塞运行时上。它适合高并发 IO、长连接、SSE、流式响应、聚合多个远端异步调用等场景。少量事件循环线程可以处理大量非阻塞连接，但前提是整个链路尽量非阻塞。",
      "响应式的关键不是语法新，而是线程模型和背压。Reactive Streams 通过订阅、请求数量和背压机制协调生产者和消费者，避免下游处理不过来时无限堆积。Mono 表示 0 到 1 个结果，Flux 表示 0 到多个结果。调试和错误处理也从同步栈变成异步链路，学习成本更高。",
      "阻塞调用是 WebFlux 最大误区。如果在响应式链路里直接调用阻塞 JDBC、阻塞 Redis 客户端、老 SDK，或者随手 `block()`，事件循环线程会被卡住，吞吐优势消失。可以把阻塞调用隔离到 boundedElastic 等线程池，但这会增加复杂度，也说明链路并不是真正端到端非阻塞。",
      "面试选型可以这样说：普通业务、团队响应式经验不足、数据库驱动和中间件都是阻塞的，用 MVC 更稳；大量外部 IO 聚合、流式数据、网关类应用、端到端响应式数据访问，可以考虑 WebFlux。验证时看线程数、连接数、P99、事件循环阻塞告警、上下文传递和调试成本。"
    ],
    followups: [
      ["WebFlux 一定比 MVC 性能好吗？", "不一定。只有非阻塞 IO 链路和正确配置下才可能体现优势，CPU 密集或阻塞链路收益有限。"],
      ["Mono 和 Flux 怎么理解？", "Mono 表示 0 到 1 个异步结果，Flux 表示 0 到多个异步结果或流。"],
      ["响应式链路里能调用阻塞 JDBC 吗？", "技术上能，但要隔离到专用线程池，否则会阻塞事件循环并削弱 WebFlux 收益。"],
      ["MVC 项目能只用 WebClient 吗？", "可以。MVC 仍处理请求，WebClient 作为 HTTP 客户端调用外部服务，但要管理 block 边界。"]
    ]
  }
];

const repairBatches = {
  34: {
    entries: batch34,
    range: "331-340",
    nextBatch: 35
  },
  35: {
    entries: batch35,
    range: "341-350",
    nextBatch: 36
  },
  36: {
    entries: batch36,
    range: "351-360",
    nextBatch: 37
  },
  37: {
    entries: batch37,
    range: "361-370",
    nextBatch: 38
  },
  38: {
    entries: batch38,
    range: "371-380",
    nextBatch: 39
  },
  39: {
    entries: batch39,
    range: "381-390",
    nextBatch: 40
  },
  40: {
    entries: batch40,
    range: "391-400",
    nextBatch: null
  }
};

function sectionText(title, body) {
  return `## ${title}\n\n${body.trim()}\n`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function setSection(content, title, body, beforeTitle) {
  const section = sectionText(title, body);
  const pattern = new RegExp(`^## ${escapeRegExp(title)}\\r?\\n[\\s\\S]*?(?=\\r?\\n## |(?![\\s\\S]))`, "gm");
  const matches = [...content.matchAll(pattern)];

  if (matches.length > 0) {
    let next = content;

    for (let index = matches.length - 1; index >= 0; index -= 1) {
      const match = matches[index];
      const start = match.index;
      const end = start + match[0].length;
      next = `${next.slice(0, start)}${index === 0 ? section : ""}${next.slice(end)}`;
    }

    return next.replace(/\n{3,}/g, "\n\n");
  }

  if (beforeTitle) {
    const beforePattern = new RegExp(`^## ${escapeRegExp(beforeTitle)}\\r?$`, "m");
    const beforeMatch = content.match(beforePattern);

    if (beforeMatch?.index !== undefined) {
      return `${content.slice(0, beforeMatch.index)}${section}\n${content.slice(beforeMatch.index)}`.replace(/\n{3,}/g, "\n\n");
    }
  }

  return `${content.trimEnd()}\n\n${section}`;
}

function detailBody(entry) {
  const nodeLabels = entry.visual.nodes.map(([label]) => label);
  const firstHalf = nodeLabels.slice(0, 3).join("、");
  const secondHalf = nodeLabels.slice(3).join("、");
  const extension = extensionBody(entry, firstHalf, secondHalf);

  return [...entry.detail, ...extension].join("\n\n");
}

function extensionBody(entry, firstHalf, secondHalf) {
  if (entry.file.includes("/spring/")) {
    return [
      `如果把这道题讲成项目经历，可以从“${firstHalf}”切入，先交代触发条件、请求或容器阶段，再展开关键机制。接着用“${secondHalf}”说明处理动作、验证指标和失败兜底。这样面试官继续追问时，你可以沿着一条真实链路回答：请求从哪里进入，Spring 容器或代理对象做了什么，哪个上下文会变化，失败时怎样限制影响面。`,
      `图解时不要只画名词列表，要把状态变化画出来：哪些节点代表入口，哪些节点代表容器扩展点，哪些节点代表代理、事务或线程上下文，哪些节点代表验证闭环。回答最后再补一句取舍：Spring 方案通常是在开发效率、扩展性、运行时代理边界和排障复杂度之间做平衡，不能只说“加注解”或“改配置”，必须说明生效时机、失效条件、灰度策略、告警阈值和回滚方式。`,
      `落到线上时，还要主动补监控证据：启动日志、Bean 创建顺序、ConditionEvaluationReport、Actuator 端点、请求链路、线程池指标、事务日志、异常栈、接口 P95/P99 和安全审计等信号。能把这些信号讲出来，答案才从“知道 Spring 注解”升级为“能维护 Spring 应用”。如果面试官继续追问，还可以补一次故障演练：如何模拟代理失效、如何观察上下文、如何灰度恢复、如何持续复盘防止同类问题再次发生和扩大。`
    ];
  }

  return [
    `如果把这道题讲成项目经历，可以从“${firstHalf}”切入，先交代触发条件和系统现象，再展开关键机制。接着用“${secondHalf}”说明处理动作、验证指标和失败兜底。这样面试官继续追问时，你可以沿着一条真实链路回答：请求从哪里来，Redis 或客户端做了什么，哪个指标会变化，失败时怎样限制影响面。`,
    `图解时不要只画名词列表，要把状态变化画出来：哪些节点代表原因，哪些节点代表机制，哪些节点代表风险，哪些节点代表验证闭环。回答最后再补一句取舍：Redis 方案通常是在性能、可用性、一致性和运维复杂度之间做平衡，不能只说“加缓存”或“改配置”，必须说明适用边界、灰度策略、告警阈值、恢复预案和回滚方式。`,
    `落到线上时，还要主动补监控证据：慢日志、命令耗时、key 大小、内存曲线、连接数、命中率、错误率、容量水位和客户端重试等信号。能把这些信号讲出来，答案才从“知道 Redis 命令”升级为“能维护 Redis 系统”。如果面试官继续追问，还可以补一次故障演练：如何模拟异常、如何观察指标、如何灰度恢复、如何持续复盘防止同类问题再次发生和扩大。`
  ];
}

function followupBody(entry) {
  return entry.followups
    .map(([question, answer]) => `### ${question}\n\n${answer}`)
    .join("\n\n");
}

function diagramBody(entry) {
  return `适合画一张${entry.visual.type === "compare" ? "对比图" : entry.visual.type === "sequence" ? "时序图" : entry.visual.type === "flow" ? "流程图" : "结构图"}：${entry.visual.nodes
    .map(([label]) => label)
    .join(" -> ")}。画面重点突出：${entry.visual.summary}`;
}

function toVisual(entry) {
  return {
    type: entry.visual.type,
    title: entry.visual.title,
    summary: entry.visual.summary,
    nodes: entry.visual.nodes.map(([label, detail], index) => ({
      label,
      detail,
      tone: index === 0 ? "main" : /异常|限制|故障|降级|爆|受限|失败|PFAIL|FAIL|雪崩|击穿|穿透/.test(label) ? "warn" : "safe"
    })),
    prompt: entry.visual.prompt,
    takeaway: entry.visual.takeaway
  };
}

function repairMarkdown(entry) {
  const fullPath = path.join(root, entry.file);
  let raw = fs.readFileSync(fullPath, "utf8");

  raw = setSection(raw, "常见追问", followupBody(entry), "易错点");
  raw = setSection(raw, "详细讲解", detailBody(entry), "深挖理解");
  raw = setSection(raw, "图解提示", diagramBody(entry), "记忆钩子");

  fs.writeFileSync(fullPath, raw.trimEnd() + "\n", "utf8");
}

function writeProgress(batch, metadata) {
  let current = {};
  const { entries } = metadata;

  if (fs.existsSync(progressPath)) {
    current = JSON.parse(fs.readFileSync(progressPath, "utf8"));
  }

  current.updatedAt = "2026-05-04";
  current.batchSize = 10;
  current.completedRepairBatches = Array.from(new Set([...(current.completedRepairBatches ?? []), batch])).sort((a, b) => a - b);
  current.lastBatch = {
    batch,
    range: metadata.range,
    slugs: entries.map((entry) => entry.slug),
    fixes: [
      "重写详细讲解，去除通用模板污染",
      "扩充常见追问为 4 个专项追问",
      "去重并重写图解提示",
      "更新 visual 节点，消除截断标签"
    ]
  };
  current.nextBatch = metadata.nextBatch;

  fs.writeFileSync(progressPath, JSON.stringify(current, null, 2) + "\n", "utf8");
}

const requestedBatch = Number.parseInt(process.argv[2] ?? "34", 10);
const selectedBatch = repairBatches[requestedBatch];

if (!selectedBatch) {
  console.error(`Unknown repair batch: ${process.argv[2] ?? ""}`);
  process.exit(1);
}

for (const entry of selectedBatch.entries) {
  repairMarkdown(entry);
}

const visuals = JSON.parse(fs.readFileSync(visualPath, "utf8"));

for (const entry of selectedBatch.entries) {
  visuals[entry.slug] = toVisual(entry);
}

fs.writeFileSync(visualPath, JSON.stringify(visuals, null, 2) + "\n", "utf8");
writeProgress(requestedBatch, selectedBatch);

console.log(`Repaired batch ${requestedBatch}: ${selectedBatch.entries.map((entry) => entry.slug).join(", ")}`);
