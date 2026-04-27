---
title: "JMM 和 happens-before 是什么？"
slug: "jmm-happens-before"
category: "JVM"
tags: ["Java", "JMM", "happens-before", "并发"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "二面高频"
order: 760
summary: "理解 Java 内存模型如何定义线程间可见性和有序性。"
---

## 一句话结论

JMM 定义了 Java 程序中线程如何与内存交互；happens-before 是判断一个操作结果是否对另一个操作可见的规则。

## 通俗解释

多线程像多人同时编辑文档。每个人可能先在本地草稿里改，什么时候同步给别人，需要规则。JMM 就是这套同步规则。

happens-before 可以理解为“前面的修改，后面一定看得到”的关系。

## 面试回答

JMM 主要解决可见性、有序性和原子性相关问题。它屏蔽不同 CPU 和操作系统内存模型差异，为 Java 并发提供统一规范。

happens-before 不是时间上的先后，而是可见性和有序性的保证。常见规则包括：

- 程序顺序规则：同一线程内，前面的操作 happens-before 后面的操作。
- volatile 规则：对 volatile 变量的写 happens-before 后续对它的读。
- 锁规则：解锁 happens-before 后续对同一锁的加锁。
- 线程启动和终止规则。

## 常见追问

### happens-before 是不是先发生？

不是纯时间概念。它强调前一个操作的结果对后一个操作可见，并且顺序不能被重排破坏。

### JMM 和 JVM 内存区域是一回事吗？

不是。JMM 是并发内存访问规范；JVM 运行时内存区域是堆、栈、方法区等内存划分。

## 易错点

- 不要把 happens-before 直译成时间先后。
- 不要把 JMM 和 JVM 内存结构混淆。
- 不要只背 volatile，要讲可见性规则。

## 记忆钩子

**JMM 定规则，happens-before 判定谁的修改谁能看见。**
