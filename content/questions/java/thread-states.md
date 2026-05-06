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

### 这题最容易被追问的边界是什么？

重点说清线程安全、可变性、泛型擦除、异常包装、版本差异、空值和性能退化。不要只给结论，要说明哪些条件下结论成立，哪些条件下会退化或需要换方案。

### 怎么证明自己不是在背模板？

用单元测试、线程栈、JFR、日志、源码方法名、构造参数和最小复现做验证。能说出具体信号、反例或排查入口，答案就从概念层进入实战层。

### 和相近方案怎么区分？

可以拿基础 API、并发容器、锁、原子类、不可变对象、Stream 或 CompletableFuture对比，从语义正确性、线程安全、可读性、性能和版本兼容性几个维度选择。

### 面试官继续深挖时怎么展开？

先围绕“NEW：创建了线程对象，但还没调用 start。”讲清主链路，再补“补 TIMED_WAITING 常见来源、parking to wait for 与 LockSupport/AQS、BLOCKED 只针对 monitor 锁、线程 dump 中 deadlock/blocked owner 信息如何看”。如果能把边界条件、异常分支和验证闭环连起来，就能接住二面、三面的追问。

## 易错点

- 不要把 RUNNABLE 翻译成一定在运行。
- BLOCKED 主要和锁竞争有关。
- WAITING 和 TIMED_WAITING 的区别在于是否有超时时间。

## 详细讲解

Java 线程有哪些状态？ 这道题现在要从“能背出来”修到“能接住追问”。核心结论是：Java 线程状态包括 NEW、RUNNABLE、BLOCKED、WAITING、TIMED_WAITING、TERMINATED。回答时先把它放回Java语境，说明它解决什么矛盾，再围绕对象模型、并发语义、API 边界、异常行为和最小复现展开。这样能避免泛泛而谈，也能让面试官听出你知道这题的真实边界。

第一步是拆清问题背景。线程像一个员工。刚入职是 NEW，能干活或等 CPU 是 RUNNABLE，抢不到会议室是 BLOCKED，等别人通知是 WAITING，限时等待是 TIMED_WAITING，离职是 TERMINATED。在Java题里，背景不能写成空泛的工程套话，而要落到从语言规则、JDK 实现、线程可见性或集合结构出发，说明为什么会出现这个行为。如果只说“看场景”或“加组件”，读者很难知道下一步该检查什么；如果能把输入、状态、依赖和输出说清，答案就有了主线。

第二步是讲机制。可以围绕这些点展开：NEW：创建了线程对象，但还没调用 start。；RUNNABLE：可运行状态，可能正在运行，也可能等待 CPU 调度。；BLOCKED：等待获取锁。；WAITING：无限期等待其他线程唤醒。。每个点都要回答三个问题：它在链路里的位置是什么，它改变了什么状态，失败或边界条件下会留下什么现象。把这三件事讲清楚，追问从概念跳到实战时就不会断。

第三步是补边界。这里尤其要主动说明线程安全、可变性、泛型擦除、异常包装、版本差异、空值和性能退化。不要把 RUNNABLE 翻译成一定在运行。；BLOCKED 主要和锁竞争有关。；WAITING 和 TIMED_WAITING 的区别在于是否有超时时间。很多八股答案的问题不是方向错，而是没有说适用范围；一旦遇到数据规模变化、异常分支或版本差异，原来的结论就可能不成立。

第四步是补专项深度：补 TIMED_WAITING 常见来源、parking to wait for 与 LockSupport/AQS、BLOCKED 只针对 monitor 锁、线程 dump 中 deadlock/blocked owner 信息如何看。这部分适合放在面试回答后半段，用来证明你不仅知道标准答案，也知道高频追问会往哪里挖。

最后收束成一套回答节奏：先给结论，再讲机制，再补边界，最后说验证方式。对这题来说，验证可以看单元测试、线程栈、JFR、日志、源码方法名、构造参数和最小复现；方案选择可以和基础 API、并发容器、锁、原子类、不可变对象、Stream 或 CompletableFuture对比。这样既保留八股题的清晰度，也能把答案讲成可落地、可排查、可复盘的经验。

## 图解提示

适合画一张结构图：定位语言语义 -> NEW -> RUNNABLE -> 说明并发边界 -> 构造最小复现 -> 给出替代方案。画面重点突出：Java 线程有哪些状态？ 不是孤立概念，要把核心机制、边界风险、异常处理和验证证据放在同一张图里。

## 记忆钩子

**线程一生：新建、可跑、抢锁、等待、限时等、结束。**
