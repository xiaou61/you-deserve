---
title: "BlockingQueue 有什么用？"
slug: "blockingqueue"
category: "Java 并发"
tags: ["Java", "BlockingQueue", "线程池", "生产者消费者"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "一面/二面高频"
order: 2300
summary: "BlockingQueue 是阻塞队列，常用于生产者消费者模型，也是线程池任务队列的重要基础。"
---

## 一句话结论

BlockingQueue 是支持阻塞插入和阻塞获取的线程安全队列，常用于生产者消费者模型和线程池任务排队。

## 通俗解释

它像食堂取餐窗口。没饭时消费者等着，有饭时取走；窗口满了，生产者也要等一等。

## 面试回答

BlockingQueue 主要能力：

- 队列为空时，消费者获取会阻塞。
- 队列满时，生产者放入会阻塞。
- 内部保证线程安全。

常见实现：

- ArrayBlockingQueue：数组有界队列。
- LinkedBlockingQueue：链表队列，可有界也可近似无界。
- PriorityBlockingQueue：优先级队列。
- SynchronousQueue：不存储元素，直接交接。

线程池中的工作队列就是 BlockingQueue 的典型应用。

## 常见追问

### put 和 offer 有什么区别？

`put` 满了会阻塞等待，`offer` 可以立即返回失败，也可以设置超时时间。

### 为什么线程池不建议用无界队列？

任务堆积时可能导致内存不断增长，最终 OOM。

## 易错点

- 不要忽略队列容量。
- 阻塞队列不能替代所有限流设计。
- 消费异常要处理，否则消费者线程退出后队列会堆积。

## 记忆钩子

**BlockingQueue 是会让生产者和消费者排队的安全窗口。**
