---
title: "ForkJoinPool 适合什么场景？"
slug: "forkjoinpool"
category: "Java 并发"
tags: ["Java", "ForkJoinPool", "并行计算", "线程池"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "二面加分"
order: 2310
summary: "ForkJoinPool 适合把大任务拆成小任务并行执行，核心思想是分治和工作窃取。"
---

## 一句话结论

ForkJoinPool 适合把大任务递归拆成小任务并行执行，核心机制是分治和工作窃取。

## 通俗解释

大任务像搬一仓库书。主管先把任务拆给多人，每个人搬自己那堆；谁先搬完，就去帮别人搬剩下的。

## 面试回答

ForkJoinPool 的核心思想：

- Fork：把大任务拆成多个子任务。
- Join：等待子任务结果并合并。
- 工作窃取：空闲线程从其他线程队列尾部偷任务执行，提高利用率。

它适合 CPU 密集型、可拆分、子任务相对独立的计算场景。

不适合大量阻塞 IO 场景，因为阻塞会占住工作线程，降低并行效率。

## 常见追问

### parallelStream 和 ForkJoinPool 有关系吗？

默认情况下，parallelStream 常使用公共 ForkJoinPool 执行任务。

### 工作窃取解决什么问题？

解决线程负载不均，让空闲线程帮助忙碌线程执行剩余任务。

## 易错点

- 不要把 ForkJoinPool 用于大量阻塞任务。
- 子任务拆得过细也会有调度开销。
- parallelStream 默认线程池要谨慎使用。

## 记忆钩子

**ForkJoin 是拆活并行干，谁闲谁偷活。**
