---
title: "final、finally、finalize 有什么区别？"
slug: "final-finally-finalize"
category: "Java 基础"
tags: ["Java", "final", "异常", "基础"]
difficulty: "easy"
route: "Java 后端上岸路线"
scene: "一面高频"
order: 1010
summary: "区分关键字、异常处理代码块和已不推荐的对象终结方法。"
---

## 一句话结论

final 是关键字，表示不可变或不可继承；finally 是异常处理里的收尾代码块；finalize 是对象回收前可能调用的方法，已经不推荐使用。

## 通俗解释

final 像盖章定稿，不能随便改。finally 像离开实验室前必须关灯关门。finalize 像旧时代的临终遗言，什么时候说、说不说都不可靠。

## 面试回答

final 可以修饰变量、方法和类。修饰变量表示引用不可变或基本值不可变；修饰方法表示不能被重写；修饰类表示不能被继承。

finally 通常用于释放资源，比如关闭流、释放连接。

finalize 是 Object 的方法，GC 回收对象前可能调用，但执行时机不可控，也可能不执行，现代 Java 已经不推荐依赖它。

## 常见追问

### finally 一定会执行吗？

大多数情况下会执行，但如果 JVM 直接退出、线程被强制停止、机器断电等极端情况，不一定执行。

### final 修饰对象引用是什么意思？

引用不能再指向其他对象，但对象内部状态是否可变取决于对象本身。

## 易错点

- 不要把 final 和不可变对象完全等同。
- 不要依赖 finalize 释放资源。
- finally 也不是绝对百分百执行。

## 记忆钩子

**final 定稿，finally 收尾，finalize 别依赖。**
