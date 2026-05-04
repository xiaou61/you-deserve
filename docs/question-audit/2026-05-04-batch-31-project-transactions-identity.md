# 题目质检 Batch 31：交易库存、身份认证与多地域 301-310

审查时间：2026-05-04  
范围：按文件路径排序后的第 301-310 道题，`content/questions/project/incident-review.md` 至 `content/questions/project/order-state-machine.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批覆盖故障复盘、库存扣减、库存预占、分布式任务调度、JWT、多地域灾备/多活、多租户、通知系统、OAuth2/OIDC 和订单状态机。`jwt-login.md` 的正文相对扎实，能讲 Header/Payload/Signature、泄露风险、短 token + refresh token 和主动失效；其余题方向基本正确，但普遍缺状态机、时序图、故障演练、幂等补偿和安全边界。

- 9 篇命中通用详解模板：除 `jwt-login.md` 外，其余均有模板化段落。
- 6 篇存在重复 `## 图解提示`：`incident-review.md`、`inventory-reservation.md`、`job-scheduler-design.md`、`multi-region-disaster-recovery.md`、`multi-tenant-isolation.md`、`oauth2-oidc.md`。
- 图解节点截断集中在交易和身份题：`恢复的完整时间线...`、`cron...`、`多地域...`、`OAuth2 常见角色有...`。
- 这一批项目题最需要补“状态转换和失败处理”：库存、订单、任务调度、通知和认证都不能只说组件，要讲重复、超时、回滚、补偿和审计。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/project/incident-review.md` | 方向正确，复盘模板不足 | P1 | 时间线、根因、改进项 owner、沉淀到监控和 Runbook 方向正确，但正文模板化且重复 `## 图解提示`。建议补影响范围、SLA/SLO 损失、发现方式、止血动作、恢复动作、根因和促成因素、无责复盘、行动项验收、回访时间、复盘后如何验证监控和演练生效。 |
| 2 | `content/questions/project/inventory-deduction.md` | 方向正确，扣减链路可更细 | P1 | 数据库条件扣减、Redis 预扣、MQ 削峰、幂等和补偿方向正确。建议补 `update stock set available=available-? where sku_id=? and available>=?` 的强一致兜底；补 Redis Lua 原子扣减、异步订单创建失败回补、库存流水、超卖/少卖取舍、热点 SKU 分片、下单扣/支付扣/预占扣的适用场景。 |
| 3 | `content/questions/project/inventory-reservation.md` | 方向正确，状态机不足 | P1 | 预占库存、支付确认、取消释放、唯一约束和补偿方向正确，但正文模板化且重复 `## 图解提示`。建议补 reservation 表、状态：reserved/confirmed/released/expired；补过期时间、延迟任务或定时扫描释放、支付回调和超时取消竞态、幂等键、库存流水、人工补偿和对账。 |
| 4 | `content/questions/project/job-scheduler-design.md` | 方向正确，调度一致性不足 | P1 | 任务定义、触发、分片、锁、重试、监控和补偿方向正确，但重复 `## 图解提示`。建议补调度中心和执行器心跳、任务租约、leader 选举、misfire 策略、分片广播、任务幂等、超时中断、失败重试退避、任务运行日志、DAG 依赖、重复触发和时钟漂移处理。 |
| 5 | `content/questions/project/jwt-login.md` | 正文质量较好 | P2 | JWT 三段结构、Payload 不加密、无状态优势、泄露后难撤销、短过期 + refresh token、黑名单/tokenVersion 都讲到了。建议补 `iss`、`aud`、`exp`、`nbf`、`jti`、算法白名单、防 `alg=none`、密钥轮换、Refresh Token 轮换与重放检测、Cookie 场景下 CSRF 与 SameSite。 |
| 6 | `content/questions/project/multi-region-disaster-recovery.md` | 方向正确，RTO/RPO 和演练不足 | P1 | 灾备偏切换，多活多地域同时承载流量，这个区别正确。但正文模板化且重复 `## 图解提示`。建议补 RTO/RPO、同城双活/异地灾备/异地多活分层、DNS/GSLB 流量调度、数据复制延迟、冲突解决、单元化、故障演练、切回方案和成本复杂度。 |
| 7 | `content/questions/project/multi-tenant-isolation.md` | 方向正确，隔离风险不足 | P1 | 共享库共享表、共享库独立表、独立库的取舍正确，但正文模板化且重复 `## 图解提示`。建议补 tenant_id 强制注入、唯一索引包含 tenant_id、缓存 key 带租户、消息/搜索/对象存储也要隔离、租户级限流和配额、数据导出权限、独立库迁移路径、串租户事故检测。 |
| 8 | `content/questions/project/notification-system.md` | 方向正确，投递可靠性不足 | P2 | 模板、渠道、接收人、发送记录、频控、用户偏好方向正确。建议补站内信/短信/邮件/Push 的差异、Outbox/MQ 异步投递、渠道失败重试、死信、幂等发送、去重、退订、模板变量校验、敏感内容脱敏、频控和优先级。 |
| 9 | `content/questions/project/oauth2-oidc.md` | 概念方向正确，协议流不足 | P1 | OAuth2 授权、OIDC 认证、Access Token 与 ID Token 区分正确，但正文模板化且重复 `## 图解提示`。建议补 Authorization Code + PKCE、client、authorization server、resource server、redirect_uri 校验、scope、state、nonce、JWKS、ID Token claims、Token introspection/revocation。 |
| 10 | `content/questions/project/order-state-machine.md` | 方向正确，流转约束可补 | P1 | 状态、事件、流转规则、幂等、并发控制和日志记录方向正确。建议补状态表/枚举、事件表、合法流转矩阵、条件更新 `where status=?`、支付回调和超时取消竞态、退款/售后子状态、状态流转日志、补偿任务和人工操作审计。 |

## 优先修复建议

1. 先修 6 篇重复 `## 图解提示`，交易和认证题应画状态机或时序图，不要只列短标签。
2. 库存扣减、预占和订单状态机要统一一套状态词：可售、冻结、已扣减、释放、已支付、已取消、退款中。
3. OAuth2/OIDC/JWT 要补安全参数和令牌生命周期：PKCE、state、nonce、JWKS、Refresh Token 轮换、撤销、密钥轮换。
4. 多地域和多租户要补故障演练和隔离验证，不然答案只停在架构名词。
5. 项目治理题统一补 owner、日志、指标、回滚和验收标准，保证能从设计走到运维闭环。
