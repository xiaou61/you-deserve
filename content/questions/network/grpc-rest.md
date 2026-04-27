---
title: "gRPC 和 REST 有什么区别？"
slug: "grpc-rest"
category: "计算机网络"
tags: ["gRPC", "REST", "HTTP", "RPC"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "架构选型"
order: 2660
summary: "REST 更贴近资源和 HTTP 语义，gRPC 基于接口契约和二进制协议，更适合高性能服务间调用。"
---

## 一句话结论

REST 更强调资源和 HTTP 语义，通用性好；gRPC 基于接口契约和二进制序列化，性能更高，更适合服务间调用。

## 通俗解释

REST 像公开服务窗口，大家按统一规则办事；gRPC 像内部专线电话，双方约好接口，沟通更快。

## 面试回答

对比维度：

- 协议风格：REST 常用 HTTP + JSON，gRPC 常用 HTTP/2 + Protobuf。
- 可读性：JSON 更易读，Protobuf 更紧凑。
- 性能：gRPC 序列化体积小，适合高性能内部调用。
- 契约：gRPC 通过 proto 文件定义接口。
- 浏览器支持：REST 更天然适合前端直接调用。

对外开放 API 常用 REST，内部微服务高性能调用可以考虑 gRPC。

## 常见追问

### gRPC 一定比 REST 好吗？

不是。它更适合内部服务间通信，对外开放和调试友好性 REST 更常见。

### Protobuf 有什么优点？

体积小、序列化快、接口契约明确，但可读性不如 JSON。

## 易错点

- 技术选型不要只看性能。
- gRPC 调试和网关适配成本更高。
- REST 设计好也能支撑大多数业务。

## 记忆钩子

**REST 是公开窗口，gRPC 是内部专线。**
