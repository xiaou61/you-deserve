---
title: "受检异常和运行时异常有什么区别？"
slug: "checked-runtime-exception"
category: "Java 基础"
tags: ["Java", "异常", "Exception", "RuntimeException"]
difficulty: "easy"
route: "Java 后端上岸路线"
scene: "一面高频"
order: 1030
summary: "理解编译期强制处理和运行期才暴露的异常差异。"
---

## 一句话结论

受检异常在编译期必须处理或声明抛出；运行时异常不强制处理，通常表示程序逻辑错误或运行环境问题。

## 通俗解释

受检异常像出门必须带证件，编译器会提前提醒你。运行时异常像路上摔了一跤，代码写得不稳时才发生。

## 面试回答

受检异常继承自 Exception 但不属于 RuntimeException，比如 IOException。调用可能抛出受检异常的方法时，必须 try-catch 或 throws。

运行时异常继承 RuntimeException，比如 NullPointerException、IndexOutOfBoundsException。编译器不强制处理，更多是通过代码健壮性避免。

## 常见追问

### 业务异常应该设计成哪种？

很多项目会把业务异常设计成运行时异常，配合全局异常处理统一返回错误码，避免方法签名到处 throws。

### Error 和 Exception 有什么区别？

Error 通常表示 JVM 或系统级严重问题，应用一般不主动捕获；Exception 是程序可处理异常。

## 易错点

- 不要把所有异常都 catch 后吞掉。
- 不要用异常控制正常业务流程。
- 业务异常要配合统一错误码和日志。

## 记忆钩子

**受检异常编译器逼你管，运行时异常靠代码自己稳。**
