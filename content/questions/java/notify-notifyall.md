---
title: "notify 和 notifyAll 有什么区别？"
slug: "notify-notifyall"
category: "Java 并发"
tags: ["Java", "notify", "notifyAll", "线程通信"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "一面/二面高频"
order: 1870
summary: "notify 随机唤醒一个等待线程，notifyAll 唤醒所有等待线程，实际能继续执行还要重新竞争锁。"
---

## 一句话结论

`notify` 唤醒一个等待在该对象上的线程，`notifyAll` 唤醒所有等待线程；被唤醒后线程还要重新竞争锁才能继续执行。

## 通俗解释

`notify` 像只喊一个人来办事，`notifyAll` 像把所有等候的人都叫醒，让他们自己重新排队抢窗口。

## 面试回答

两者都必须在持有对象锁时调用。

- `notify`：唤醒一个等待线程，具体哪个线程不保证。
- `notifyAll`：唤醒所有等待线程。

实际开发中，如果多个线程等待的条件不同，使用 `notify` 可能唤醒不该唤醒的线程，导致真正需要执行的线程继续沉睡。因此很多场景更推荐 `notifyAll`，再让线程用 while 循环重新检查条件。

## 常见追问

### 被 notify 后线程会立刻执行吗？

不会。它只是从等待队列进入锁竞争，必须等当前线程释放锁后才有机会继续执行。

### 为什么 wait 常用 while 而不是 if？

因为可能出现虚假唤醒或条件被其他线程改变，醒来后要重新检查条件。

## 易错点

- notify 不保证唤醒哪个线程。
- notifyAll 不是让所有线程同时执行。
- wait 条件判断通常要用 while。

## 记忆钩子

**notify 叫醒一个，notifyAll 叫醒一群，醒了还要抢锁。**
