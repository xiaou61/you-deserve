---
title: "HTTP 缓存机制怎么理解？"
slug: "http-cache"
category: "计算机网络"
tags: ["HTTP", "缓存", "浏览器", "网络"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "一面/前后端联调"
order: 2130
summary: "HTTP 缓存分强缓存和协商缓存，通过 Cache-Control、ETag、Last-Modified 等头控制。"
---

## 一句话结论

HTTP 缓存主要分强缓存和协商缓存，常见响应头有 `Cache-Control`、`Expires`、`ETag`、`Last-Modified`。

## 通俗解释

强缓存像冰箱里还有饭，直接吃不用问；协商缓存像先问店家“昨天那份菜单还一样吗”，一样就不用重新拿。

## 面试回答

强缓存：

- 浏览器判断本地缓存没过期，直接使用缓存。
- 常见头：`Cache-Control`、`Expires`。

协商缓存：

- 缓存过期后，浏览器向服务器确认资源是否变化。
- 常见头：`ETag`、`If-None-Match`、`Last-Modified`、`If-Modified-Since`。
- 如果没变化，服务器返回 304，浏览器继续用本地缓存。

静态资源通常可以用长缓存加文件 hash；接口数据要谨慎设置缓存策略。

## 常见追问

### ETag 和 Last-Modified 有什么区别？

ETag 基于资源标识判断变化，通常更精确；Last-Modified 基于修改时间，精度可能不够。

### 为什么静态资源文件名要带 hash？

文件内容变化后 hash 变化，浏览器会请求新资源；内容不变则可以长期缓存。

## 易错点

- 不要把所有接口都强缓存。
- 304 不是错误，是协商缓存命中。
- Cache-Control 优先级通常高于 Expires。

## 记忆钩子

**强缓存不问，协商缓存先问。**
