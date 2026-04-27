---
title: "ThreadLocal 是什么？为什么可能内存泄漏？"
slug: "threadlocal-memory-leak"
category: "Java 并发"
tags: ["Java", "ThreadLocal", "内存泄漏", "线程池"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "二面高频"
order: 730
summary: "理解线程隔离变量的用途，以及在线程池中为什么必须 remove。"
---

## 一句话结论

ThreadLocal 为每个线程保存一份独立变量副本，常用于保存用户上下文、链路 ID 等；在线程池中使用后不 remove，可能导致数据串用和内存泄漏。

## 通俗解释

ThreadLocal 像每个员工自己的抽屉。大家都叫“临时资料”，但每个人抽屉里放的是自己的东西。

问题是线程池里的员工不会下班，抽屉一直在。如果用完不清理，下一个任务可能看到上一个任务留下的东西。

## 面试回答

ThreadLocal 的数据实际存在线程对象的 ThreadLocalMap 中。key 是 ThreadLocal 的弱引用，value 是实际数据。

如果 ThreadLocal 对象被回收，key 可能变成 null，但 value 还在线程的 map 里。在线程池场景下线程长期存活，value 就可能长期无法释放。

所以使用 ThreadLocal 后，尤其在线程池或 Web 请求场景中，要在 finally 里调用 `remove()`。

## 常见追问

### ThreadLocal 能解决线程安全吗？

它解决的是变量隔离，不是所有线程安全问题。每个线程一份数据，避免共享竞争，但跨线程传递和清理要小心。

### InheritableThreadLocal 是什么？

它允许子线程继承父线程的值，但在线程池中使用也要谨慎，因为线程复用会带来上下文污染。

## 易错点

- 不要说 ThreadLocal 的值存在 ThreadLocal 对象里。
- 不要忘记线程池场景下 remove。
- 不要用 ThreadLocal 传递复杂业务状态。

## 记忆钩子

**ThreadLocal 是线程抽屉，用完不清就是污染现场。**
