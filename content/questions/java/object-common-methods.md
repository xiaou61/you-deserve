---
title: "Object 类常见方法有哪些？"
slug: "object-common-methods"
category: "Java 基础"
tags: ["Java", "Object", "equals", "hashCode"]
difficulty: "easy"
route: "Java 后端上岸路线"
scene: "一面基础"
order: 1810
summary: "Object 是所有类的根类，常见方法包括 equals、hashCode、toString、clone、wait、notify 等。"
---

## 一句话结论

Object 是 Java 所有类的根类，常见方法有 `equals`、`hashCode`、`toString`、`clone`、`getClass`、`wait`、`notify`、`notifyAll` 等。

## 通俗解释

Object 像所有 Java 对象的“基础身份证模板”。每个对象都默认带着一些最基础能力，比如比较、打印、等待和唤醒。

## 面试回答

Object 常见方法可以分几类：

- 对象比较：`equals`、`hashCode`。
- 对象描述：`toString`。
- 类型信息：`getClass`。
- 复制相关：`clone`。
- 线程协作：`wait`、`notify`、`notifyAll`。
- 生命周期历史遗留：`finalize`，现在不推荐依赖。

其中 `equals` 和 `hashCode` 经常一起追问，因为 HashMap、HashSet 依赖它们判断对象是否相等。

## 常见追问

### wait 为什么在 Object 里？

因为每个 Java 对象都可以作为锁对象，`wait` 和 `notify` 是围绕对象监视器做线程协作的。

### finalize 还能用吗？

不推荐使用。它执行时机不可控，现代 Java 中应该用显式关闭资源或 try-with-resources。

## 易错点

- 不要只背方法名，要知道方法大类。
- `wait`、`notify` 必须配合锁使用。
- `finalize` 不是可靠的资源释放方式。

## 记忆钩子

**Object 是对象底座：能比较、能描述、能等待、能唤醒。**
