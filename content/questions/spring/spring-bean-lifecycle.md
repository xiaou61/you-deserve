---
title: Spring Bean 生命周期有哪些关键步骤？
slug: spring-bean-lifecycle
category: Spring
tags:
  - Java
  - Spring
  - Bean
  - 生命周期
difficulty: medium
route: Java 后端上岸路线
scene: 一面/二面高频
order: 190
summary: 按实例化、属性填充、初始化、使用、销毁理解 Bean 生命周期。
---
## 一句话结论

Spring Bean 生命周期可以简化理解为：实例化、属性填充、Aware 回调、BeanPostProcessor 前置处理、初始化、BeanPostProcessor 后置处理、使用、销毁。

## 通俗解释

Spring 创建 Bean 像培养一个员工入职。先招人进来，再分配工位和工具，然后告诉他公司环境，入职培训，正式上岗，离职时再做收尾。

Bean 生命周期就是 Spring 从创建对象到销毁对象的完整管理流程。

## 面试回答

常见流程可以这样说：

1. 实例化 Bean，也就是创建对象。
2. 属性填充，完成依赖注入。
3. 如果实现了 Aware 接口，回调相关方法，让 Bean 感知容器信息。
4. 执行 BeanPostProcessor 的前置处理。
5. 执行初始化方法，比如 `@PostConstruct`、`InitializingBean`、自定义 init-method。
6. 执行 BeanPostProcessor 的后置处理，这一步也常和 AOP 代理创建有关。
7. Bean 可以被业务使用。
8. 容器关闭时执行销毁逻辑，比如 `@PreDestroy`、`DisposableBean`、destroy-method。

## 常见追问

### BeanPostProcessor 在哪里执行？

初始化前后各执行一次，afterInitialization 阶段经常用于返回代理对象。

### @PostConstruct 和 InitializingBean 谁先？

通常 @PostConstruct 由后处理器在初始化方法前处理，然后执行 InitializingBean 和自定义 initMethod。

### prototype Bean 会自动销毁吗？

容器负责创建和注入，但通常不完整管理销毁回调，需要业务方自己处理资源释放。

### AOP 代理在生命周期哪个阶段形成？

通常在初始化后处理器阶段返回代理对象，最终注入给其他 Bean 的可能是代理。

## 易错点

- 不要把 Bean 定义处理和 Bean 实例处理混为一谈。
- 不要只背生命周期名词，要能串成创建流程。
- 不要忘记 AOP 代理和后置处理器的关系。

## 详细讲解

Spring Bean 生命周期有哪些关键步骤，这类题其实是在问“一个对象从配置到可用，中间被 Spring 接了几次手”。先用一句话压住主线，比如 按实例化、属性填充、初始化、使用、销毁理解 Bean 生命周期，然后直接按时间顺序讲，而不是散着背一堆接口名。

更顺的讲法，是先把“定义阶段”和“实例阶段”拆开。容器先拿到 BeanDefinition，知道这个 Bean 叫什么、依赖谁、作用域是什么；真正创建时，再经历实例化、属性填充、Aware 回调、初始化前后扩展、初始化方法、最终暴露给业务使用。只要这条时间线清楚，很多平时零散的概念就能自动挂到对应位置上。

这题最容易失分的地方，就是把几个相邻阶段讲混。比如有人会把 `BeanPostProcessor` 说成实例化前执行，也有人分不清 `@PostConstruct`、`InitializingBean`、自定义 init-method 的先后。面试官追这题，往往不是想听术语，而是看你有没有“时间轴感”，知道哪一步先、哪一步后、哪一步还能改对象。

继续追问时，常见方向是“BeanPostProcessor 在哪里执行”和“@PostConstruct 和 InitializingBean 谁先”。这里比较好的答法，是直接做最小实验：在构造器、setter、`@PostConstruct`、`afterPropertiesSet`、自定义 init-method、前后置处理器里都打日志，看最终输出顺序。生命周期题一旦能落到时序日志，就比抽象概念可信得多。

放回项目里，很多问题本质上都是生命周期顺序没搞清。太早使用依赖，结果对象还没注入完整；初始化后被代理包了一层，调试时发现运行时类型和源码类不同；销毁阶段忘了释放资源，线程池和连接迟迟不关。读者只要知道这些坏法，生命周期就不会再像背诵题，而会像排障基础题。

这里也有取舍。Spring 给了很多回调和扩展点，让对象在不同阶段都能被接管，代价就是启动路径更长、理解门槛更高。越靠近生命周期中后段，越像在给对象“定型”，这也是为什么全局扩展一旦写得重，启动时间和调试复杂度都会明显上升。

最后收口时，可以把这题讲成“Spring 先知道 Bean 的定义，再把实例造出来、填好依赖、跑完初始化、最后交给业务使用；如果你连时序都能证明出来，这题就已经从背八股升级成理解容器运行过程了”。这样答案会更完整，也更像一个真正用过 Spring 的人。

## 图解提示

适合画一张完整时间轴：BeanDefinition 注册 -> 实例化 -> 属性填充 -> Aware 回调 -> `postProcessBeforeInitialization` -> `@PostConstruct` / `afterPropertiesSet` / init-method -> `postProcessAfterInitialization` -> 对外使用 -> 销毁。重点是让每个回调点都挂在时间线上，不要只画成一个大黑盒。

## 记忆钩子

**Spring 造 Bean：先造人，再装配，再培训，最后可能套一层代理工牌。**
