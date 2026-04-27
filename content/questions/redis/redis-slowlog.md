---
title: "Redis SlowLog 怎么用？"
slug: "redis-slowlog"
category: "Redis"
tags: ["Redis", "SlowLog", "慢查询", "排查"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "线上排查"
order: 2550
summary: "Redis SlowLog 记录执行时间超过阈值的命令，用于排查慢命令和不合理访问模式。"
---

## 一句话结论

Redis SlowLog 用来记录执行时间超过阈值的命令，帮助定位慢命令、大 key 操作和不合理访问模式。

## 通俗解释

SlowLog 像收银台的慢单记录。哪笔结账耗时太久，就记下来方便复盘。

## 面试回答

SlowLog 记录的是 Redis 命令执行耗时，不包含网络传输和客户端排队时间。

常用命令：

- `SLOWLOG GET`：查看慢日志。
- `SLOWLOG LEN`：查看慢日志数量。
- `SLOWLOG RESET`：清空慢日志。

通过 SlowLog 可以发现大范围扫描、大 key 删除、复杂集合操作等问题。

## 常见追问

### SlowLog 没记录就说明请求不慢吗？

不一定。网络延迟、客户端连接池等待、Redis 排队等待不一定体现在命令执行耗时里。

### 发现慢命令怎么办？

分析命令类型、key 大小、访问频率，必要时拆 key、改结构、分批处理。

## 易错点

- SlowLog 不包含网络耗时。
- 不要生产环境频繁执行高风险命令。
- 慢查询要结合延迟监控和客户端日志分析。

## 记忆钩子

**SlowLog 记的是 Redis 自己执行慢的单。**
