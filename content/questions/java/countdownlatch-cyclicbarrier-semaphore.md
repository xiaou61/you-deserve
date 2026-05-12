---
title: CountDownLatch、CyclicBarrier、Semaphore 有什么区别？
slug: countdownlatch-cyclicbarrier-semaphore
category: Java 并发
tags:
  - Java
  - CountDownLatch
  - CyclicBarrier
  - Semaphore
difficulty: medium
route: Java 后端上岸路线
scene: 一面/二面高频
order: 1070
summary: 用等待完成、集合出发和控制并发数区分三个同步工具。
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

### Java 基础题最容易被追问到哪一层？

通常会从定义继续追到内存语义、并发边界、对象生命周期或 JDK 版本差异。像「CountDownLatch、CyclicBarrier、Semaphore 有什么区别」这种题，最好主动说清楚它在多线程或大对象场景下有没有额外代价。

### 如果要证明自己不是背概念，会补什么？

最有效的是补一个可复现的小例子：哪种写法会出错、输出会长什么样、为什么会这样。Java 题一旦有最小复现，可信度会立刻上来。

### 线上真的会通过什么现象暴露出来？

一般会落到 GC 抖动、线程阻塞、对象分配过多、状态不一致或接口 RT 上升。把概念和现象连起来，才更像工程师而不是题库朗读器。

### 面试里怎么把它讲顺？

可以按“结论 -> 机制 -> 反例 -> 适用边界”来讲 CountDownLatch、CyclicBarrier、Semaphore 有什么区别。如果再补一句你会怎么验证，通常就已经超过一面标准答案了。

## 易错点

- 不要把 CountDownLatch 和 CyclicBarrier 混用。
- 不要忘记 Semaphore 需要释放许可证。
- CyclicBarrier 异常或超时可能导致屏障破坏。

## 详细讲解
CountDownLatch、CyclicBarrier、Semaphore 有什么区别 这种 Java 题如果只停在定义，很容易被一句“那为什么会这样”追住。比较稳的讲法是先把它放回 JDK 语义或并发语义里，先用一句话压住主题，比如 用等待完成、集合出发和控制并发数区分三个同步工具，再说明它到底在解决什么问题，或者在约束什么行为。

主线部分适合围绕“用等待完成、集合出发和控制并发数区分三个同步工具”展开，把状态变化、对象关系或线程交互讲清楚。Java 题越往后问，越不看你能不能背 API，而看你能不能把底层语义、可见性、CAS/锁、生命周期或者 JDK 实现讲成一条连续的因果链。

真正容易翻车的，往往是边界和代价。这里可以主动补 不要把 CountDownLatch 和 CyclicBarrier 混用、不要忘记 Semaphore 需要释放许可证、CyclicBarrier 异常或超时可能导致屏障破坏 这些点，再解释它们在高并发、长生命周期对象、版本差异或错误用法下会怎样放大。这样读者不会只记住“这个东西能干嘛”，还会知道“什么时候别这么用”。

如果面试官继续追问，通常会落到 Java 基础题最容易被追问到哪一层？、如果要证明自己不是背概念，会补什么？、线上真的会通过什么现象暴露出来？ 这些方向。这时最好补一个验证视角：你会看源码方法、单测、最小复现、线程栈、JFR、日志还是压测数据。Java 并发题尤其如此，能讲出怎么证伪，可信度会高很多。

最后收口时，尽量把 CountDownLatch、CyclicBarrier、Semaphore 有什么区别 讲成“结论 -> 机制 -> 边界 -> 代价 -> 验证”这条线。这样既保留了八股题该有的清晰度，也能把它拉到真正像工程经验的层次。

Java 基础或并发题继续往下问时，面试官通常在看你有没有把“语义、边界、代价”一起想清楚。讲 CountDownLatch、CyclicBarrier、Semaphore 有什么区别 时，最好主动补一句它在高并发、对象生命周期或异常分支下会出现什么副作用，以及你会用什么日志、压测或最小复现去证明自己的判断，这样答案会更像工程经验，不像纯背诵。

再往实战一点讲，CountDownLatch、CyclicBarrier、Semaphore 有什么区别 这类题最好补一层“怎么验证”。比如你会用什么最小复现、单测、线程栈、JFR、源码断点或压测结果去证明判断。Java 并发和基础题一旦能把验证动作说出来，答案就会从“我记得概念”变成“我知道怎么排查它真的有没有生效”。

## 图解提示

适合画一张机制图：先放核心对象或状态 -> 再画线程/调用如何进入 -> 展开 CountDownLatch、CyclicBarrier、Semaphore 有什么区别 -> 补一个错误用法或边界 -> 标代价或副作用 -> 最后放验证手段。Java 题的图，最好让人一眼看出“状态怎么变”。

## 记忆钩子

**Latch 等完成，Barrier 等集合，Semaphore 控名额。**
