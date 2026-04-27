---
title: "AQS 是什么？"
slug: "aqs"
category: "Java 并发"
tags: ["Java", "AQS", "并发", "锁"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "二面高频"
order: 1060
summary: "理解 AQS 是构建锁和同步器的基础框架，核心是 state 和等待队列。"
---

## 一句话结论

AQS 是 AbstractQueuedSynchronizer，是 Java 并发包里构建锁和同步器的基础框架，核心是同步状态 state 和 FIFO 等待队列。

## 通俗解释

AQS 像排队办业务的大厅。state 表示窗口是否可用或还有几个名额，拿不到资源的人进入队列等待，轮到谁再被唤醒。

## 面试回答

AQS 提供了一套同步器框架，子类通过实现获取和释放同步状态的方法，就可以构建锁或同步工具。

核心点：

- `state` 表示同步状态。
- CAS 修改 state 保证并发安全。
- 等待线程会被封装成节点进入 CLH 队列。
- 获取失败的线程阻塞，释放时唤醒后继节点。

ReentrantLock、Semaphore、CountDownLatch 等都基于 AQS。

## 常见追问

### ReentrantLock 如何体现可重入？

同一个线程再次获取锁时，会增加 state 计数；释放时递减，直到 state 为 0 才真正释放锁。

### AQS 是公平还是非公平？

AQS 本身支持不同策略，具体是否公平取决于同步器实现，比如 ReentrantLock 可以选择公平或非公平。

## 易错点

- 不要只背 AQS 全称，要讲 state 和队列。
- 不要把 AQS 说成某一种锁。
- 不要忽略 CAS 和阻塞唤醒配合。

## 记忆钩子

**AQS 就是同步器大厅：state 管名额，队列管排队。**
