---
title: "Redis Cluster 的 MOVED 和 ASK 是什么？"
slug: "redis-cluster-moved-ask"
category: "Redis"
tags: ["Redis", "Cluster", "MOVED", "ASK"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "二面加分"
order: 2560
summary: "MOVED 表示槽已永久迁移到新节点，ASK 表示槽正在迁移中，需要临时去目标节点请求。"
---

## 一句话结论

MOVED 表示 key 所属槽已经迁移到别的节点，客户端应更新路由；ASK 表示槽正在迁移中，客户端临时去目标节点访问一次。

## 通俗解释

MOVED 像办公室已经永久搬家，要更新通讯录；ASK 像搬家中，临时让你去新办公室问一次。

## 面试回答

Redis Cluster 通过 16384 个槽分布数据。客户端根据 key 计算槽，再访问对应节点。

当访问错节点时：

- MOVED：槽已经归属新节点，客户端需要更新本地槽路由缓存。
- ASK：槽迁移过程中，客户端按提示临时访问目标节点，但不应立即永久更新槽映射。

成熟客户端通常会自动处理这类重定向。

## 常见追问

### 为什么需要槽？

槽让数据迁移和节点扩缩容更容易，移动槽即可，不需要逐个管理所有 key。

### MOVED 和 ASK 最大区别？

MOVED 是永久重定向，ASK 是迁移过程中的临时重定向。

## 易错点

- 不要把 MOVED 和 ASK 混为一谈。
- 客户端需要支持 Cluster 协议。
- 跨槽多 key 操作会受到限制。

## 记忆钩子

**MOVED 是永久搬家，ASK 是搬家中临时问路。**
