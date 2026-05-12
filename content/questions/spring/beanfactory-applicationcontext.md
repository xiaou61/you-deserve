---
title: BeanFactory 和 ApplicationContext 有什么区别？
slug: beanfactory-applicationcontext
category: Spring
tags:
  - Spring
  - BeanFactory
  - ApplicationContext
  - IoC
difficulty: medium
route: Java 后端上岸路线
scene: 一面/二面高频
order: 1890
summary: BeanFactory 是基础 IoC 容器，ApplicationContext 在其基础上提供事件、国际化、资源加载等企业级能力。
---
## 一句话结论

BeanFactory 是 Spring 最基础的 IoC 容器，ApplicationContext 是更完整的应用上下文，提供事件、国际化、资源加载、自动装配等更多能力。

## 通俗解释

BeanFactory 像一个仓库，只负责创建和管理对象；ApplicationContext 像完整公司系统，除了仓库，还有通知、配置、资源和流程管理。

## 面试回答

BeanFactory 提供最基础的 Bean 创建、获取和依赖注入能力。

ApplicationContext 继承并扩展了 BeanFactory，常见增强包括：

- 国际化消息。
- 事件发布和监听。
- 资源加载。
- 更方便的注解和自动装配支持。
- 与 Web、AOP、事务等模块更好集成。

实际开发中，我们几乎直接使用 ApplicationContext。

## 常见追问

### ApplicationContext 为什么更常用？

它集成事件、资源、国际化、环境、生命周期和 Web 能力，适合完整应用开发。

### BeanFactory 是不是过时了？

不是。它是底层基础接口，ApplicationContext 也是基于它扩展出来的。

### 预实例化单例有什么好处？

能在启动期提前发现依赖缺失、配置错误和 Bean 创建失败，避免运行时才暴露。

### BeanPostProcessor 谁来管理？

ApplicationContext refresh 过程中会注册并应用这些扩展点，支持 AOP、事务等能力。

## 易错点

- 不要说二者完全无关。
- ApplicationContext 不是只多了一个名字，而是扩展了很多应用能力。
- 实际项目通常用 ApplicationContext。

## 详细讲解

BeanFactory 和 ApplicationContext 有什么区别，这类题看起来像在比两个接口，实际上是在问“你平时用的到底是一个最小容器，还是一个完整应用上下文”。先用一句话压住主线，比如 BeanFactory 是基础 IoC 容器，ApplicationContext 在其基础上提供事件、国际化、资源加载等企业级能力，然后别急着往生命周期里绕，先把“能力边界”说清楚。

更顺的讲法，是先把两者放在分层关系里看。BeanFactory 解决的是最核心的“创建 Bean、保存 Bean、按需取 Bean”问题，可以理解成容器能力的最小内核；ApplicationContext 则是在这个内核外面补上完整应用开发需要的上下文能力，比如环境配置、事件机制、资源访问、国际化、生命周期管理以及和 AOP、事务、Web 模块的整合。这样一说，面试官就能听出你知道它们不是并列替代品，而是“底座”和“整机”的关系。

这题最容易答浅的地方，是把差异说成“ApplicationContext 只是功能更多”。真正关键的不只是“更多”，而是“默认行为也不同”。例如 ApplicationContext 往往会在 refresh 阶段预实例化大量单例 Bean，因此很多配置错误和依赖问题会在启动期提前暴露；BeanFactory 则更偏按需获取，用得更底层、更克制。把这个启动时机差别讲出来，答案立刻会更像实际开发经验。

继续追问时，常见方向是“ApplicationContext 为什么更常用”和“BeanFactory 是不是过时了”。这里比较好的答法，是直接给出观察抓手：看应用启动时是否已经提前创建单例、看 refresh 过程中注册了哪些后处理器和监听器、看事件发布、资源加载、环境属性解析是不是开箱即用。只要你能把“为什么业务开发几乎总是直接拿 ApplicationContext”说成一组可见能力，而不是一句抽象判断，这题就很稳。

放回项目里，两者差异非常实际。你日常写 Spring Boot 服务，几乎总是在 ApplicationContext 这个层次工作，因为日志、配置、事件、事务、注解驱动能力都已经帮你接好了；但很多框架底层、容器扩展、源码分析时，还是得回到 BeanFactory 这个最小抽象去理解“Bean 到底是怎么被创建和管理的”。所以 BeanFactory 没过时，它只是更少直接出现在业务代码里。

这里也有取舍。ApplicationContext 更完整、更好用，代价是启动路径更长、默认行为更多、理解成本也更高；BeanFactory 更轻，更接近容器本质，但拿来直接支撑完整应用会很费劲。像 不要说二者完全无关 这种提醒，本质上是在告诉你：这不是“老接口和新接口”的关系，而是“底层基础设施和上层工程化封装”的关系。

最后收口时，可以把这题讲成“BeanFactory 提供最小 IoC 能力，ApplicationContext 在此之上补齐完整应用上下文；为什么业务开发几乎总用后者，为什么理解前者又能帮助你看懂 Spring 底层”。这样答案会比单纯列功能点自然得多。

## 图解提示

适合画一张分层对照图：底层一层画 BeanFactory，只标“Bean 创建、获取、依赖注入”；上层一层画 ApplicationContext，在外面包上事件、环境、国际化、资源加载、生命周期管理、AOP/事务/Web 集成。重点是把“最小容器”和“完整上下文”画成上下层，而不是两个平行方块。

## 记忆钩子

**BeanFactory 是仓库，ApplicationContext 是公司系统。**
