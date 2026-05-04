# 题目质检 Batch 5：分布式/工程化 41-50

审查时间：2026-05-03  
范围：排序后的第 41-50 道题，`content/questions/distributed/sentinel-flow-control.md` 至 `content/questions/engineering/docker-basic.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批里工程化题的基础质量明显好一些，`ci-cd` 和 `docker-basic` 已经接近可直接使用；`service-discovery` 的详细讲解也比较扎实。分布式题仍有较多模板污染和专项追问不足。

- `sentinel-flow-control`、`spring-cloud-gateway-route`、`tcc-transaction` 存在重复 `## 图解提示`。
- 多篇分布式题继续出现 `生产者 -> Broker/注册中心 -> 消费者 -> 数据库 -> 补偿任务`、`死信处理`、`人工重放` 等 MQ 模板。
- `trace-id`、`service-discovery`、`tcc-transaction` 的图解节点有截断，如 `找…`、`实…`、`释…`，需要清理。
- `blue-green-canary.md` 和 `blue-green-gray.md` 内容主题高度相近，二者都能保留，但应明确一个讲“金丝雀和灰度关系”，另一个讲“蓝绿/灰度/滚动对比”，避免用户读起来像重复题。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/distributed/sentinel-flow-control.md` | 主体正确，Sentinel 细节可加强 | P1 | QPS、并发线程数、调用关系、快速失败/排队/预热都提到了。建议补直接/关联/链路流控、Warm Up 和匀速排队的适用场景、热点参数限流与普通流控区别、规则持久化、集群流控。后半段 MQ 模板应删除，重复 `图解提示` 合并。 |
| 2 | `content/questions/distributed/service-discovery.md` | 详细讲解较好，模板段拖后腿 | P2 | 注册、发现、客户端/服务端发现、健康检查、本地缓存、优雅下线讲得比较完整。建议补和 `nacos-service-discovery` 的差异：本题讲通用模型，Nacos 题讲 Nacos 细节。`实战落地` 的 Broker/死信/重放模板不适合，图解节点 `选择一个实…` 截断。 |
| 3 | `content/questions/distributed/service-mesh.md` | 概念正确，但架构分层不足 | P1 | Sidecar、流量治理、观测、安全、语言无关和复杂度都讲到了。建议补 Data Plane / Control Plane、Envoy/Istio、mTLS、流量劫持、策略下发、sidecar 资源开销、排障复杂度，以及和 API Gateway、SDK 治理的区别。实战段仍套 MQ 链路。 |
| 4 | `content/questions/distributed/spring-cloud-gateway-route.md` | 基础正确，框架机制可更具体 | P1 | Route/Predicate/Filter 三个核心概念讲得准确。建议补 `lb://serviceId`、Path/Host/Header/Method predicate、StripPrefix/RewritePath、GatewayFilter 与 GlobalFilter、过滤器顺序、Actuator 查看路由、路由未命中和路径改写排查。重复 `图解提示` 和 MQ 模板需要清理。 |
| 5 | `content/questions/distributed/tcc-transaction.md` | 核心正确，但高阶追问缺口明显 | P1 | Try/Confirm/Cancel 和资源预留方向正确。必须补 TCC 三大坑：空回滚、幂等、悬挂；还要讲 Try 不能直接完成最终业务，Confirm/Cancel 要可重试，事务状态表如何防重复执行。`常见追问` 过浅，图解节点 `释…` 截断，重复图解需合并。 |
| 6 | `content/questions/distributed/trace-id.md` | 基础正确，链路追踪体系可补强 | P1 | TraceId 的作用、HTTP/RPC/MQ 传递、spanId/parentId 已提到，方向正确。建议补 MDC、异步线程上下文传递、采样、Baggage、日志/指标/Trace 三者关联、TraceId 泄露和伪造风险。当前 `实战落地` 自身又用 TraceId 交叉验证，表达重复；图解节点 `找…` 截断。 |
| 7 | `content/questions/engineering/blue-green-canary.md` | 概念准确，但和下一题重叠 | P2 | 金丝雀是灰度发布的一种，这个结论正确。建议进一步区分“按实例金丝雀”和“按用户/租户/比例灰度”，补自动化判定指标、停止放量条件和回滚动作。与 `blue-green-gray.md` 高度相邻，建议把本题重点固定在金丝雀和灰度关系上。 |
| 8 | `content/questions/engineering/blue-green-gray.md` | 主体质量较好 | P2 | 蓝绿、灰度、滚动的对比准确，风险控制、资源成本、回滚速度都覆盖到了。建议补数据库兼容变更的 expand/contract 思路、消息格式兼容、新旧版本共存时间窗口、蓝绿切流前后的健康检查。和上一题要做内容去重。 |
| 9 | `content/questions/engineering/ci-cd.md` | 质量较好，可直接作为基础稿 | P2 | CI、持续交付、持续部署、不可变制品、质量门禁、回滚和权限边界讲得清楚。建议把 `追问准备` 中“数据量或并发量扩大 10 倍”换成 CI/CD 专项追问：流水线慢怎么办、质量门禁怎么设、生产审批怎么做、数据库变更如何进流水线。 |
| 10 | `content/questions/engineering/docker-basic.md` | 内容扎实，少量追问可更专项 | P2 | 环境一致性、镜像/容器、namespace/cgroups、Docker 不是虚拟机、volume、日志、JVM 参数都讲得不错。建议补多阶段构建、最小基础镜像、镜像扫描、非 root 运行、Compose 不适合大规模生产编排。`追问准备` 仍偏泛，可改为 Docker 专项追问。 |

## 优先修复建议

1. 先修 P1 分布式题：Sentinel 流控、Service Mesh、Gateway 路由、TCC、TraceId 都需要专项机制和追问补强。
2. 清理 `sentinel-flow-control`、`spring-cloud-gateway-route`、`tcc-transaction` 的重复 `图解提示`，并修正 `trace-id`、`service-discovery`、`tcc-transaction` 的截断节点。
3. 工程化题可以先不大改正文，优先把 `追问准备` 从泛化的“10 倍数据量/服务日志”改成工程专项追问。
4. 对 `blue-green-canary` 和 `blue-green-gray` 做内容分工：前者讲金丝雀与灰度关系，后者讲蓝绿、灰度、滚动发布策略对比。
5. 继续沿用当前审查口径：主体正确但模板污染严重的题，不急着全文重写，先记录专项修复点，后续可按 P1 批量生成新 MD。
