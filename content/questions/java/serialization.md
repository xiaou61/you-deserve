---
title: "Java 序列化是什么？serialVersionUID 有什么用？"
slug: "java-serialization"
category: "Java 基础"
tags: ["Java", "序列化", "serialVersionUID"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "一面高频"
order: 1050
summary: "理解对象转字节流、反序列化兼容性和 serialVersionUID 的作用。"
---

## 一句话结论

序列化是把对象转换成可存储或传输的字节流；serialVersionUID 用来校验序列化前后的类版本是否兼容。

## 通俗解释

序列化像把家具拆成零件装箱，发到另一个地方再组装。serialVersionUID 像说明书版本号，版本不匹配时可能装不回去。

## 面试回答

Java 对象实现 Serializable 后，可以被序列化成字节流，用于网络传输、缓存或持久化。反序列化时会根据字节流恢复对象。

serialVersionUID 是序列化版本号。如果类结构变化但没有显式声明，编译器可能生成不同版本号，导致反序列化失败。显式声明可以更好控制兼容性。

## 常见追问

### transient 有什么用？

transient 修饰的字段不会参与默认 Java 序列化，适合密码、临时状态等不想保存的字段。

### Java 原生序列化适合高性能场景吗？

通常不推荐。它性能和体积都不占优，真实项目常用 JSON、Protobuf、Kryo 等方案。

## 易错点

- 不要忘记显式声明 serialVersionUID。
- 不要把敏感字段直接序列化。
- 不要默认 Java 原生序列化适合所有场景。

## 记忆钩子

**序列化是对象打包，serialVersionUID 是说明书版本。**
