---
title: "ArrayList 和 LinkedList 有什么区别？"
slug: "arraylist-linkedlist"
category: "Java 基础"
tags: ["Java", "集合", "ArrayList", "LinkedList"]
difficulty: "easy"
route: "Java 后端上岸路线"
scene: "一面高频"
order: 200
summary: "从底层结构、随机访问、插入删除和真实业务选择对比两个 List。"
---

## 一句话结论

ArrayList 底层是动态数组，随机访问快；LinkedList 底层是双向链表，理论上中间插入删除更方便，但真实业务里 ArrayList 更常用。

## 通俗解释

ArrayList 像一排连续座位，你知道第几个座位就能直接走过去。LinkedList 像一串手拉手的人，想找第 N 个通常要一个个数过去。

所以 ArrayList 查得快，LinkedList 找位置慢。链表插入删除本身快，但前提是你已经找到了位置。

## 面试回答

可以从四点答：

1. 底层结构不同。ArrayList 是数组，LinkedList 是双向链表。
2. 随机访问不同。ArrayList 支持按下标 O(1) 访问，LinkedList 需要遍历。
3. 插入删除不同。ArrayList 在中间插入删除要移动元素；LinkedList 找到节点后修改指针即可。
4. 内存占用不同。LinkedList 每个节点要额外存前后指针，空间开销更大，缓存局部性也不如数组。

实际开发里，大多数场景优先 ArrayList。除非你非常明确需要频繁在头尾操作，否则 LinkedList 不一定有优势。

## 常见追问

### LinkedList 插入删除一定比 ArrayList 快吗？

不一定。如果插入删除发生在中间，LinkedList 先找到位置也要遍历，这部分成本可能很高。

### ArrayList 扩容怎么做？

容量不足时会创建更大的新数组，把旧元素复制过去。扩容有成本，所以如果提前知道大概数量，可以指定初始容量。

## 易错点

- 不要简单背“ArrayList 查快，LinkedList 增删快”，这句话太粗。
- 不要忽略 LinkedList 的节点额外内存开销。
- 不要忘记 ArrayList 在真实业务里通常更常用。

## 记忆钩子

**数组像座位表，链表像拉手队伍；找人时座位表更快。**
