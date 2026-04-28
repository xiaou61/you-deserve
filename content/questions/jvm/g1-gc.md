---
title: "G1 垃圾收集器有什么特点？"
slug: "g1-gc"
category: "JVM"
tags: ["JVM", "G1", "垃圾回收", "低延迟"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "JVM 高频"
order: 3450
summary: "G1 把堆切成多个 Region，优先回收收益高的区域，并通过停顿目标控制回收节奏。"
---

## 一句话结论

G1 把堆划分成多个 Region，按回收收益选择区域，目标是在可预测停顿时间内完成垃圾回收。

## 通俗解释

它像打扫宿舍楼。不是每次整栋楼一起扫，而是把楼分成很多房间，优先扫最脏、最容易清出空间的房间。

## 面试回答

G1 的特点：

- 堆被划分为多个 Region，不再简单只看连续的新生代和老年代。
- 支持并发标记，减少长时间停顿。
- Mixed GC 会回收新生代和部分老年代 Region。
- 有停顿时间目标，比如 `MaxGCPauseMillis`。
- 通过 Remembered Set 记录跨 Region 引用。

G1 适合较大堆、对停顿时间有要求的服务。但停顿目标不是硬保证，参数也不能随便乱调。

## 常见追问

### G1 为什么叫 Garbage First？

因为它会优先选择垃圾比例高、回收收益大的 Region 进行回收。

### G1 一定比 CMS 或其他收集器好吗？

不一定。收集器选择要看堆大小、延迟目标、吞吐目标和 JDK 版本。

## 易错点

- 不要说 G1 完全没有 STW。
- 停顿目标不是绝对承诺。
- Region 和 Remembered Set 是理解 G1 的关键。

## 记忆钩子

**G1 像分房间打扫，先扫最值得扫的。**

## 图解提示

适合画结构图：堆被切成多个 Region，标出 Eden、Survivor、Old、Humongous 和回收选择。
