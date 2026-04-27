---
title: "JVM Safepoint 是什么？"
slug: "jvm-safepoint"
category: "JVM"
tags: ["JVM", "Safepoint", "GC", "停顿"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "二面加分"
order: 2340
summary: "Safepoint 是 JVM 能安全暂停线程的位置，常用于 GC、偏向锁撤销、栈信息采集等操作。"
---

## 一句话结论

Safepoint 是 JVM 能安全暂停线程并观察一致状态的位置，GC 等全局操作通常需要线程到达安全点。

## 通俗解释

Safepoint 像施工检查点。所有车辆要开到安全停车区后，工作人员才能统一检查道路。

## 面试回答

JVM 做某些操作时，需要所有线程处于可控状态，比如：

- Stop The World GC。
- 线程栈信息采集。
- 偏向锁撤销。
- 代码反优化。

线程不是任意位置都能安全暂停，而是在特定安全点暂停。常见安全点包括方法调用、循环跳转、异常跳转等位置。

如果某个线程长时间不到达安全点，可能导致 JVM 全局停顿变长。

## 常见追问

### Safepoint 和 STW 是一回事吗？

不是。STW 是暂停所有应用线程的现象，Safepoint 是线程能安全暂停的位置。

### 为什么长循环可能影响 Safepoint？

如果循环里没有安全点检查，线程可能较久无法响应 JVM 的暂停请求。

## 易错点

- Safepoint 不是只和 GC 有关。
- 线程需要到达安全点才能安全暂停。
- 排查停顿时可以关注 safepoint 日志。

## 记忆钩子

**Safepoint 是线程统一停车检查点。**
