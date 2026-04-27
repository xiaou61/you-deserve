---
title: "跨域 CORS 是什么？"
slug: "cors"
category: "计算机网络"
tags: ["HTTP", "CORS", "跨域", "浏览器"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "前后端联调高频"
order: 2140
summary: "CORS 是浏览器的跨域资源共享机制，通过响应头决定某个跨源请求是否允许。"
---

## 一句话结论

CORS 是浏览器的跨域资源共享机制，服务端通过响应头告诉浏览器哪些来源、方法和请求头被允许。

## 通俗解释

浏览器像小区门卫。外来请求想进来，服务端要提前告诉门卫“这个来源可以进”，否则浏览器会拦住。

## 面试回答

CORS 主要由浏览器执行限制，服务端通过响应头配合：

- `Access-Control-Allow-Origin`：允许哪些来源。
- `Access-Control-Allow-Methods`：允许哪些方法。
- `Access-Control-Allow-Headers`：允许哪些请求头。
- `Access-Control-Allow-Credentials`：是否允许携带凭证。

复杂请求前，浏览器会先发送 OPTIONS 预检请求，确认服务端允许后才发送真实请求。

## 常见追问

### CORS 是服务器拦截还是浏览器拦截？

主要是浏览器安全策略。服务端可能已经返回了响应，但浏览器不允许前端代码读取。

### 为什么带 Cookie 时不能随便写 *？

携带凭证时 `Access-Control-Allow-Origin` 不能简单使用 `*`，需要明确允许的来源。

## 易错点

- 跨域是浏览器限制，不是 HTTP 本身不能请求。
- 预检请求失败时真实请求不会发出。
- 后端放开跨域要谨慎，不要生产环境无脑全放开。

## 记忆钩子

**CORS 是浏览器门卫，服务端给放行名单。**
