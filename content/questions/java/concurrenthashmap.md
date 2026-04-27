---
title: "ConcurrentHashMap 为什么线程安全？"
slug: "concurrenthashmap"
category: "Java 并发"
tags: ["Java", "ConcurrentHashMap", "并发集合", "线程安全"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "一面/二面高频"
order: 1740
summary: "ConcurrentHashMap 通过 CAS、synchronized 和细粒度锁控制并发更新，比 Hashtable 粗粒度锁更高效。"
---

## 一句话结论

ConcurrentHashMap 是线程安全的并发 Map，JDK 8 以后主要通过 CAS、synchronized 锁桶头节点、volatile 等机制保证并发安全。

## 通俗解释

Hashtable 像整个超市只有一把大锁，一个人结账时别人都不能动。ConcurrentHashMap 像每个货架局部管理，多个人可以在不同货架同时操作。

## 面试回答

JDK 8 中 ConcurrentHashMap 的核心思路：

- 数组使用 volatile 语义保证可见性。
- 插入空桶时用 CAS。
- 桶中已有元素时，锁住桶头节点进行更新。
- 链表过长会树化，提高查询效率。
- 扩容时多个线程可以协助迁移。

相比 Hashtable 整个方法加锁，ConcurrentHashMap 锁粒度更细，并发性能更好。

## 常见追问

### ConcurrentHashMap 的 key 和 value 能为 null 吗？

不能。为了避免并发场景下无法区分“没有这个 key”和“value 本身是 null”的歧义。

### 它一定不会阻塞吗？

不是。空桶 CAS 通常无锁，但桶内冲突更新仍可能使用 synchronized。

## 易错点

- 不要把 JDK 7 的 Segment 机制直接套到 JDK 8。
- 线程安全不代表复合操作天然原子。
- `size()` 在并发下是近似统计思路，不要当强一致计数依赖。

## 记忆钩子

**ConcurrentHashMap 不是全场锁门，而是分货架管理。**
