---
title: "Java OOM 怎么排查？"
slug: "java-oom-troubleshooting"
category: "JVM"
tags: ["Java", "JVM", "OOM", "排查"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "项目高频"
order: 770
summary: "按堆、元空间、线程、直接内存等方向定位 OOM 类型和根因。"
---

## 一句话结论

排查 OOM 先看错误类型，再结合堆转储、GC 日志、监控和对象引用链，判断是内存泄漏、流量突增、配置不合理还是资源未释放。

## 通俗解释

OOM 像仓库爆满。你不能只说“仓库太小”，要查是货真的太多、有人一直不清货，还是某类货突然暴涨。

## 面试回答

排查步骤：

1. 看 OOM 类型，比如 Java heap space、Metaspace、unable to create new native thread、Direct buffer memory。
2. 保留现场，配置 `-XX:+HeapDumpOnOutOfMemoryError` 生成 dump。
3. 分析 dump，查看大对象、对象数量、引用链。
4. 看 GC 日志，判断是否频繁 Full GC 但回收效果差。
5. 结合发布记录、流量变化、慢请求和缓存变化定位原因。

常见原因包括集合无限增长、缓存无过期、一次性加载大文件、线程创建过多、类加载泄漏等。

## 常见追问

### 内存泄漏和内存溢出有什么区别？

内存泄漏是对象不再需要但仍被引用，无法回收。内存溢出是内存不够用，泄漏可能导致溢出。

### 线上能不能直接 dump？

要谨慎。dump 可能造成停顿和磁盘压力，最好结合环境、时间窗口和机器状态操作。

## 易错点

- 不要看到 OOM 就只调大堆。
- 不要忽略非堆内存和线程数。
- 不要没有证据就归因 GC。

## 记忆钩子

**OOM 先分类型，再看现场；别一上来只加内存。**
