---
title: "MySQL Buffer Pool 是什么？"
slug: "mysql-buffer-pool"
category: "MySQL"
tags: ["MySQL", "InnoDB", "Buffer Pool", "缓存"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "二面高频"
order: 1510
summary: "Buffer Pool 是 InnoDB 的内存缓存，用来缓存数据页和索引页，减少磁盘 IO。"
---

## 一句话结论

Buffer Pool 是 InnoDB 最重要的内存缓存区域，用来缓存数据页、索引页等内容，减少频繁访问磁盘。

## 通俗解释

磁盘像仓库，内存像办公桌。常用资料放在桌上，查起来快很多；不用每次都跑去仓库翻。

## 面试回答

InnoDB 以页为单位读写数据。查询数据时，如果目标页已经在 Buffer Pool 中，可以直接从内存读取；如果不在，就从磁盘加载到 Buffer Pool。

更新数据时，也通常先修改 Buffer Pool 中的数据页，这种被修改但还没刷盘的页叫脏页。之后由后台线程按策略刷回磁盘。

Buffer Pool 还会配合 LRU 等机制淘汰冷数据，保留热点数据。

## 常见追问

### Buffer Pool 越大越好吗？

不是绝对越大越好。它通常应该根据机器内存和 MySQL 使用场景配置，太小命中率低，太大可能挤压系统其他内存。

### 脏页是什么？

脏页是内存中已经被修改，但还没有同步写回磁盘的数据页。

## 易错点

- 不要把 Buffer Pool 说成 Redis 缓存。
- 它缓存的是页，不是单条记录。
- 更新不是每次都立刻写磁盘，redo log 和刷脏机制也很关键。

## 记忆钩子

**Buffer Pool 是 InnoDB 的办公桌，热数据先放桌上。**
