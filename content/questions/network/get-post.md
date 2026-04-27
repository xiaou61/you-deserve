---
title: "GET 和 POST 有什么区别？"
slug: "get-post"
category: "计算机网络"
tags: ["HTTP", "GET", "POST", "接口"]
difficulty: "easy"
route: "Java 后端上岸路线"
scene: "一面/项目高频"
order: 1250
summary: "从语义、幂等性、参数位置和缓存理解 GET 与 POST。"
---

## 一句话结论

GET 语义是获取资源，通常幂等、可缓存，参数常在 URL；POST 语义是提交处理，通常用于创建或触发操作，请求体承载数据。

## 通俗解释

GET 像问图书馆“有没有这本书”，POST 像提交一张申请表让系统处理。

## 面试回答

主要区别：

- 语义：GET 获取资源，POST 提交数据。
- 幂等：GET 应该幂等，POST 通常不保证幂等。
- 参数：GET 常放 URL query，POST 常放 body。
- 缓存：GET 更容易被浏览器和代理缓存。
- 长度：GET 受 URL 长度限制更明显。

安全性上，POST 不等于安全，只是参数不直接显示在 URL，仍然需要 HTTPS。

## 常见追问

### GET 能不能带 body？

协议层面没有绝对禁止，但兼容性和语义都不推荐，实际项目不要这样设计。

### POST 一定不幂等吗？

不一定。幂等性是接口语义和服务端实现决定的，比如带幂等键的 POST 也可以做到幂等。

## 易错点

- 不要说 POST 比 GET 天然安全。
- 不要只从参数位置区别。
- 不要忽略语义和幂等性。

## 记忆钩子

**GET 拿资源，POST 交表单；安全靠 HTTPS，不靠方法名。**
