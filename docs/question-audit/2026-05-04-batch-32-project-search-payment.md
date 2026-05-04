# 题目质检 Batch 32：支付、压测、RBAC 与搜索 311-320

审查时间：2026-05-04  
范围：按文件路径排序后的第 311-320 道题，`content/questions/project/oss-file-storage.md` 至 `content/questions/project/search-relevance-ranking.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批覆盖对象存储上传、分页、支付、压测、RBAC、对账、Runbook、搜索联想、站内搜索和搜索相关性。`pagination-design.md` 和 `rbac.md` 的正文质量较好，能把深分页、游标分页、排序稳定、角色权限模型和后端鉴权讲清；支付、对账、Runbook、搜索相关题仍偏“方向列表”，缺少资金状态、指标阈值、倒排索引、排序公式和评估闭环。

- 8 篇命中通用详解模板：除 `pagination-design.md`、`rbac.md` 外，其余均有模板化段落。
- 6 篇存在重复 `## 图解提示`：`oss-file-storage.md`、`payment-system-design.md`、`pressure-testing.md`、`reconciliation-system.md`、`runbook-design.md`、`search-autocomplete.md`、`search-relevance-ranking.md`。
- 图解节点截断集中在业务链路：`临时上传凭证或预...`、`下单、发起支付...`、`dashboard...`、`点击率...`。
- 搜索题普遍缺检索指标，支付/对账题普遍缺资金安全闭环，这是本批最优先修复点。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/project/oss-file-storage.md` | 方向正确，直传安全不足 | P1 | 后端中转、小文件/大文件、临时凭证、上传回调、私有文件临时链接方向正确，但正文模板化且重复 `## 图解提示`。建议补预签名 URL/STS 临时凭证、回调验签、对象 key 生成、元数据落库、ACL、私有桶、CDN 加速、病毒扫描、分片上传、断点续传、上传成功但落库失败的补偿。 |
| 2 | `content/questions/project/pagination-design.md` | 正文质量较好 | P2 | offset 分页、游标分页、深分页成本、稳定排序、重复漏读讲得比较完整。建议补复合游标 `(sort_key, id)`、上一页/下一页 token、防篡改游标、总数统计成本、近似总数、快照一致性和搜索引擎分页的 `search_after` 思路。 |
| 3 | `content/questions/project/payment-system-design.md` | 方向正确，资金状态机不足 | P1 | 幂等、状态机、回调验签、主动查询、每日对账方向正确，但正文模板化且重复 `## 图解提示`。建议补支付单/订单/交易流水的关系，状态：待支付/支付中/成功/失败/关闭/退款中/已退款；补金额校验、第三方流水号唯一约束、回调幂等、主动查单兜底、退款、对账差错和资金安全审计。 |
| 4 | `content/questions/project/pressure-testing.md` | 方向正确，压测模型不足 | P1 | 目标、场景、数据、环境、指标、瓶颈方向正确，但重复 `## 图解提示`。建议补流量模型、阶梯加压、峰值/稳定性/破坏性压测、P95/P99、错误率、资源水位、数据库/缓存/队列瓶颈、生产隔离、影子流量、压测数据清理和容量结论如何落实例数。 |
| 5 | `content/questions/project/rbac.md` | 正文质量较好 | P2 | 用户、角色、权限、多对多表、后端接口鉴权、角色膨胀和数据权限扩展都讲得较好。建议补角色继承、权限粒度、职责分离、临时授权、审批、权限缓存失效、审计日志、租户维度，以及 RBAC 与 ABAC/数据权限组合。 |
| 6 | `content/questions/project/reconciliation-system.md` | 方向正确，差错处理不足 | P1 | 拉账单、标准化、匹配和差错处理方向正确，但模板化且重复 `## 图解提示`。建议补 T+1 对账、渠道账单下载、金额/手续费/状态字段标准化、我方多/对方多/金额不一致/状态不一致、长短款、差错工单、补单/冲正、复核、对账报表和重跑能力。 |
| 7 | `content/questions/project/runbook-design.md` | 方向正确，可执行性不足 | P1 | 故障识别、排查命令、止血动作、回滚路径和升级联系人方向正确，但重复 `## 图解提示`。建议补触发条件、影响范围、关键 dashboard、日志查询、常用命令、风险提示、止血步骤、回滚步骤、验证指标、升级联系人、权限要求和演练记录。 |
| 8 | `content/questions/project/search-autocomplete.md` | 方向正确，召回结构不足 | P1 | 前缀匹配、热度排序、缓存、敏感词过滤方向正确，但模板化且重复 `## 图解提示`。建议补 Trie、ES completion suggester、Redis Sorted Set、前缀缓存、拼音/同义词、运营词、黑名单、实时热度更新、防刷、延迟目标和联想词点击反馈。 |
| 9 | `content/questions/project/search-design.md` | 方向正确，搜索链路可补 | P2 | 数据库 like、倒排索引、ES、字段、匹配方式、排序、同步、权限过滤和降级方向正确。建议补分词器、倒排索引、召回/排序分层、highlight、filter 和 query 区分、索引 mapping、全量构建 + 增量同步、权限过滤前置/后置、搜索服务降级和超时保护。 |
| 10 | `content/questions/project/search-relevance-ranking.md` | 方向正确，评估指标不足 | P1 | 文本匹配、字段权重、业务权重、用户行为信号方向正确，但模板化且重复 `## 图解提示`。建议补 BM25、字段 boost、短语匹配、同义词、拼写纠错、点击率/转化率/新鲜度/库存等业务特征，补离线评估 NDCG/MRR、人工标注、A/B 实验、bad case 分析和反作弊。 |

## 优先修复建议

1. 先修重复 `## 图解提示`，尤其支付、对账、Runbook 和搜索相关性需要画状态机/评估闭环。
2. 支付和对账题要统一资金链路：支付单、交易流水、第三方流水、回调、主动查单、对账、差错处理、退款。
3. 搜索三题要统一搜索链路：召回、排序、评估、反馈，而不是每题各列几个组件。
4. 压测和容量规划题要互相引用，压测结果应该能直接推导容量安全水位和扩容策略。
5. OSS 上传、文件上传和 Excel 导入导出要统一安全模型：直传凭证、回调验签、病毒扫描、对象权限、生命周期清理。
