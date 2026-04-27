---
title: "Redis Pipeline 是什么？适合什么场景？"
slug: "redis-pipeline"
category: "Redis"
tags: ["Redis", "Pipeline", "性能优化", "批量操作"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "项目优化"
order: 1600
summary: "Pipeline 通过批量发送命令减少网络往返次数，适合大量独立命令，但不保证事务语义。"
---

## 一句话结论

Redis Pipeline 可以把多条命令一次性发给 Redis，减少网络往返次数，适合批量写入、批量查询等场景。

## 通俗解释

不用每买一件东西就排一次队，而是把购物车一次推到收银台结账，这样省掉很多来回等待。

## 面试回答

Redis 很快，但客户端和服务端之间有网络往返成本。如果连续执行大量独立命令，每条命令都等响应，会浪费很多时间。

Pipeline 的做法是客户端连续发送多条命令，不必每条都等待返回，最后统一读取结果。

适合：

- 批量写缓存。
- 批量查询多个 key。
- 初始化数据。

但 Pipeline 不是事务，它只是减少网络开销，不保证中间命令失败后自动回滚。

## 常见追问

### Pipeline 和 MGET 有什么区别？

MGET 是 Redis 的一条多 key 命令，Pipeline 是客户端批量发送多条命令的方式。

### Pipeline 越大越好吗？

不是。批量太大可能占用客户端和服务端缓冲区，导致延迟抖动。

## 易错点

- 不要把 Pipeline 当事务。
- 批量大小要控制。
- 命令之间有强依赖时，不适合盲目 Pipeline。

## 记忆钩子

**Pipeline 省的是来回路费，不是事务保险。**
