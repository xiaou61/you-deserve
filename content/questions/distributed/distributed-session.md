---
title: "分布式 Session 怎么解决？"
slug: "distributed-session"
category: "分布式系统"
tags: ["分布式", "Session", "登录态", "Redis"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "项目高频"
order: 1720
summary: "分布式 Session 解决多实例登录态不共享问题，常见方案有粘性会话、Session 复制、Redis 集中存储和 Token。"
---

## 一句话结论

分布式 Session 解决的是多台服务器之间登录态不共享的问题，常见方案是 Redis 集中存储 Session 或改用 Token/JWT。

## 通俗解释

单机 Session 像只在一个门卫室登记。系统变成多个门卫室后，你在 A 门登记，去 B 门别人不认识你，所以需要统一登记处。

## 面试回答

常见方案：

- 粘性会话：负载均衡把同一用户固定到同一台机器，简单但机器故障影响大。
- Session 复制：服务器之间复制 Session，实例多时成本高。
- Redis 存储：Session 放 Redis，各应用实例共享，常用。
- Token/JWT：服务端不保存或少保存会话信息，客户端携带令牌。

实际项目里，传统后台管理系统常用 Redis Session，开放 API 或前后端分离系统常用 Token 方案。

## 常见追问

### Redis 存 Session 有什么风险？

Redis 故障会影响登录态，所以要考虑高可用、过期时间、降级和重新登录策略。

### JWT 能主动失效吗？

纯无状态 JWT 主动失效较麻烦，通常需要黑名单、短过期时间或服务端版本号配合。

## 易错点

- 不要只说“用 Redis”而不讲过期和高可用。
- 粘性会话不适合强容灾场景。
- JWT 不是万能，主动踢人和权限变更要额外设计。

## 记忆钩子

**多台机器不共享登录态，就建统一登记处。**
