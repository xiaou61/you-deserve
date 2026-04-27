---
title: "LockSupport 是什么？"
slug: "locksupport"
category: "Java 并发"
tags: ["Java", "LockSupport", "AQS", "线程阻塞"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "二面加分"
order: 1880
summary: "LockSupport 提供 park 和 unpark，用许可证模型阻塞和唤醒线程，是 AQS 等并发工具的底层能力。"
---

## 一句话结论

LockSupport 是 Java 提供的线程阻塞和唤醒工具，核心方法是 `park` 和 `unpark`，常用于 AQS 等并发框架底层。

## 通俗解释

LockSupport 像给线程发通行证。没有通行证就停车等待，有通行证就能继续走。通行证最多存一张。

## 面试回答

LockSupport 的核心是许可证模型：

- `park`：如果没有许可证，当前线程阻塞；如果有许可证，消费许可证后继续执行。
- `unpark(thread)`：给指定线程发一个许可证。

它比 `wait/notify` 更灵活，因为 `unpark` 可以先于 `park` 调用，不要求必须先持有某个对象锁，也能精确唤醒指定线程。

AQS 中线程获取锁失败后进入等待队列，就会用类似 `park` 的机制阻塞。

## 常见追问

### unpark 先调用会丢失吗？

不会。许可证会保留一份，后续线程调用 `park` 时可以直接通过。

### LockSupport 和 wait/notify 最大区别是什么？

LockSupport 不依赖 synchronized 对象锁，且可以指定唤醒某个线程。

## 易错点

- 许可证不是计数器，最多只有一张。
- `park` 也可能被中断或虚假返回，醒来后仍要检查条件。
- 普通业务很少直接使用，更多在并发框架底层。

## 记忆钩子

**LockSupport 发许可证，park 停车，unpark 放行。**
