# 题目质检 Batch 33：项目稳定性与 Redis 缓存 321-330

审查时间：2026-05-04  
范围：按文件路径排序后的第 321-330 道题，`content/questions/project/seckill-design.md` 至 `content/questions/redis/cache-db-consistency.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批从项目收尾过渡到 Redis 缓存，覆盖秒杀、敏感数据脱敏、SLO/SLI、SSO、Webhook、Bitmap/HyperLogLog、Bloom Filter、Cache Aside、缓存击穿和缓存/数据库一致性。`seckill-design.md`、`bloom-filter.md`、`cache-db-consistency.md` 的正文质量较好；SLO、SSO、Webhook、脱敏和缓存击穿这些题方向正确，但缺真实参数、协议流、失败重试和指标闭环。

- 7 篇命中通用详解模板：`sensitive-data-masking.md`、`slo-sli-error-budget.md`、`sso-design.md`、`webhook-design.md`、`bitmap-hyperloglog.md`、`cache-aside.md`、`cache-breakdown-mutex.md`。
- 5 篇存在重复 `## 图解提示`：`sensitive-data-masking.md`、`slo-sli-error-budget.md`、`sso-design.md`、`webhook-design.md`、`cache-breakdown-mutex.md`。
- 图解节点截断集中在 SSO/Webhook/缓存：`Token...`、`事件 ID...`、`允许不可用...`、`重建缓存...`。
- Redis 题要补命令和参数，项目稳定性题要补指标窗口和治理动作，这是本批优先级最高的问题。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/project/seckill-design.md` | 正文质量较好 | P2 | 入口削峰、资格校验、Redis 库存、Lua 原子扣减、防重复、MQ 异步下单和最终一致性讲得比较完整。建议补热点 key 分片、排队令牌、活动开关、库存预热、风控、订单超时关闭、库存回补、压测模型和降级策略。 |
| 2 | `content/questions/project/sensitive-data-masking.md` | 方向正确，数据分级不足 | P1 | 展示脱敏、日志脱敏、导出脱敏、存储加密、传输加密方向正确，但正文模板化且重复 `## 图解提示`。建议补数据分级、字段级策略、动态脱敏、不可逆脱敏和可逆加密区别、KMS/密钥轮换、Tokenization、日志采集链路脱敏、导出审批、脱敏绕过审计和测试数据脱敏。 |
| 3 | `content/questions/project/slo-sli-error-budget.md` | 方向正确，错误预算计算不足 | P1 | SLI 是指标、SLO 是目标、错误预算是允许失败空间，这些正确，但正文模板化且重复 `## 图解提示`。建议补窗口期、可用性/延迟/正确性 SLI、99.9% 月度预算如何换算、burn rate、错误预算耗尽后的发布冻结、告警阈值、用户视角指标和 SLO 复盘。 |
| 4 | `content/questions/project/sso-design.md` | 方向正确，协议和退出不足 | P1 | 统一认证中心、票据/Token、多系统信任方向正确，但正文模板化且重复 `## 图解提示`。建议补 CAS/OIDC 两种典型实现、redirect_uri、state、防 CSRF、票据一次性、Cookie 域、Token 校验、单点退出、会话续期、MFA、跨域和移动端差异。 |
| 5 | `content/questions/project/webhook-design.md` | 方向正确，投递可靠性不足 | P1 | 签名、重试、幂等、订阅管理和投递状态方向正确，但重复 `## 图解提示`。建议补 eventId、timestamp、HMAC 签名、订阅事件类型、指数退避、最大重试次数、死信、投递日志、手动重放、幂等接收、顺序性限制、订阅方验签文档和调试控制台。 |
| 6 | `content/questions/redis/bitmap-hyperloglog.md` | 方向正确，命令和误差不足 | P2 | Bitmap 适合布尔状态，HyperLogLog 适合大规模去重计数但有误差，这个核心正确。建议补 `SETBIT`、`GETBIT`、`BITCOUNT`、`PFADD`、`PFCOUNT`、`PFMERGE`；补 HLL 不能拿具体用户、误差范围、Bitmap 稀疏 ID 可能浪费空间和按日期分 key 的设计。 |
| 7 | `content/questions/redis/bloom-filter.md` | 正文质量较好 | P2 | 位数组、多哈希、可能存在/一定不存在、误判不漏判、缓存穿透和计数布隆过滤器讲得较好。建议补容量和误判率参数、数据量超过预期误判率上升、RedisBloom、删除风险、重建策略、布隆过滤器误判后还要查缓存/数据库兜底。 |
| 8 | `content/questions/redis/cache-aside.md` | 方向正确，竞态窗口不足 | P1 | 读缓存、未命中查库回填、写时更新数据库再删除缓存方向正确。但正文模板化。建议补删除失败重试、延迟双删、binlog 订阅删缓存、缓存空值、热点 key 重建保护、读从库导致旧值回填、强一致场景不适合单纯 Cache Aside。 |
| 9 | `content/questions/redis/cache-breakdown-mutex.md` | 方向正确，锁细节不足 | P1 | 热点 key 过期瞬间大量回源，互斥锁只让一个请求重建缓存，这个核心正确。但正文模板化且重复 `## 图解提示`。建议补双重检查、锁过期时间、锁续期、获取锁失败的等待/降级、逻辑过期返回旧值、热点 key 永不过期 + 异步刷新、空值缓存和数据库保护。 |
| 10 | `content/questions/redis/cache-db-consistency.md` | 正文质量较好 | P2 | Cache Aside、先更库再删缓存、并发窗口、补偿措施和一致性等级讲得比较好。建议补删除缓存失败的可靠队列、binlog 驱动失效、延迟双删的适用边界、缓存重建互斥、读写主从延迟影响、哪些资金/库存场景不能接受最终一致。 |

## 优先修复建议

1. 先修 5 篇重复 `## 图解提示`，SLO、SSO、Webhook 和缓存击穿都适合画时序图。
2. SLO、告警疲劳、Runbook、故障复盘应合并出一套稳定性术语：SLI、SLO、错误预算、burn rate、告警分级、复盘 action。
3. SSO/OAuth/JWT 要统一认证授权边界，补 state、nonce、PKCE、Cookie、Token 生命周期和退出。
4. Redis 缓存题要补命令、参数和竞态窗口，不要只说“加互斥锁、删缓存、加布隆过滤器”。
5. 敏感数据脱敏要纳入安全体系，和审计日志、文件上传、导出权限联动修。
