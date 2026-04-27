---
title: "ArrayList 的 fail-fast 是什么？"
slug: "arraylist-fail-fast"
category: "Java 基础"
tags: ["Java", "ArrayList", "fail-fast", "集合"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "一面高频"
order: 1820
summary: "fail-fast 是集合迭代时检测到并发修改后快速失败，常见表现是 ConcurrentModificationException。"
---

## 一句话结论

fail-fast 是集合在迭代过程中发现结构被异常修改时快速失败的机制，常见异常是 `ConcurrentModificationException`。

## 通俗解释

你一边按名单点名，别人一边偷偷改名单。点名的人发现名单版本不对，就直接停下来报错，而不是继续按错名单点。

## 面试回答

ArrayList 迭代器内部会记录一个期望修改次数 `expectedModCount`，集合本身有实际修改次数 `modCount`。

迭代过程中，如果发现两者不一致，说明集合结构可能被迭代器之外的方式修改了，就会抛出 `ConcurrentModificationException`。

正确删除方式通常是使用迭代器自己的 `remove` 方法，或者使用 `removeIf` 等安全方式。

## 常见追问

### fail-fast 能保证并发安全吗？

不能。它只是尽力发现错误修改，不是线程安全保证。

### 为什么增强 for 删除元素容易报错？

增强 for 底层使用迭代器，如果直接调用集合的 `remove`，会绕开迭代器的修改记录，导致版本不一致。

## 易错点

- fail-fast 不是线程安全机制。
- 不要在增强 for 里直接删除集合元素。
- 并发场景应该使用并发集合或加锁。

## 记忆钩子

**迭代看名单，名单被偷改就立刻报错。**
