---
title: "Minor GC、Major GC、Full GC 有什么区别？"
slug: "minor-major-full-gc"
category: "JVM"
tags: ["Java", "JVM", "GC", "垃圾回收"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "一面/二面高频"
order: 1420
summary: "Minor GC 主要回收新生代，Full GC 通常回收整个堆和相关区域，停顿影响更大。"
---

## 一句话结论

Minor GC 主要回收新生代，Major GC 常指老年代回收，Full GC 通常会回收整个堆以及方法区等相关区域，代价最大。

## 通俗解释

Minor GC 像清理桌面垃圾，频率高但通常很快；Full GC 像全屋大扫除，动静大、耗时长，线上服务最怕它频繁发生。

## 面试回答

JVM 分代回收里常见说法是：

- Minor GC：发生在新生代，Eden 区空间不足时常触发。
- Major GC：通常指老年代 GC，不同资料和收集器叫法可能不完全一致。
- Full GC：范围更大，通常涉及新生代、老年代、元空间等区域。

Full GC 的停顿时间通常更长，如果频繁出现，需要排查对象晋升过快、老年代空间不足、大对象过多、内存泄漏、元空间异常等问题。

## 常见追问

### 什么情况下容易触发 Full GC？

老年代空间不足、元空间不足、显式调用 `System.gc()`、大对象分配失败、晋升担保失败等都可能触发。

### Full GC 一定比 Minor GC 慢吗？

通常更慢，因为回收范围更大，但具体耗时还和堆大小、对象存活率、垃圾收集器有关。

## 易错点

- 不同垃圾收集器对术语使用可能不同，回答时不要绝对化。
- 不要只说“Full GC 很慢”，要能说出常见触发原因。
- 线上排查要结合 GC 日志和监控数据。

## 记忆钩子

**Minor 清桌面，Full 搬全屋。**
