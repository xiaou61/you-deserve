---
title: "equals 和 hashCode 为什么要一起重写？"
slug: "equals-hashcode"
category: "Java 基础"
tags: ["Java", "equals", "hashCode", "集合"]
difficulty: "easy"
route: "Java 后端上岸路线"
scene: "一面高频"
order: 410
summary: "从 HashMap/HashSet 的查找流程理解 equals 和 hashCode 的契约。"
---

## 一句话结论

如果两个对象通过 `equals` 判断相等，它们的 `hashCode` 必须相同。否则放进 HashMap 或 HashSet 这类哈希集合时，可能找不到或出现重复。

## 通俗解释

hashCode 像小区门牌号，equals 像确认是不是同一个人。你说两个人是同一个人，但门牌号却不同，保安就会去不同楼栋找，自然找不到。

## 面试回答

哈希集合通常先用 `hashCode` 定位桶，再用 `equals` 判断桶里的对象是否真正相等。

如果只重写 `equals` 不重写 `hashCode`，两个逻辑相等的对象可能得到不同哈希值，被分到不同桶里。这样 `HashSet` 可能存入重复元素，`HashMap` 也可能用等价 key 取不到值。

所以重写 `equals` 时必须保证：

- 自反性、对称性、传递性、一致性。
- `equals` 相等的对象，`hashCode` 必须相同。

## 常见追问

### hashCode 相同，equals 一定相等吗？

不一定。不同对象可能发生哈希冲突，所以还需要 equals 做最终判断。

### 为什么 String 可以安全作为 key？

String 重写了 equals 和 hashCode，并且不可变。不可变对象作为 key 更稳定，不会因为字段变化导致哈希位置变化。

## 易错点

- 不要说 hashCode 相同对象一定相等。
- 不要只重写 equals。
- 不要使用可变字段作为哈希 key 的核心依据。

## 记忆钩子

**hashCode 负责先找楼栋，equals 负责确认本人。**
