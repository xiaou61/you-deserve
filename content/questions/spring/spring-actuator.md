---
title: "Spring Boot Actuator 有什么用？"
slug: "spring-boot-actuator"
category: "Spring"
tags: ["Spring Boot", "Actuator", "监控", "运维"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "项目部署追问"
order: 1910
summary: "Actuator 提供健康检查、指标、环境信息等运维端点，方便服务监控和诊断。"
---

## 一句话结论

Spring Boot Actuator 提供一组生产运维端点，用于查看健康状态、指标、配置、环境信息和应用运行情况。

## 通俗解释

Actuator 像汽车仪表盘。它不负责开车，但能告诉你油量、水温、故障灯和发动机状态。

## 面试回答

Actuator 常见用途：

- 健康检查：判断服务是否正常。
- 指标监控：查看 JVM、HTTP 请求、线程、内存等指标。
- 配置信息：辅助排查配置是否生效。
- 应用信息：查看版本、构建信息等。

实际生产环境不能随便暴露所有端点，特别是环境变量、配置、线程 dump 等敏感信息，要配合权限控制和网络隔离。

## 常见追问

### health 端点有什么用？

常用于负载均衡、Kubernetes 或监控系统判断服务是否健康。

### Actuator 有什么安全风险？

如果暴露敏感端点，可能泄露配置、环境变量、内部接口和系统状态。

## 易错点

- 不要把 Actuator 当业务接口。
- 生产环境要限制端点暴露范围。
- 健康检查要轻量，不要写复杂业务逻辑。

## 记忆钩子

**Actuator 是服务仪表盘，看状态，不做业务。**
