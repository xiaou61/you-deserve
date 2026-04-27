---
title: "Spring Boot 配置加载优先级怎么理解？"
slug: "spring-boot-configuration-priority"
category: "Spring"
tags: ["Spring Boot", "配置", "Profile", "优先级"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "项目部署追问"
order: 1470
summary: "Spring Boot 配置来源很多，优先级决定同名配置最终谁生效，线上排查要先确认实际配置值。"
---

## 一句话结论

Spring Boot 配置可以来自配置文件、环境变量、命令行参数等多个来源，同名配置按优先级覆盖，最终生效的是优先级更高的值。

## 通俗解释

配置优先级像请假审批。你自己写的便签有用，但如果系统里正式审批写了另一个时间，以正式系统为准。

## 面试回答

Spring Boot 常见配置来源包括：

- `application.yml` 或 `application.properties`。
- 不同环境的 profile 配置，比如 `application-prod.yml`。
- 环境变量。
- JVM 系统属性。
- 命令行参数。
- 配置中心。

线上排查配置问题时，不要只看代码仓库里的 yml 文件。因为容器环境变量、启动参数、配置中心都可能覆盖本地配置。

更稳的做法是查看应用启动日志、Actuator 配置端点或实际运行环境中的配置来源。

## 常见追问

### profile 有什么作用？

profile 用来区分不同环境配置，比如 dev、test、prod，避免所有环境共用一套配置。

### 为什么本地没问题线上有问题？

线上可能有更高优先级配置覆盖了默认值，比如环境变量、启动参数或配置中心。

## 易错点

- 不要只盯着 `application.yml`。
- 不要把配置中心和本地文件的优先级混为一谈。
- 配置排查要看最终生效值，不只看源码。

## 记忆钩子

**配置不是看谁先写，而是看谁优先级高。**
