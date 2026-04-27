---
title: "直接内存是什么？为什么会 OOM？"
slug: "jvm-direct-memory"
category: "JVM"
tags: ["Java", "JVM", "直接内存", "NIO"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "二面/线上排查"
order: 1440
summary: "直接内存不在 Java 堆里，常用于 NIO，使用不当也会触发 Direct buffer memory OOM。"
---

## 一句话结论

直接内存是 JVM 堆外的一块内存，常用于 NIO 提升 IO 效率，但申请过多或释放不及时也会导致 OOM。

## 通俗解释

Java 堆像公司内部仓库，直接内存像外部临时仓库。它不占内部仓库面积，但租太多一样会把预算耗光。

## 面试回答

直接内存不是 JVM 堆的一部分，但仍然受机器物理内存和 JVM 参数限制。NIO 的 `ByteBuffer.allocateDirect()` 会申请直接内存，减少 Java 堆和本地内存之间的数据拷贝。

优点是 IO 性能更好，缺点是分配和释放成本较高，而且不直接受普通堆 GC 管控。如果大量申请直接内存又释放不及时，可能出现 `OutOfMemoryError: Direct buffer memory`。

排查时要关注：

- 是否大量使用 DirectByteBuffer。
- Netty、NIO、文件传输等组件是否配置过大。
- `-XX:MaxDirectMemorySize` 是否合理。
- 是否存在资源未关闭。

## 常见追问

### 直接内存属于堆吗？

不属于 Java 堆，它是堆外内存，但 DirectByteBuffer 对象本身在堆里。

### 为什么直接内存适合 IO？

因为它可以减少一次从 Java 堆复制到本地内存的过程，对高性能网络和文件 IO 更友好。

## 易错点

- 不要以为堆没满就不会 OOM。
- 不要忽略 Netty 等框架对直接内存的使用。
- 直接内存也要限制和监控。

## 记忆钩子

**堆外不等于免费，外部仓库租多了也会爆。**
