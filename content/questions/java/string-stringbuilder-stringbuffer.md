---
title: "String、StringBuilder、StringBuffer 有什么区别？"
slug: "string-stringbuilder-stringbuffer"
category: "Java 基础"
tags: ["Java", "String", "StringBuilder", "StringBuffer"]
difficulty: "easy"
route: "Java 后端上岸路线"
scene: "一面高频"
order: 1000
summary: "从不可变、线程安全和拼接性能区分三个字符串相关类。"
---

## 一句话结论

String 不可变；StringBuilder 可变但线程不安全，性能较好；StringBuffer 可变且线程安全，但同步带来额外开销。

## 通俗解释

String 像写死的纸条，改一次就要换一张。StringBuilder 像草稿纸，可以一直涂改。StringBuffer 也是草稿纸，但每次修改都要先上锁，避免多人同时写乱。

## 面试回答

String 的内容不可变，每次拼接可能创建新对象。少量拼接问题不大，但循环里大量拼接不适合直接用 String。

StringBuilder 适合单线程下大量字符串拼接。StringBuffer 的方法加了同步，适合多线程共享同一个字符串缓冲区的场景，但实际业务里这种场景不多。

## 常见追问

### String 为什么不可变？

不可变让它更安全，适合作为 HashMap key，也方便字符串常量池复用和缓存 hash 值。

### 字符串拼接一定要手写 StringBuilder 吗？

不一定。简单拼接编译器可能优化。循环大量拼接时再显式使用 StringBuilder。

## 易错点

- 不要说 StringBuilder 一定线程安全。
- 不要说 StringBuffer 一定更好，它只是更安全但更重。
- 不要忽略 String 不可变带来的好处。

## 记忆钩子

**String 固定，Builder 快，Buffer 带锁。**
