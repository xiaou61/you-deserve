---
title: "日志和链路追踪怎么设计？"
slug: "logging-tracing"
category: "工程化"
tags: ["日志", "链路追踪", "traceId", "项目"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "项目高频"
order: 1330
summary: "理解日志级别、traceId、结构化日志和跨服务问题定位。"
---

## 一句话结论

日志用于记录关键事件和异常，链路追踪用 traceId 串起一次请求经过的多个服务，帮助快速定位问题。

## 通俗解释

日志像每个部门自己的工作记录。traceId 像同一个订单号，让你能把前台、仓库、配送的记录串起来看。

## 面试回答

设计要点：

- 区分 debug、info、warn、error 级别。
- 请求入口生成 traceId，并在服务间透传。
- 日志包含时间、traceId、用户/业务标识、接口、耗时、异常。
- 关键业务节点打 info，异常打 error，可预期业务失败不要滥用 error。
- 线上日志要能按 traceId 检索。

微服务场景还可以接入 OpenTelemetry、SkyWalking、Zipkin 等链路追踪系统。

## 常见追问

### 为什么不能到处打 error？

会造成告警噪音，让真正严重问题被淹没。

### traceId 放在哪里传递？

常见放在 HTTP header、RPC metadata 或消息体属性中。

## 易错点

- 不要日志里打印密码、Token 等敏感信息。
- 不要只有异常日志，没有关键业务日志。
- 不要没有 traceId。

## 记忆钩子

**日志是记录，traceId 是线，把一次请求串起来。**
