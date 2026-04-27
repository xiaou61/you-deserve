---
title: "synchronized 和 ReentrantLock 有什么区别？"
slug: "synchronized-reentrantlock"
category: "Java 并发"
tags: ["Java", "锁", "synchronized", "ReentrantLock"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "一面/二面高频"
order: 420
summary: "从语法层面、可中断、公平锁、条件队列和释放方式对比两种锁。"
---

## 一句话结论

`synchronized` 是 JVM 内置锁，使用简单，自动释放；`ReentrantLock` 是显式锁，功能更灵活，支持可中断、公平锁、多个条件队列，但必须手动释放。

## 通俗解释

`synchronized` 像自动门，进出规则简单，走完自动关门。`ReentrantLock` 像手动门锁，能设置更多规则，但你必须记得关门。

## 面试回答

区别可以从几个方面说：

1. 使用方式：synchronized 是关键字；ReentrantLock 是类。
2. 释放方式：synchronized 自动释放；ReentrantLock 要在 finally 中 unlock。
3. 可中断：ReentrantLock 支持等待锁时响应中断。
4. 公平性：ReentrantLock 可以选择公平锁；synchronized 不支持手动设置公平。
5. 条件队列：ReentrantLock 可以创建多个 Condition。
6. 实现层面：synchronized 由 JVM 支持，ReentrantLock 基于 AQS。

一般简单同步优先 synchronized；需要高级能力时再考虑 ReentrantLock。

## 常见追问

### ReentrantLock 为什么要放 finally 解锁？

因为它不会自动释放锁。如果业务代码抛异常但没有 unlock，可能导致其他线程永远拿不到锁。

### synchronized 性能是不是一定差？

不是。现代 JVM 对 synchronized 做了很多优化，普通场景完全可以使用。

## 易错点

- 不要说 ReentrantLock 一定比 synchronized 快。
- 不要忘记 finally 释放锁。
- 不要只背区别，要说选择建议。

## 记忆钩子

**synchronized 自动省心，ReentrantLock 手动强大。**
