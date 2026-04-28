# 300 题体系化扩展记录

## 本轮目标

把题库从 251 道补到 300 道，并优先补齐真实上线和中高级项目面试会追问的内容。

本轮不追求散装堆题，而是围绕“能讲项目、能讲微服务、能讲线上排障”扩展。

## 新增方向

### 微服务治理

新增 Spring Cloud Gateway、Nacos、Sentinel、Dubbo、Seata、RPC 序列化、fencing token 等内容。

目标是让项目从“单体 CRUD”升级到“服务拆分后怎么治理”。

### 上线部署与线上排障

新增 K8s 探针、ConfigMap/Secret、Ingress、Docker 多阶段构建、CPU/内存/磁盘/网络排障、Prometheus/Grafana、可观测性三件套。

目标是让项目经历听起来像真的上线过、排查过、监控过。

### 登录鉴权与安全合规

新增 OAuth2/OIDC、SSO、网关鉴权、敏感数据脱敏。

目标是补齐登录系统、安全边界和权限设计的追问。

### 搜索、同步与项目工程能力

新增 DB 到 ES 同步、binlog/MQ 数据同步、压测、对象存储、多租户隔离、搜索联想词。

目标是让项目设计从功能点进入工程方案。

### 数据库、缓存、MQ、JVM 进阶

新增 MySQL 分区、冷热归档、不可见索引、直方图、连接池、读写分离延迟；Redis 预热、互斥锁防击穿、Cluster 槽、GEO；Kafka 事务、分区选择、消费者背压、延迟退避；GC 日志、G1、JFR。

目标是把中间件回答从“会用”推进到“能排障、能取舍”。

## 图解化准备

本轮 49 道新增题都增加了 `图解提示` 小节，后续批量生图时可以直接抽取：

- 流程图：网关路由、限流、数据同步、压测、Linux 排障。
- 结构图：Redis Cluster 槽、K8s Ingress、连接池、G1 Region。
- 对比图：OAuth2/OIDC、ConfigMap/Secret、正向代理/反向代理。
- 时序图：SSO、Seata AT、Kafka 事务、缓存击穿互斥锁。
- 场景图：对象存储、多租户隔离、搜索联想词。

## 验收标准

- 题库总数达到 300 道。
- 所有题目 frontmatter 必填字段完整。
- slug 不重复。
- `npm run lint` 通过。
- `npm run build` 通过。

## 后续建议

下一阶段不要继续只加题，建议先做“图解元数据标准化”：

1. 给 Markdown frontmatter 增加可选字段：`visualType`、`visualTitle`、`visualPrompt`。
2. 先从 30 道最高频题试点生成图解。
3. 题目详情页增加“图解秒懂”区域。
4. 抽检手机端可读性。
5. 再批量覆盖全部 300 道题。
