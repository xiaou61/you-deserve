---
title: "Java 线程有哪些状态？"
slug: "java-thread-states"
category: "Java 并发"
tags: ["Java", "线程", "线程状态", "并发"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "一面高频"
order: 1850
summary: "Java 线程状态包括 NEW、RUNNABLE、BLOCKED、WAITING、TIMED_WAITING、TERMINATED。"
---

## 一句话结论

Java 线程有 6 种状态：NEW、RUNNABLE、BLOCKED、WAITING、TIMED_WAITING、TERMINATED。

## 通俗解释

线程像一个员工。刚入职是 NEW，能干活或等 CPU 是 RUNNABLE，抢不到会议室是 BLOCKED，等别人通知是 WAITING，限时等待是 TIMED_WAITING，离职是 TERMINATED。

## 面试回答

线程状态可以这样理解：

- NEW：创建了线程对象，但还没调用 `start`。
- RUNNABLE：可运行状态，可能正在运行，也可能等待 CPU 调度。
- BLOCKED：等待获取锁。
- WAITING：无限期等待其他线程唤醒。
- TIMED_WAITING：限时等待，比如 `sleep`、带超时的 `wait`。
- TERMINATED：线程执行结束。

排查线程问题时，线程 dump 里的状态非常有用，比如大量 BLOCKED 可能说明锁竞争严重。

## 常见追问

### RUNNABLE 一定正在执行吗？

不一定。它可能正在运行，也可能在等待 CPU 时间片。

### BLOCKED 和 WAITING 有什么区别？

BLOCKED 通常是等锁，WAITING 是等其他线程显式唤醒或某个条件完成。

## 易错点

- 不要把 RUNNABLE 翻译成一定在运行。
- BLOCKED 主要和锁竞争有关。
- WAITING 和 TIMED_WAITING 的区别在于是否有超时时间。

## 记忆钩子

**线程一生：新建、可跑、抢锁、等待、限时等、结束。**
