---
title: "Redis Cluster 的 hash slot 怎么理解？"
slug: "redis-cluster-hash-slot"
category: "Redis"
tags: ["Redis", "Cluster", "hash slot", "分片"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "缓存进阶"
order: 3380
summary: "Redis Cluster 把 key 映射到 16384 个槽，再把槽分配给不同节点，实现数据分片。"
---

## 一句话结论

Redis Cluster 不是直接把 key 分给节点，而是先把 key 映射到 16384 个 hash slot，再由槽映射到节点。

## 通俗解释

它像快递分拣先分到 16384 个格口，再把一批格口交给不同快递员负责，而不是每个包裹临时找快递员。

## 面试回答

Redis Cluster 的基本思路：

- 对 key 计算 CRC16，再对 16384 取模得到槽位。
- 每个主节点负责一部分槽。
- 客户端根据槽位找到对应节点。
- 节点迁移时，本质上是迁移槽。
- 如果访问错节点，会返回 MOVED 或 ASK 重定向。

hash slot 让集群扩缩容更容易，因为迁移单位是槽，而不是逐个 key 手工指定节点。

## 常见追问

### 为什么多 key 操作可能受限制？

如果多个 key 不在同一个槽，跨节点原子操作就困难。可以用 hash tag 让相关 key 落到同一个槽。

### MOVED 和 ASK 有什么区别？

MOVED 表示槽已经迁到新节点，客户端应更新路由；ASK 多用于迁移过程中的临时重定向。

## 易错点

- 不要说 Redis Cluster 是一致性哈希。
- 多 key 操作要关注是否同槽。
- 槽迁移期间要理解重定向。

## 记忆钩子

**Redis Cluster 先分槽，再分节点。**

## 图解提示

适合画结构图：key -> CRC16 -> slot -> 节点 A/B/C，展示槽迁移。
