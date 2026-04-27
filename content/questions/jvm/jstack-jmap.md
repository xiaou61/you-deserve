---
title: "jstack、jmap、jstat 分别有什么用？"
slug: "jstack-jmap-jstat"
category: "JVM"
tags: ["JVM", "jstack", "jmap", "jstat", "排查"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "线上排查"
order: 2220
summary: "jstack 看线程栈，jmap 看堆和 dump，jstat 看 JVM 运行统计，常用于线上问题定位。"
---

## 一句话结论

`jstack` 主要看线程栈，`jmap` 主要看堆内存和生成 dump，`jstat` 主要看 GC、类加载等 JVM 运行统计。

## 通俗解释

排查 JVM 像看体检报告。jstack 看人在忙什么，jmap 看身体里堆了什么，jstat 看心跳和代谢趋势。

## 面试回答

常见用途：

- `jstack`：查看线程栈，排查死锁、线程阻塞、CPU 飙高。
- `jmap`：查看堆信息，导出 heap dump，排查内存泄漏。
- `jstat`：查看 GC 次数、耗时、内存区域使用变化。

线上使用时要谨慎，特别是导出 dump 可能影响性能或占用磁盘。

## 常见追问

### CPU 飙高怎么用 jstack 排查？

先定位高 CPU 线程，再转换线程 ID 格式，到 jstack 中找对应线程栈，看它正在执行什么代码。

### OOM 后怎么分析？

可以保留 heap dump，用 MAT 等工具分析大对象、引用链和可能泄漏点。

## 易错点

- 不要线上随便 dump 大堆内存。
- 单次 jstack 不一定够，连续多次更容易看趋势。
- 工具输出要结合业务日志和监控一起看。

## 记忆钩子

**jstack 看线程，jmap 看堆，jstat 看趋势。**
