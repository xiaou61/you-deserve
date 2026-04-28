---
title: "JFR 在 Java 线上排障里有什么用？"
slug: "jfr"
category: "JVM"
tags: ["JVM", "JFR", "性能分析", "线上排障"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "JVM 线上排障"
order: 3460
summary: "JFR 可以低开销记录 JVM 和应用运行事件，用来分析 CPU、锁、GC、IO 等性能问题。"
---

## 一句话结论

JFR 是 Java Flight Recorder，可以用较低开销记录 JVM 运行事件，帮助分析 CPU、锁竞争、GC、线程和 IO 问题。

## 通俗解释

它像飞机黑匣子。平时默默记录关键数据，出问题后可以回放，看看故障前后系统发生了什么。

## 面试回答

JFR 能记录很多事件：

- 方法采样和 CPU 热点。
- GC、内存分配、对象统计。
- 线程阻塞、锁竞争。
- 文件 IO、Socket IO。
- JVM 参数、类加载等运行信息。

相比临时加日志，JFR 更适合性能分析；相比一些重型 profiler，它对线上影响通常更小。排查复杂性能问题时，可以结合 JFR、日志、监控和 dump 一起看。

## 常见追问

### JFR 能替代日志吗？

不能。JFR 偏运行事件和性能分析，业务语义仍要靠日志和指标。

### 线上开 JFR 有风险吗？

有一定开销，但通常可控。仍要控制采集时长、事件级别和文件大小。

## 易错点

- 不要把 JFR 当业务日志。
- 采集要有时间窗口，避免文件过大。
- 分析时要结合业务流量和故障时间点。

## 记忆钩子

**JFR 是 JVM 黑匣子，排性能问题能回放现场。**

## 图解提示

适合画结构图：JVM 事件 -> JFR 记录 -> JDK Mission Control 分析 CPU/GC/锁/IO。
