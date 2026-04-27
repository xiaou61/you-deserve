---
title: "Redis Bitmap 和 HyperLogLog 适合什么场景？"
slug: "redis-bitmap-hyperloglog"
category: "Redis"
tags: ["Redis", "Bitmap", "HyperLogLog", "数据结构"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "项目加分"
order: 2050
summary: "Bitmap 适合布尔状态统计，HyperLogLog 适合大规模去重计数但有误差。"
---

## 一句话结论

Bitmap 适合记录签到、在线状态这类布尔信息，HyperLogLog 适合统计 UV 这类大规模去重数量，但结果有小误差。

## 通俗解释

Bitmap 像一排开关，每个人对应一个开关，开表示做过；HyperLogLog 像估算人群数量的工具，不记住每个人，但能大概算出有多少不同的人。

## 面试回答

Bitmap 本质上用 bit 位表示状态，适合：

- 用户签到。
- 活跃状态。
- 是否领取过奖励。

HyperLogLog 用于基数统计，适合：

- UV 统计。
- 大规模去重计数。

Bitmap 精确但适合 ID 范围可控的布尔场景。HyperLogLog 占用空间小，但统计结果有误差，不适合要求精确的金额、库存等场景。

## 常见追问

### HyperLogLog 能拿到具体用户列表吗？

不能。它只用于估算去重数量，不保存完整元素集合。

### Bitmap 会不会浪费空间？

如果用户 ID 非常稀疏且跨度巨大，Bitmap 可能浪费空间。

## 易错点

- HyperLogLog 有误差，不能用于强精确统计。
- Bitmap 适合布尔状态，不适合存复杂对象。
- 选择结构要看数据范围和精度要求。

## 记忆钩子

**Bitmap 记开关，HyperLogLog 估人数。**
