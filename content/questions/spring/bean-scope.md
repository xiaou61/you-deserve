---
title: Spring Bean 有哪些作用域？
slug: spring-bean-scope
category: Spring
tags:
  - Spring
  - Bean
  - 作用域
difficulty: easy
route: Java 后端上岸路线
scene: 一面高频
order: 1100
summary: 理解 singleton、prototype 以及 Web 场景下 request/session 作用域。
---
## 一句话结论

Spring Bean 最常见作用域是 singleton 和 prototype。singleton 是容器内单例，prototype 每次获取创建新对象；Web 场景还有 request、session 等作用域。

## 通俗解释

singleton 像公司共用一台打印机，大家都用同一个。prototype 像每个人领一支新笔，每次都发新的。

## 面试回答

常见作用域：

- singleton：默认作用域，一个 Spring 容器中只有一个 Bean 实例。
- prototype：每次从容器获取都会创建新实例。
- request：一次 HTTP 请求一个实例。
- session：一次 HTTP Session 一个实例。

单例 Bean 如果有可变成员变量，要注意线程安全问题。Spring 单例不是 Java 设计模式里的 JVM 全局单例，它只是在容器范围内单例。

## 常见追问

### singleton 是全 JVM 单例吗？

不是。它通常是单个 Spring 容器内单例，不是整个 JVM 或所有应用共享。

### prototype Bean 谁负责销毁？

Spring 负责创建和注入，但不会完整管理销毁回调，资源释放通常要业务自己处理。

### 单例注入 prototype 为什么不会每次新建？

依赖注入发生在单例创建时，只注入一次。要每次获取新对象，需要 ObjectProvider、lookup method 或代理。

### singleton Bean 一定线程安全吗？

不一定。无状态通常安全，有可变成员状态就要自己保证并发安全。

## 易错点

- 不要把 Spring singleton 说成 JVM 全局单例。
- 不要认为单例 Bean 一定线程安全。
- 不要忘记 prototype 销毁管理问题。

## 详细讲解

Spring Bean 有哪些作用域，这类题表面在考名词，实际上在问“这个对象会活多久、会被多少人共享”。先用一句话压住主线，比如 理解 singleton、prototype 以及 Web 场景下 request/session 作用域，然后不要急着背列表，而是先把读者带到运行时：同一个 Bean 在一次请求里会不会复用，在不同线程之间会不会共享，容器关闭前它会不会一直存在。

更顺的讲法，是先把 singleton 和 prototype 对比清楚。singleton 代表容器里通常只保留一个实例，所以最适合无状态、可复用的服务对象；prototype 则更像“每次取都给你一个新对象”，适合临时状态明显、生命周期更短的组件。到了 Web 场景，request 和 session 又把“活多久”进一步绑到 HTTP 请求和会话上，这样作用域的本质就不再是背单词，而是理解实例边界。

这题最容易答浅的地方，是把“实例个数”和“线程安全”混成一回事。singleton 只是共享一个实例，不代表这个实例内部天然线程安全；prototype 每次新建，也不代表资源释放就有人替你兜底。很多人一听单例就直接说安全，一听原型就觉得没风险，这恰恰是面试官最爱追问的口子。

继续追问时，常见方向就是“singleton 是全 JVM 单例吗”和“prototype Bean 谁负责销毁”。这里比较好的答法，不是继续抽象，而是直接说验证抓手：会看 BeanDefinition 上的 scope、看同一个请求里对象 identity hash code 是否变化、看是否使用了 scoped proxy、看 prototype 持有的连接或文件句柄是否有显式释放逻辑。作用域题越贴近对象实际存活范围，越像真的踩过坑。

放回项目里，错误也很典型。把有状态对象做成 singleton，结果不同请求之间相互串值；把 prototype 注入 singleton 又以为每次都会新建，结果实际只在注入时创建了一次；把 request 作用域对象直接塞进普通单例服务，没有代理就会直接启动报错。读者只要知道这些坏法，作用域这个知识点就会一下子变得很实。

这里也有取舍。更长的生命周期通常意味着更低的创建成本和更好的复用，但共享范围也更大；更短的生命周期意味着隔离更强，但资源管理和创建成本也更靠近业务自己。像 不要把 Spring singleton 说成 JVM 全局单例 这种提醒，本质上就是要你把“共享边界”说准，而不是停在表面术语上。

最后收口时，可以把这题讲成“对象在哪个边界内共享、谁负责创建、谁负责销毁、共享后最怕什么并发问题”的闭环。这样作用域题听起来就不是在背清单，而是在讲对象生命周期设计。

## 图解提示

适合画一张作用域对照图：左边画 singleton 从容器启动到关闭始终复用一个实例，右边画 prototype 每次获取都创建新对象，再补 request/session 跟 HTTP 请求和会话绑定的生命周期。重点不是初始化细节，而是“同一个对象被谁共享、共享多久”。

## 记忆钩子

**singleton 共用一个，prototype 每次新的。**
