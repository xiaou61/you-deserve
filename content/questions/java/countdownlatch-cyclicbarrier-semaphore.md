---
title: "CountDownLatch、CyclicBarrier、Semaphore 有什么区别？"
slug: "countdownlatch-cyclicbarrier-semaphore"
category: "Java 并发"
tags: ["Java", "CountDownLatch", "CyclicBarrier", "Semaphore"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "一面/二面高频"
order: 1070
summary: "用等待完成、集合出发和控制并发数区分三个同步工具。"
---

## 一句话结论

CountDownLatch 用来等多个任务完成，CyclicBarrier 用来等多个线程集合后一起继续，Semaphore 用来控制同时访问资源的线程数量。

## 通俗解释

CountDownLatch 像等所有快递到齐再开箱。CyclicBarrier 像旅行团等所有人到集合点再出发。Semaphore 像停车场车位，只有拿到车位才能进。

## 面试回答

CountDownLatch 的计数只能减少，减到 0 后等待线程继续，不能重置，适合主线程等待多个子任务完成。

CyclicBarrier 让一组线程互相等待，全部到达屏障后一起继续，并且可以重复使用。

Semaphore 控制许可证数量，线程获取许可证后执行，释放后别人才能获取，适合限流或资源池。

## 常见追问

### CountDownLatch 和 CyclicBarrier 最大区别？

CountDownLatch 是一个或多个线程等待其他任务完成；CyclicBarrier 是一组线程互相等待到齐后继续。前者不可复用，后者可复用。

### Semaphore 能做限流吗？

可以。把许可证数量设置为最大并发数，请求拿到许可证才继续处理。

## 易错点

- 不要把 CountDownLatch 和 CyclicBarrier 混用。
- 不要忘记 Semaphore 需要释放许可证。
- CyclicBarrier 异常或超时可能导致屏障破坏。

## 记忆钩子

**Latch 等完成，Barrier 等集合，Semaphore 控名额。**
