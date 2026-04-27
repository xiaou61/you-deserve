---
title: "WebSocket 和 HTTP 有什么区别？"
slug: "websocket-http"
category: "计算机网络"
tags: ["WebSocket", "HTTP", "实时通信", "网络"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "项目追问"
order: 2160
summary: "WebSocket 建立连接后支持全双工通信，适合实时聊天、通知、行情等场景。"
---

## 一句话结论

HTTP 通常是客户端请求、服务端响应；WebSocket 建立连接后支持客户端和服务端双向实时通信。

## 通俗解释

HTTP 像你每次有事都打电话问一句；WebSocket 像双方一直开着语音通话，有消息就直接说。

## 面试回答

WebSocket 特点：

- 通过 HTTP 握手升级连接。
- 建立后保持长连接。
- 支持全双工通信。
- 适合实时聊天、在线通知、实时行情、协同编辑等场景。

HTTP 更适合普通请求响应模型。WebSocket 更适合服务端主动推送和低延迟双向通信。

## 常见追问

### WebSocket 一定比 HTTP 好吗？

不是。普通 CRUD 接口用 HTTP 更简单，WebSocket 适合实时性强的场景。

### WebSocket 怎么做心跳？

客户端和服务端定期发送 ping/pong 或业务心跳，检测连接是否还活着。

## 易错点

- WebSocket 不是替代所有 HTTP 接口。
- 长连接要考虑心跳、断线重连和连接数压力。
- 服务端要做鉴权和连接清理。

## 记忆钩子

**HTTP 是问一句答一句，WebSocket 是电话一直通着。**
