---
title: "CompletableFuture 适合解决什么问题？"
slug: "completablefuture"
category: "Java 并发"
tags: ["Java", "CompletableFuture", "异步", "并发编排"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "项目高频"
order: 740
summary: "理解异步任务编排、并行调用和结果组合，而不是只会 new Thread。"
---

## 一句话结论

CompletableFuture 适合做异步任务编排，比如并行调用多个接口、结果组合、异常兜底和任务链式处理。

## 通俗解释

你要做一份报告，需要同时问财务、运营、技术三个同学拿数据。串行问很慢，并行问更快。CompletableFuture 就像帮你同时发起多个任务，等结果回来再汇总。

## 面试回答

CompletableFuture 常见能力：

- `supplyAsync` 异步执行有返回值任务。
- `thenApply` 对结果做转换。
- `thenCompose` 串联依赖任务。
- `thenCombine` 合并两个任务结果。
- `allOf` 等待多个任务完成。
- `exceptionally` 或 `handle` 处理异常。

项目里常用于聚合接口，比如首页需要并行查询用户信息、订单数量、优惠券等，减少总体响应时间。

## 常见追问

### 使用 CompletableFuture 要注意什么？

要注意线程池隔离、异常处理、超时控制和上下文传递。不要所有异步任务都丢到公共 ForkJoinPool。

### allOf 返回什么？

`allOf` 返回 `CompletableFuture<Void>`，只表示全部完成。具体结果要从原来的 future 中取。

## 易错点

- 不要忽略异常，否则异步任务失败可能不明显。
- 不要滥用默认线程池。
- 不要把异步当成无限提速，外部资源也有瓶颈。

## 记忆钩子

**CompletableFuture 是异步编排器：并行做事，回来汇总。**
