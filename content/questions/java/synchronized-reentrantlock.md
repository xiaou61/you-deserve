---
title: synchronized 和 ReentrantLock 有什么区别？
slug: synchronized-reentrantlock
category: Java 并发
tags:
  - Java
  - 锁
  - synchronized
  - ReentrantLock
difficulty: medium
route: Java 后端上岸路线
scene: 一面/二面高频
order: 420
summary: 从语法层面、可中断、公平锁、条件队列和释放方式对比两种锁。
---

## 一句话结论

`synchronized` 和 ReentrantLock 的差别不只是“一个关键字一个类”，而是一个更偏 JVM 内置、简单稳妥，一个更偏 AQS 显式控制、能力换复杂度。

## 通俗解释

`synchronized` 像自动门，进出规则简单，走完自动关门。`ReentrantLock` 像手动门锁，能设置更多规则，但你必须记得关门。

## 面试回答

回答时建议从“能力、成本、场景”三层对比：

1. `synchronized` 语法简单，异常时 JVM 会自动释放锁，适合大多数普通同步代码块。
2. `ReentrantLock` 需要手动 `lock/unlock`，但支持可中断获取、定时尝试、公平锁和多个 Condition。
3. `synchronized` 走 JVM monitor 机制，ReentrantLock 基于 AQS，自定义能力更强。
4. 如果只是保护一个临界区，优先用 `synchronized`；只有在需要高级特性或更细致的排队控制时，再上 ReentrantLock。

## 常见追问

### 为什么现在很多场景下不再简单说 ReentrantLock 一定更快？

因为 JVM 这些年对 `synchronized` 做了很多优化，轻量级锁、锁消除、锁粗化等都让它在普通场景下足够好。面试里主动说“别再背老版本性能神话”，会显得很清醒。

### `lockInterruptibly()` 有什么实际价值？

它允许线程在等待锁时响应中断，适合做可取消任务、超时控制或避免长时间死等。这个点是 ReentrantLock 和 synchronized 很常见的分水岭。

### 多个 `Condition` 为什么有用？

你可以把不同等待条件分成不同队列，例如“队列非空”和“队列未满”各用一个 Condition，避免所有线程都挤在同一个 `wait/notifyAll` 语义里。

### 最容易踩的工程坑是什么？

忘记在 `finally` 里 `unlock()`。这也是为什么很多简单业务宁愿选 synchronized：能力少一点，但不容易把自己锁死。

## 易错点

- 不要说 ReentrantLock 一定比 synchronized 快。
- 不要忘记 finally 释放锁。
- 不要只背区别，要说选择建议。

## 详细讲解
synchronized 和 ReentrantLock 有什么区别 这种 Java 题如果只停在定义，很容易被一句“那为什么会这样”追住。比较稳的讲法是先把它放回 JDK 语义或并发语义里，先用一句话压住主题，比如 从语法层面、可中断、公平锁、条件队列和释放方式对比两种锁，再说明它到底在解决什么问题，或者在约束什么行为。

主线部分适合围绕“`synchronized` 语法简单，异常时 JVM 会自动释放锁，适合大多数普通同步代码块”展开，把状态变化、对象关系或线程交互讲清楚。Java 题越往后问，越不看你能不能背 API，而看你能不能把底层语义、可见性、CAS/锁、生命周期或者 JDK 实现讲成一条连续的因果链。

真正容易翻车的，往往是边界和代价。这里可以主动补 不要说 ReentrantLock 一定比 synchronized 快、不要忘记 finally 释放锁、不要只背区别，要说选择建议 这些点，再解释它们在高并发、长生命周期对象、版本差异或错误用法下会怎样放大。这样读者不会只记住“这个东西能干嘛”，还会知道“什么时候别这么用”。

如果面试官继续追问，通常会落到 为什么现在很多场景下不再简单说 ReentrantLock 一定更快？、`lockInterruptibly()` 有什么实际价值？、多个 `Condition` 为什么有用？ 这些方向。这时最好补一个验证视角：你会看源码方法、单测、最小复现、线程栈、JFR、日志还是压测数据。Java 并发题尤其如此，能讲出怎么证伪，可信度会高很多。

最后收口时，尽量把 synchronized 和 ReentrantLock 有什么区别 讲成“结论 -> 机制 -> 边界 -> 代价 -> 验证”这条线。这样既保留了八股题该有的清晰度，也能把它拉到真正像工程经验的层次。

Java 基础或并发题继续往下问时，面试官通常在看你有没有把“语义、边界、代价”一起想清楚。讲 synchronized 和 ReentrantLock 有什么区别 时，最好主动补一句它在高并发、对象生命周期或异常分支下会出现什么副作用，以及你会用什么日志、压测或最小复现去证明自己的判断，这样答案会更像工程经验，不像纯背诵。

再往实战一点讲，synchronized 和 ReentrantLock 有什么区别 这类题最好补一层“怎么验证”。比如你会用什么最小复现、单测、线程栈、JFR、源码断点或压测结果去证明判断。Java 并发和基础题一旦能把验证动作说出来，答案就会从“我记得概念”变成“我知道怎么排查它真的有没有生效”。

## 图解提示

适合画一张对比表 + 流程图：左边列 synchronized 的自动释放、JVM monitor、简单语法；右边列 ReentrantLock 的显式加解锁、可中断、公平锁、多个 Condition。底部补一句选型原则：简单场景优先前者，高级控制再选后者。

## 记忆钩子

**synchronized 自动省心，ReentrantLock 手动强大。**
