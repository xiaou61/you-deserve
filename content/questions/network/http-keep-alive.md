---
title: "HTTP Keep-Alive 是什么？"
slug: "http-keep-alive"
category: "计算机网络"
tags: ["HTTP", "Keep-Alive", "连接复用", "网络"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "一面/二面高频"
order: 2650
summary: "Keep-Alive 让多个 HTTP 请求复用同一个 TCP 连接，减少建连和挥手成本。"
---

## 一句话结论

HTTP Keep-Alive 允许多个请求复用同一个 TCP 连接，减少频繁建立和关闭连接的成本。

## 通俗解释

没有 Keep-Alive 像每问一句都重新打电话；有 Keep-Alive 像电话先不挂，连续问几件事。

## 面试回答

建立 TCP 连接需要三次握手，关闭连接也有成本。如果每个 HTTP 请求都新建连接，会浪费大量时间和资源。

Keep-Alive 通过连接复用减少连接建立成本，提高请求效率。

但连接也不能无限保持，需要设置超时时间、最大请求数等，避免大量空闲连接占用资源。

## 常见追问

### Keep-Alive 和 TCP 长连接一样吗？

HTTP Keep-Alive 是 HTTP 层对 TCP 连接复用的使用方式，底层依赖 TCP 连接保持。

### 长连接有什么风险？

空闲连接太多会占用服务端连接资源，需要合理超时和连接池管理。

## 易错点

- 连接复用不代表永不关闭。
- 客户端连接池也要配置合理。
- HTTP/2 还有多路复用能力，和 Keep-Alive 不完全一样。

## 记忆钩子

**Keep-Alive 是电话先别挂，连续聊几句。**
