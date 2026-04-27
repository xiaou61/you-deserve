---
title: "Spring Profile 有什么用？"
slug: "spring-profiles"
category: "Spring"
tags: ["Spring", "Profile", "环境配置", "配置管理"]
difficulty: "easy"
route: "Java 后端上岸路线"
scene: "项目部署追问"
order: 1930
summary: "Profile 用于区分不同环境的配置和 Bean，让 dev、test、prod 可以使用不同配置。"
---

## 一句话结论

Spring Profile 用来区分不同运行环境，让开发、测试、生产环境加载不同配置或不同 Bean。

## 通俗解释

Profile 像换工作服。开发环境穿开发服，测试环境穿测试服，生产环境穿生产服，不同场景用不同配置。

## 面试回答

Profile 常见用途：

- 区分 `dev`、`test`、`prod` 配置文件。
- 不同环境连接不同数据库、Redis、第三方服务。
- 某些 Bean 只在特定环境启用，比如 mock 服务只在开发环境启用。

常见配置方式包括 `application-dev.yml`、`application-prod.yml`，通过启动参数或环境变量激活。

## 常见追问

### 生产环境配置为什么不能写死在代码里？

因为敏感信息和环境差异都不应该进入代码，应该通过环境变量、配置中心或安全配置管理。

### 多个 Profile 可以同时激活吗？

可以，但同名配置覆盖时要注意最终生效值和优先级。

## 易错点

- 不要把 profile 当成业务开关乱用。
- 生产配置要注意密钥安全。
- 排查问题要确认当前激活的是哪个 profile。

## 记忆钩子

**Profile 是环境工作服，在哪个环境穿哪套。**
