---
title: "Optional 解决什么问题？"
slug: "java-optional"
category: "Java 基础"
tags: ["Java", "Optional", "空指针", "代码可读性"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "一面/代码规范"
order: 2270
summary: "Optional 用来显式表达可能为空的返回值，减少空指针风险，但不适合滥用于字段和参数。"
---

## 一句话结论

Optional 用来显式表达一个值可能存在也可能不存在，主要用于方法返回值，帮助减少空指针和层层 if 判空。

## 通俗解释

Optional 像一个快递盒。盒子可能有东西，也可能是空盒。你拿到盒子就知道要先检查，不会假装里面一定有东西。

## 面试回答

Optional 常用于：

- 表达查询结果可能为空。
- 用 `orElse`、`orElseGet` 提供默认值。
- 用 `map`、`flatMap` 做链式处理。
- 避免直接返回 null。

但 Optional 不建议滥用在实体字段、DTO 字段和方法参数上。它更适合作为返回值表达“可能没有”。

## 常见追问

### orElse 和 orElseGet 有什么区别？

`orElse` 的默认值会提前计算，`orElseGet` 是需要时才调用 Supplier，默认值计算昂贵时更适合用 `orElseGet`。

### Optional 能彻底消灭空指针吗？

不能。它只是让空值语义更清晰，代码仍然要正确使用。

## 易错点

- 不要直接 `optional.get()` 而不判断。
- 不要把所有字段都包成 Optional。
- Optional 不是性能优化工具。

## 记忆钩子

**Optional 是空盒提醒：先看有没有，再取东西。**
