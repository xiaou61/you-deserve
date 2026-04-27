---
title: "wait 和 sleep 有什么区别？"
slug: "wait-sleep"
category: "Java 并发"
tags: ["Java", "wait", "sleep", "线程"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "一面高频"
order: 1860
summary: "wait 会释放对象锁并等待唤醒，sleep 只是让当前线程暂停一段时间，不释放锁。"
---

## 一句话结论

`wait` 会释放当前对象锁并进入等待，必须在同步块里使用；`sleep` 只是让线程暂停指定时间，不会释放已经持有的锁。

## 通俗解释

`wait` 像你把会议室钥匙交出来，等别人通知你再回来；`sleep` 像你拿着钥匙在会议室里睡觉，别人进不来。

## 面试回答

主要区别：

- 所属类不同：`wait` 是 Object 方法，`sleep` 是 Thread 静态方法。
- 锁行为不同：`wait` 会释放对象锁，`sleep` 不释放锁。
- 使用条件不同：`wait` 必须在同步代码块或同步方法中调用。
- 唤醒方式不同：`wait` 需要 `notify`、`notifyAll` 或超时唤醒；`sleep` 时间到自动恢复。

线程协作场景用 `wait/notify`，简单暂停用 `sleep`。

## 常见追问

### wait 为什么要放在 synchronized 里？

因为 `wait` 操作的是对象监视器，必须先持有该对象锁，才能释放并进入等待队列。

### sleep 会不会让出 CPU？

会让当前线程暂停一段时间，但不会释放已经持有的对象锁。

## 易错点

- 不要说 sleep 会释放锁。
- `wait` 要配合同一个锁对象的 `notify` 使用。
- 实际开发更推荐高级并发工具，而不是手写复杂 wait/notify。

## 记忆钩子

**wait 交钥匙等通知，sleep 抱钥匙睡一会。**
