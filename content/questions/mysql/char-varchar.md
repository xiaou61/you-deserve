---
title: "char 和 varchar 有什么区别？"
slug: "mysql-char-varchar"
category: "MySQL"
tags: ["MySQL", "char", "varchar", "字段类型"]
difficulty: "easy"
route: "Java 后端上岸路线"
scene: "一面基础"
order: 2000
summary: "char 是定长字符串，varchar 是变长字符串，选择时要看长度是否固定和空间利用率。"
---

## 一句话结论

`char` 是定长字符串，`varchar` 是变长字符串；长度固定的数据适合 char，长度变化大的数据更适合 varchar。

## 通俗解释

char 像固定大小快递盒，不管东西多少盒子一样大；varchar 像按物品大小选盒子，更省空间。

## 面试回答

主要区别：

- char 定长，不足长度可能补空格，存取更简单。
- varchar 变长，会额外记录长度，更节省空间。
- char 适合固定长度字段，比如性别、状态码、固定长度编码。
- varchar 适合姓名、标题、备注等长度变化明显的字段。

实际选择还要考虑字符集、索引长度和业务查询方式。

## 常见追问

### varchar 长度是不是越大越好？

不是。过大的字段长度会影响索引、内存临时表和表设计可读性。

### 手机号用 char 还是 varchar？

如果格式固定且作为字符串处理，可以用 char；实际也要看业务是否有国家区号等变化。

## 易错点

- 不要把手机号存成数字，前导 0、国家区号都可能有问题。
- varchar 不是无限制随便设。
- 字符数和字节数受字符集影响。

## 记忆钩子

**char 固定盒，varchar 弹性盒。**
