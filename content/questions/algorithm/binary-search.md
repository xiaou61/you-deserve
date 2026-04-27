---
title: "二分查找最容易错在哪里？"
slug: "binary-search"
category: "数据结构与算法"
tags: ["算法", "二分", "数组"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "笔试/手撕高频"
order: 620
summary: "重点掌握边界、循环条件和 mid 计算，避免死循环。"
---

## 一句话结论

二分查找最容易错在边界定义不清：到底是闭区间 `[left, right]`，还是左闭右开 `[left, right)`，循环条件和指针更新必须配套。

## 通俗解释

二分像在字典里查词。你每次翻中间，但要明确查过的那一页还要不要保留。如果规则不统一，就可能漏掉答案或一直翻同一页。

## 面试回答

写二分前先确定区间语义。常见闭区间写法：

```text
left = 0, right = n - 1
while left <= right:
    mid = left + (right - left) / 2
    if nums[mid] == target: return mid
    if nums[mid] < target: left = mid + 1
    else: right = mid - 1
```

如果查找左边界或右边界，更新规则要更谨慎，通常不要在相等时立刻返回，而是继续收缩范围。

## 常见追问

### mid 为什么写成 left + (right - left) / 2？

避免 `left + right` 在某些语言里整数溢出。

### 二分只能用于有序数组吗？

常规二分需要单调性，不一定必须是数组。只要答案空间有单调判断，也可以二分答案。

## 易错点

- 不要混用闭区间和开区间写法。
- 不要让 `left = mid` 或 `right = mid` 导致死循环。
- 不要忘记二分本质依赖单调性。

## 记忆钩子

**二分先定边界：查过的中点，要么返回，要么明确扔掉。**
