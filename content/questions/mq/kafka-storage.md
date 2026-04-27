---
title: "Kafka 消息是怎么存储的？"
slug: "kafka-storage"
category: "消息队列"
tags: ["Kafka", "存储", "Segment", "日志"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "二面加分"
order: 2590
summary: "Kafka 按 topic 分区存储消息，每个分区是追加写日志，并切分成多个 segment 文件。"
---

## 一句话结论

Kafka 按 topic 和 partition 存储消息，每个 partition 本质是顺序追加写的日志文件，并切分成多个 segment。

## 通俗解释

Kafka 分区像一本不断追加的流水账。账本太厚就换一本新册子，每本册子就是一个 segment。

## 面试回答

Kafka 存储特点：

- topic 拆成多个 partition。
- 每个 partition 内消息有递增 offset。
- 消息按顺序追加写入日志文件。
- 日志文件按 segment 切分。
- 通过索引文件加速按 offset 查找。
- 旧数据按保留时间或大小清理。

顺序追加写和页缓存让 Kafka 在高吞吐场景下表现很好。

## 常见追问

### Kafka 为什么吞吐高？

顺序写磁盘、批量发送、零拷贝、页缓存、分区并行等共同提升吞吐。

### offset 是全局唯一吗？

不是。offset 在每个 partition 内递增唯一。

## 易错点

- 不要把 Kafka 消息理解成一条条散落数据库记录。
- 顺序只在单分区内有保证。
- 保留策略会清理旧消息，不是无限保存。

## 记忆钩子

**Kafka 分区是追加账本，segment 是分册。**
