---
title: "Spring 事务 readOnly 有什么用？"
slug: "spring-transaction-readonly"
category: "Spring"
tags: ["Spring", "事务", "readOnly", "性能"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "二面/项目追问"
order: 2380
summary: "readOnly 表示只读事务意图，可帮助框架和数据库做优化，但不是绝对禁止写入的安全边界。"
---

## 一句话结论

`@Transactional(readOnly = true)` 表达当前事务主要用于读取，可能帮助框架或数据库做优化，但不能把它当成绝对禁止写入的权限控制。

## 通俗解释

readOnly 像会议室门口挂了“只读资料，不做修改”的牌子。它提醒大家按只读方式处理，但不是保险柜锁。

## 面试回答

readOnly 的作用：

- 表达方法语义，增强可读性。
- 某些 ORM 可以减少脏检查等开销。
- 数据库或连接池可能根据只读标记做优化。
- 有些读写分离场景会根据它路由到从库。

但它不应该作为防止写操作的唯一手段。不同数据库、驱动、框架对只读事务的处理可能不同。

## 常见追问

### readOnly 会不会强制禁止 update？

不一定，取决于数据库和框架实现。不能依赖它做安全控制。

### 查询方法都要加 readOnly 吗？

核心查询服务可以加，表达语义并可能获得优化，但也要结合团队规范。

## 易错点

- readOnly 不是权限控制。
- 读写分离场景要确认路由规则。
- 不要在只读事务里偷偷写数据。

## 记忆钩子

**readOnly 是只读提示牌，不是防盗锁。**
