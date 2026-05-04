# 题目质检 Batch 29：项目 API 与治理设计 281-290

审查时间：2026-05-04  
范围：按文件路径排序后的第 281-290 道题，`content/questions/project/api-compatibility.md` 至 `content/questions/project/coupon-anti-abuse.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批全部是项目设计题，覆盖接口兼容、幂等、签名、版本、审计日志、防篡改、灰度监控、容量规划、评论系统和优惠券防刷。`api-idempotency.md` 的正文最好，能把重复请求、幂等键、唯一索引、防重表和状态机讲清；其余题多为“方向正确但方案不够落地”，需要补数据结构、状态机、约束、回滚、监控指标和安全边界。

- 9 篇命中通用详解模板：除 `api-idempotency.md` 外，其余均有模板化段落。
- 5 篇存在重复 `## 图解提示`：`api-compatibility.md`、`audit-log-tamper-proof.md`、`canary-monitoring.md`、`capacity-planning.md`、`coupon-anti-abuse.md`。
- 图解节点截断明显：`新增字段通常比删除或改名...`、`业务指标包括下单、支付...`、`峰值流量...`、`手机号...`，项目题图解需要流程和决策点，不适合只放短标签。
- 本批共性问题是缺“验收口径”：多数答案说了要灰度、签名、审计、限流，但没讲如何验证有效、如何回滚、如何防误伤、如何持续治理。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/project/api-compatibility.md` | 方向正确，兼容策略不够细 | P1 | “只增不破坏、灰度、版本管理、契约测试”正确，但正文模板化，重复 `## 图解提示`。建议补 tolerant reader、字段默认值、枚举新增风险、必填改可选/可选改必填差异、消费者驱动契约测试、线上调用方分析、双写双读灰度、弃用公告和下线窗口。 |
| 2 | `content/questions/project/api-idempotency.md` | 正文质量较好 | P2 | 幂等键、重复请求场景、唯一索引、防重表、状态机、Redis setnx 和消息消费都讲得比较扎实。建议补 in-progress 状态、防并发穿透、幂等结果缓存、幂等键 TTL、请求参数摘要校验、数据库唯一约束兜底，以及支付/发券/消息消费各自的差异化设计。 |
| 3 | `content/questions/project/api-signature.md` | 方向正确，签名规范不足 | P1 | appId、timestamp、nonce、sign、防篡改和防重放方向正确。建议补 canonical string：HTTP method、path、query 排序、body hash、timestamp、nonce；补 HMAC-SHA256/RSA 选择、nonce 存储和过期、时钟偏移、密钥轮换、签名覆盖范围、错误码、前端 secret 不能暴露、签名不能替代 HTTPS。 |
| 4 | `content/questions/project/api-versioning.md` | 方向正确，下线策略不足 | P2 | URL/Header/参数版本、新增字段优先、重大变更提供新版本，这些正确。建议补版本策略和兼容策略分工：小改保持兼容，大改走新版本；补 `Sunset`/弃用公告、老版本调用量监控、SDK/文档同步、灰度路由、客户端能力协商、服务端多版本代码收敛计划。 |
| 5 | `content/questions/project/audit-log-tamper-proof.md` | 方向正确，可信链路不足 | P1 | 追加写、权限隔离、签名链、外部归档方向正确，但正文模板化且重复 `## 图解提示`。建议补哈希链：当前记录 hash 包含上一条 hash；补 KMS/HSM 签名、WORM/Object Lock 存储、独立审计库、时间戳可信来源、职责分离、定期校验任务、补偿重放和审计查询留痕。 |
| 6 | `content/questions/project/audit-log.md` | 方向正确，字段和可靠性不足 | P1 | “谁在什么时间对什么对象做了什么”正确，也提到脱敏。建议补 before/after diff、traceId/requestId、租户、来源 IP、UA、操作入口、结果码、失败原因、数据版本；补同步/异步取舍、本地消息表、失败补偿、日志保留策略、敏感字段脱敏和查询权限控制。 |
| 7 | `content/questions/project/canary-monitoring.md` | 方向正确，灰度判定不够工程化 | P1 | 技术指标、业务指标、灰度组和基线组对比、自动熔断方向正确，但正文模板化且重复 `## 图解提示`。建议补灰度比例阶梯、样本量、错误预算、P95/P99、5xx、依赖错误、资源水位、核心漏斗、告警阈值、自动回滚条件、人工卡点、Feature Flag 和按用户/地域/租户切流。 |
| 8 | `content/questions/project/capacity-planning.md` | 方向正确，计算模型不足 | P1 | 峰值、单机能力、冗余系数、扩容时间这些方向正确，但正文模板化且重复 `## 图解提示`。建议补容量公式：目标峰值 QPS / 单实例安全 QPS * 冗余系数；补压测水位、P99、CPU/内存/IO/连接数、DB/缓存/队列瓶颈、N+1 容灾、扩容耗时、增长预测、限流降级和容量复盘。 |
| 9 | `content/questions/project/comment-system.md` | 方向正确，热点和审核不足 | P2 | 评论表、父评论 ID、二级回复、分页、点赞数/回复数冗余、敏感词、软删除方向正确。建议补楼中楼数据模型、游标分页、热评排序、计数一致性、审核队列、反垃圾、用户拉黑、删除占位、内容索引、消息通知、热门内容缓存和大 V 热点评论分片。 |
| 10 | `content/questions/project/coupon-anti-abuse.md` | 方向正确，风控和核销闭环不足 | P1 | 多维限频、风险评分、库存原子扣减、唯一约束、核销再校验方向正确，但正文模板化且重复 `## 图解提示`。建议补活动资格、用户/设备/IP/手机号/支付账户多维度、Redis Lua 或数据库扣减兜底、领券记录唯一键、券状态机、核销幂等、黑产代理池、误伤申诉、审计日志和策略效果指标。 |

## 优先修复建议

1. 先修 5 篇重复 `## 图解提示`，项目设计题图解应画“请求 -> 校验 -> 状态/约束 -> 补偿/回滚 -> 监控”的闭环。
2. API 设计题统一补契约和生命周期：兼容、版本、签名、幂等都要有字段规范、灰度、监控和下线策略。
3. 审计日志两题要区分：`audit-log.md` 讲采集字段和可靠写入，`audit-log-tamper-proof.md` 讲可信存储、哈希链和验证。
4. 灰度、容量、优惠券防刷都要补量化指标，否则答案像口号。每题至少给出一个计算公式或判定阈值。
5. 安全/风控相关题必须补误伤、密钥、重放、审计和回滚，不能只写限流、验证码、签名这些单点能力。
